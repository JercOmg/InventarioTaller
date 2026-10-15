import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { moverStock } from '../services/inventario';
import { registrarAuditoria } from '../services/auditoria';

export const migracionRouter = Router();
migracionRouter.use(autenticar);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    cb(null, ok);
  },
});

interface ErrorFila {
  fila: number;
  columna: string;
  mensaje: string;
}

function leerFilas(buffer: Buffer): { fila: number; datos: Record<string, unknown> }[] {
  const libro = XLSX.read(buffer, { type: 'buffer' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '' });
  return json.map((datos, i) => ({ fila: i + 2, datos })); // +2: la fila 1 son encabezados
}

function texto(v: unknown): string {
  return String(v ?? '').trim();
}

/**
 * POST /api/migracion — carga masiva desde Excel — RF-23.
 * Pre-valida TODO el archivo en memoria; si existe cualquier error (incluidos
 * duplicados internos o contra la base) aborta la importación completa y
 * devuelve el reporte de filas problemáticas.
 */
migracionRouter.post(
  '/',
  requierePermiso('migracion.ejecutar'),
  upload.single('archivo'),
  async (req, res, next) => {
    try {
      const tipo = z.enum(['CATALOGO', 'TERCEROS', 'SALDOS_INICIALES']).parse(req.body?.tipo);
      if (!req.file) throw ApiError.badRequest('Debe adjuntar el archivo Excel (.xlsx/.csv)');
      const filas = leerFilas(req.file.buffer);
      if (filas.length === 0) throw ApiError.badRequest('El archivo no contiene registros');
      if (filas.length > 5000) throw ApiError.badRequest('El archivo excede el límite de 5000 filas por importación');

      const errores: ErrorFila[] = [];
      const vistos = new Map<string, number>(); // clave única → fila

      if (tipo === 'CATALOGO') {
        for (const { fila, datos } of filas) {
          const codigoBarras = texto(datos['codigoBarras']);
          const producto = texto(datos['producto']);
          const marca = texto(datos['marca']);
          const presentacion = texto(datos['presentacion']);
          const unidadBase = texto(datos['unidadBase']);
          const precioVenta = Number(datos['precioVenta'] ?? 0);
          if (!codigoBarras) errores.push({ fila, columna: 'codigoBarras', mensaje: 'El código de barras es obligatorio' });
          if (!producto) errores.push({ fila, columna: 'producto', mensaje: 'El producto es obligatorio' });
          if (!marca) errores.push({ fila, columna: 'marca', mensaje: 'La marca es obligatoria' });
          if (!presentacion) errores.push({ fila, columna: 'presentacion', mensaje: 'La presentación es obligatoria' });
          if (!unidadBase) errores.push({ fila, columna: 'unidadBase', mensaje: 'La unidad base es obligatoria' });
          if (Number.isNaN(precioVenta) || precioVenta < 0) {
            errores.push({ fila, columna: 'precioVenta', mensaje: 'El precio debe ser un número mayor o igual a cero' });
          }
          if (codigoBarras) {
            if (vistos.has(codigoBarras)) {
              errores.push({
                fila,
                columna: 'codigoBarras',
                mensaje: `Código de barras duplicado dentro del archivo (también en la fila ${vistos.get(codigoBarras)})`,
              });
            } else {
              vistos.set(codigoBarras, fila);
            }
          }
        }
        if (errores.length === 0) {
          const existentes = await prisma.referenciaVendible.findMany({
            where: { codigoBarras: { in: [...vistos.keys()] } },
            select: { codigoBarras: true },
          });
          for (const e of existentes) {
            errores.push({ fila: vistos.get(e.codigoBarras)!, columna: 'codigoBarras', mensaje: `El código de barras ${e.codigoBarras} ya existe en la base de datos` });
          }
        }
        if (errores.length > 0) return rechazar(req, res, tipo, filas.length, errores);

        const resultado = await prisma.$transaction(async (tx) => {
          const cache = new Map<string, number>();
          const getOrCreate = async (tabla: 'marca' | 'presentacion' | 'unidad' | 'producto', nombre: string, extra?: object): Promise<number> => {
            const clave = `${tabla}:${nombre}`;
            if (cache.has(clave)) return cache.get(clave)!;
            let id: number;
            if (tabla === 'marca') {
              const r = await tx.marca.upsert({ where: { nombre }, update: {}, create: { nombre } });
              id = r.id;
            } else if (tabla === 'presentacion') {
              const r = await tx.presentacion.upsert({ where: { nombre }, update: {}, create: { nombre } });
              id = r.id;
            } else if (tabla === 'unidad') {
              const r = await tx.unidadMedida.upsert({ where: { codigo: nombre }, update: {}, create: { codigo: nombre, nombre } });
              id = r.id;
            } else {
              const existente = await tx.producto.findFirst({ where: { nombre } });
              const r = existente ?? (await tx.producto.create({ data: { nombre, ...(extra ?? {}) } }));
              id = r.id;
            }
            cache.set(clave, id);
            return id;
          };
          let filasOk = 0;
          for (const { datos } of filas) {
            const productoId = await getOrCreate('producto', texto(datos['producto']), {
              controlVencimiento: texto(datos['controlVencimiento']).toLowerCase() === 'si',
              mesesGarantia: Number(datos['mesesGarantia'] ?? 0) || 0,
            });
            const marcaId = await getOrCreate('marca', texto(datos['marca']));
            const presentacionId = await getOrCreate('presentacion', texto(datos['presentacion']));
            const unidadBaseId = await getOrCreate('unidad', texto(datos['unidadBase']));
            const ref = await tx.referenciaVendible.create({
              data: {
                productoId,
                marcaId,
                presentacionId,
                codigoBarras: texto(datos['codigoBarras']),
                unidadBaseId,
                fraccionMinima: Number(datos['fraccionMinima'] ?? 1) || 1,
                precioVenta: Number(datos['precioVenta'] ?? 0),
              },
            });
            await tx.inventarioSaldo.create({ data: { referenciaId: ref.id } });
            filasOk++;
          }
          await registrarAuditoria(tx, {
            tablaAfectada: 'migraciones',
            registroId: 0,
            accion: 'INSERT',
            entidad: 'migracion',
            usuarioId: req.usuario!.id,
            direccionIp: req.ipCliente,
            estadoNuevo: { tipo, archivo: req.file!.originalname, filasOk },
          });
          return filasOk;
        });
        const migracion = await prisma.migracion.create({
          data: {
            archivo: req.file.originalname,
            tipo,
            estado: 'PROCESADA',
            totalFilas: filas.length,
            filasOk: resultado,
            usuarioId: req.usuario!.id,
          },
        });
        return res.status(201).json({ id: migracion.id, estado: 'PROCESADA', filasOk: resultado });
      }

      if (tipo === 'TERCEROS') {
        for (const { fila, datos } of filas) {
          const identificacion = texto(datos['identificacion']);
          const tipoPersona = texto(datos['tipoPersona']).toUpperCase() || 'NATURAL';
          const esCliente = texto(datos['esCliente']).toLowerCase() === 'si';
          const esProveedor = texto(datos['esProveedor']).toLowerCase() === 'si';
          if (!identificacion) errores.push({ fila, columna: 'identificacion', mensaje: 'La identificación es obligatoria' });
          if (tipoPersona === 'NATURAL' && (!texto(datos['nombre']) || !texto(datos['apellido']))) {
            errores.push({ fila, columna: 'nombre', mensaje: 'Persona natural: nombre y apellido obligatorios' });
          }
          if (tipoPersona === 'JURIDICA' && !texto(datos['razonSocial'])) {
            errores.push({ fila, columna: 'razonSocial', mensaje: 'Persona jurídica: razón social obligatoria' });
          }
          if (!esCliente && !esProveedor) {
            errores.push({ fila, columna: 'esCliente', mensaje: 'Debe marcar esCliente o esProveedor con "si"' });
          }
          if (identificacion) {
            if (vistos.has(identificacion)) {
              errores.push({ fila, columna: 'identificacion', mensaje: `Identificación duplicada dentro del archivo (fila ${vistos.get(identificacion)})` });
            } else {
              vistos.set(identificacion, fila);
            }
          }
        }
        if (errores.length === 0) {
          const existentes = await prisma.tercero.findMany({
            where: { identificacion: { in: [...vistos.keys()] } },
            select: { identificacion: true },
          });
          for (const e of existentes) {
            errores.push({ fila: vistos.get(e.identificacion)!, columna: 'identificacion', mensaje: `La identificación ${e.identificacion} ya existe en la base de datos` });
          }
        }
        if (errores.length > 0) return rechazar(req, res, tipo, filas.length, errores);

        const filasOk = await prisma.$transaction(async (tx) => {
          let ok = 0;
          for (const { datos } of filas) {
            await tx.tercero.create({
              data: {
                identificacion: texto(datos['identificacion']),
                tipoPersona: texto(datos['tipoPersona']).toUpperCase() || 'NATURAL',
                nombre: texto(datos['nombre']) || null,
                apellido: texto(datos['apellido']) || null,
                razonSocial: texto(datos['razonSocial']) || null,
                telefono: texto(datos['telefono']) || null,
                email: texto(datos['email']) || null,
                esCliente: texto(datos['esCliente']).toLowerCase() === 'si',
                esProveedor: texto(datos['esProveedor']).toLowerCase() === 'si',
              },
            });
            ok++;
          }
          return ok;
        });
        const migracion = await prisma.migracion.create({
          data: { archivo: req.file.originalname, tipo, estado: 'PROCESADA', totalFilas: filas.length, filasOk, usuarioId: req.usuario!.id },
        });
        return res.status(201).json({ id: migracion.id, estado: 'PROCESADA', filasOk });
      }

      // SALDOS_INICIALES: codigoBarras + cantidad → ajuste de apertura tipo migración
      for (const { fila, datos } of filas) {
        const codigoBarras = texto(datos['codigoBarras']);
        const cantidad = Number(datos['cantidad']);
        if (!codigoBarras) errores.push({ fila, columna: 'codigoBarras', mensaje: 'El código de barras es obligatorio' });
        if (Number.isNaN(cantidad) || cantidad <= 0) {
          errores.push({ fila, columna: 'cantidad', mensaje: 'La cantidad debe ser un número positivo' });
        }
        if (codigoBarras) {
          if (vistos.has(codigoBarras)) {
            errores.push({ fila, columna: 'codigoBarras', mensaje: `Código duplicado dentro del archivo (fila ${vistos.get(codigoBarras)})` });
          } else {
            vistos.set(codigoBarras, fila);
          }
        }
      }
      if (errores.length > 0) return rechazar(req, res, tipo, filas.length, errores);

      const referencias = await prisma.referenciaVendible.findMany({
        where: { codigoBarras: { in: [...vistos.keys()] } },
        select: { id: true, codigoBarras: true },
      });
      const mapaRef = new Map(referencias.map((r) => [r.codigoBarras, r.id]));
      for (const [codigo, fila] of vistos) {
        if (!mapaRef.has(codigo)) {
          errores.push({ fila, columna: 'codigoBarras', mensaje: `El código ${codigo} no existe en el catálogo; importe primero el catálogo` });
        }
      }
      if (errores.length > 0) return rechazar(req, res, tipo, filas.length, errores);

      const fecha = new Date();
      await prisma.$transaction(async (tx) => {
        const consecutivo = await (async () => {
          const rows = await tx.$queryRaw<{ prefijo: string; valor_actual: number }[]>`
            UPDATE consecutivos SET valor_actual = valor_actual + 1 WHERE tipo = 'AJ' RETURNING prefijo, valor_actual`;
          return `${rows[0].prefijo}-${String(rows[0].valor_actual).padStart(6, '0')}`;
        })();
        const ajuste = await tx.ajuste.create({
          data: {
            consecutivo,
            tipo: 'ENTRADA',
            concepto: 'MIGRACION',
            justificacion: 'Saldos iniciales por migración desde Excel',
            estado: 'APROBADO',
            usuarioSolicita: req.usuario!.id,
            usuarioAprueba: req.usuario!.id,
            fechaAprobacion: fecha,
            fecha,
            detalles: {
              create: [...vistos.keys()].map((codigo) => ({
                referenciaId: mapaRef.get(codigo)!,
                cantidadSistema: 0,
                cantidadContada: Number(filas.find((f) => texto(f.datos['codigoBarras']) === codigo)!.datos['cantidad']),
                cantidadAjuste: Number(filas.find((f) => texto(f.datos['codigoBarras']) === codigo)!.datos['cantidad']),
              })),
            },
          },
        });
        for (const { datos } of filas) {
          await moverStock(tx, {
            referenciaId: mapaRef.get(texto(datos['codigoBarras']))!,
            cantidad: Number(datos['cantidad']),
            desde: null,
            hacia: 'DISPONIBLE',
            clase: 'MIGRACION',
            docTipo: 'Ajuste',
            docId: ajuste.id,
            usuarioId: req.usuario!.id,
            detalle: 'Saldo inicial por migración',
          });
        }
        return ajuste;
      });
      const migracion = await prisma.migracion.create({
        data: { archivo: req.file.originalname, tipo, estado: 'PROCESADA', totalFilas: filas.length, filasOk: filas.length, usuarioId: req.usuario!.id },
      });
      return res.status(201).json({ id: migracion.id, estado: 'PROCESADA', filasOk: filas.length });
    } catch (e) {
      next(e);
    }

    async function rechazar(_req2: unknown, res2: import('express').Response, tipo: string, total: number, errores: ErrorFila[]) {
      const migracion = await prisma.migracion.create({
        data: {
          archivo: req.file!.originalname,
          tipo,
          estado: 'RECHAZADA',
          totalFilas: total,
          filasOk: 0,
          errores: errores as object[],
          usuarioId: req.usuario!.id,
        },
      });
      res2.status(422).json({
        mensaje: 'La migración fue abortada: se encontraron errores de validación. No se importó ningún registro',
        id: migracion.id,
        totalFilas: total,
        errores,
      });
    }
  },
);

/** GET /api/migracion — historial de migraciones. */
migracionRouter.get('/', requierePermiso('migracion.ejecutar'), async (_req, res, next) => {
  try {
    const migraciones = await prisma.migracion.findMany({ orderBy: { id: 'desc' }, take: 50 });
    res.json(migraciones.map((m) => ({ ...m, errores: m.errores ?? undefined })));
  } catch (e) {
    next(e);
  }
});

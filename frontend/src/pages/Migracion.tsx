import { useCallback, useEffect, useState } from 'react';
import { Typography, Upload, Select, Button, Table, App, Tag, Alert, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { api, mensajeError } from '../api/client';

interface Migracion {
  id: number; archivo: string; tipo: string; estado: string; totalFilas: number; filasOk: number; fecha: string;
  errores?: { fila: number; columna: string; mensaje: string }[];
}

export function Migracion() {
  const { message } = App.useApp();
  const [tipo, setTipo] = useState('CATALOGO');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [historial, setHistorial] = useState<Migracion[]>([]);
  const [ultimoReporte, setUltimoReporte] = useState<Migracion | null>(null);

  const cargarHistorial = useCallback(async () => {
    try {
      const { data } = await api.get<Migracion[]>('/migracion');
      setHistorial(data);
    } catch (e) {
      message.error(mensajeError(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const ejecutar = async () => {
    if (!archivo) {
      message.warning('Seleccione el archivo Excel');
      return;
    }
    setProcesando(true);
    setUltimoReporte(null);
    const cuerpo = new FormData();
    cuerpo.append('tipo', tipo);
    cuerpo.append('archivo', archivo);
    try {
      const { data } = await api.post('/migracion', cuerpo, {
        validateStatus: (s) => s === 201 || s === 422, // 422 = rechazada con reporte
      });
      if (data.estado === 'PROCESADA') {
        message.success(`Migración completada: ${data.filasOk} filas importadas`);
        setArchivo(null);
      } else {
        message.error('Migración abortada: revise el reporte de errores');
        setUltimoReporte(data);
      }
      cargarHistorial();
    } catch (e) {
      message.error(mensajeError(e, 'No se pudo procesar el archivo'));
    } finally {
      setProcesando(false);
    }
  };

  const plantillas: Record<string, string> = {
    CATALOGO: 'codigoBarras | producto | marca | presentacion | unidadBase | precioVenta | fraccionMinima | controlVencimiento(si/no) | mesesGarantia',
    TERCEROS: 'identificacion | tipoPersona(NATURAL/JURIDICA) | nombre | apellido | razonSocial | telefono | email | esCliente(si/no) | esProveedor(si/no)',
    SALDOS_INICIALES: 'codigoBarras | cantidad (debe existir previamente en el catálogo)',
  };

  return (
    <div>
      <Typography.Title level={4}>Migración desde Excel (RF-23)</Typography.Title>
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="Pre-validación total: si el archivo contiene cualquier error o duplicado, la importación se aborta por completo y no se importa ningún registro."
      />
      <Space style={{ marginBottom: 16 }} wrap>
        <Select value={tipo} onChange={setTipo} style={{ width: 220 }} options={[
          { value: 'CATALOGO', label: 'Catálogo de productos' },
          { value: 'TERCEROS', label: 'Terceros (clientes/proveedores)' },
          { value: 'SALDOS_INICIALES', label: 'Saldos iniciales de bodega' },
        ]} />
        <Upload maxCount={1} accept=".xlsx,.xls,.csv" beforeUpload={(f) => { setArchivo(f); return false; }} onRemove={() => setArchivo(null)}>
          <Button icon={<UploadOutlined />}>Seleccionar archivo .xlsx / .csv</Button>
        </Upload>
        <Button type="primary" loading={procesando} onClick={ejecutar} disabled={!archivo}>Importar</Button>
      </Space>
      <Typography.Paragraph type="secondary">
        <strong>Columnas esperadas ({tipo}):</strong> {plantillas[tipo]}
      </Typography.Paragraph>

      {ultimoReporte && (
        <div style={{ marginBottom: 16 }}>
          <Typography.Title level={5}>Reporte de errores ({ultimoReporte.errores?.length ?? 0})</Typography.Title>
          <Table
            rowKey={(r, i) => `${r.fila}-${i}`} size="small" dataSource={ultimoReporte.errores ?? []} pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Fila', dataIndex: 'fila', width: 80 },
              { title: 'Columna', dataIndex: 'columna', width: 160 },
              { title: 'Mensaje', dataIndex: 'mensaje' },
            ]}
          />
        </div>
      )}

      <Typography.Title level={5}>Historial de migraciones</Typography.Title>
      <Table
        rowKey="id" size="small" dataSource={historial}
        columns={[
          { title: 'Archivo', dataIndex: 'archivo' },
          { title: 'Tipo', dataIndex: 'tipo' },
          {
            title: 'Estado', dataIndex: 'estado',
            render: (v: string) => <Tag color={v === 'PROCESADA' ? 'green' : 'red'}>{v}</Tag>,
          },
          { title: 'Filas', dataIndex: 'totalFilas' },
          { title: 'Importadas', dataIndex: 'filasOk' },
        ]}
      />
    </div>
  );
}

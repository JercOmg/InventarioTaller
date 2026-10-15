import { useCallback, useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import {
  Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Checkbox, App, Tag, Space, Typography, Divider, Row, Col, Card,
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Referencia {
  id: number;
  productoId: number;
  marcaId: number;
  presentacionId: number;
  codigoBarras: string;
  nombre: string | null;
  descripcion: string;
  unidadBaseId: number;
  unidadBase: { codigo: string };
  fraccionMinima: number;
  ivaPorcentaje: number;
  precioVenta: number;
  costoPromedio?: number;
  estado: string;
  saldos: { disponible: number; reservada: number; danada: number };
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  controlVencimiento: boolean;
  mesesGarantia: number;
  activo: boolean;
  totalReferencias: number;
}
interface Opcion { id: number; nombre: string }
interface Unidad extends Opcion { codigo: string }

/**
 * Select con creación al vuelo: escribe un nombre y presiona Enter o el botón
 * "Crear «...»" para registrar una marca/presentación/producto nuevo sin salir
 * del formulario (resuelve la combinación única producto+marca+presentación — RF-01).
 */
function SelectCreable({
  value,
  onChange,
  opciones,
  endpoint,
  etiqueta,
  placeholder,
  onCreado,
}: {
  value?: number;
  onChange?: (v: number) => void; // inyectado por Form.Item
  opciones: Opcion[];
  endpoint: string;
  etiqueta: string;
  placeholder: string;
  onCreado: () => void;
}) {
  const { message } = App.useApp();
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const crear = async () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    setCreando(true);
    try {
      const { data } = await api.post<Opcion>(endpoint, { nombre });
      message.success(`"${nombre}" creado correctamente`);
      onCreado();
      onChange?.(data.id);
      setNuevoNombre('');
    } catch (e) {
      message.error(mensajeError(e, `No se pudo crear "${nombre}"`));
    } finally {
      setCreando(false);
    }
  };

  return (
    <Select
      showSearch
      value={value}
      onChange={(v) => onChange?.(v as number)}
      placeholder={placeholder}
      optionFilterProp="label"
      options={opciones.map((o) => ({ value: o.id, label: o.nombre }))}
      notFoundContent="Sin datos todavía: use el campo de abajo para crear el primero"
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <div
            style={{ display: 'flex', gap: 8, padding: '0 8px 8px' }}
            // preventDefault impide que el select robe el foco con su manejador interno;
            // luego enfocamos explícitamente nuestro campo de creación
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputRef.current?.focus();
            }}
          >
            <Input
              ref={inputRef}
              size="small"
              placeholder={`Nombre de la ${etiqueta} nueva`}
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  crear();
                }
              }}
              allowClear
            />
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              loading={creando}
              disabled={!nuevoNombre.trim()}
              onClick={crear}
            >
              Crear
            </Button>
          </div>
        </>
      )}
    />
  );
}

export function Catalogo() {
  const { tienePermiso } = useAuth();
  const { message } = App.useApp();
  const [refs, setRefs] = useState<Referencia[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [marcas, setMarcas] = useState<Opcion[]>([]);
  const [presentaciones, setPresentaciones] = useState<Opcion[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Referencia | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [form] = Form.useForm();
  const [modalProducto, setModalProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [formProducto] = Form.useForm();

  const cargar = useCallback(async (q?: string) => {
    setCargando(true);
    try {
      const { data } = await api.get<Referencia[]>('/catalogo/referencias', { params: q ? { busqueda: q } : {} });
      setRefs(data);
    } catch (e) {
      message.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarAuxiliares = useCallback(async () => {
    const [prod, marc, pres, und] = await Promise.all([
      api.get('/catalogo/productos'),
      api.get('/catalogo/marcas'),
      api.get('/catalogo/presentaciones'),
      api.get('/catalogo/unidades'),
    ]);
    setProductos(prod.data);
    setMarcas(marc.data);
    setPresentaciones(pres.data);
    setUnidades(und.data);
  }, []);

  useEffect(() => {
    cargar();
    cargarAuxiliares();
  }, [cargar, cargarAuxiliares]);

  const guardar = async (valores: Record<string, unknown>) => {
    try {
      if (editando) {
        await api.put(`/catalogo/referencias/${editando.id}`, valores);
        message.success('Referencia actualizada');
      } else {
        await api.post('/catalogo/referencias', valores);
        message.success('Referencia creada');
      }
      setModalAbierto(false);
      setEditando(null);
      form.resetFields();
      cargar();
    } catch (e) {
      message.error({ content: mensajeError(e, 'No se pudo guardar la referencia'), duration: 6 });
    }
  };

  // ---------- Creación rápida de marcas y presentaciones (pestaña auxiliares) ----------
  const crearAuxiliar = async (endpoint: string, nombre: string, etiqueta: string) => {
    const limpio = nombre.trim();
    if (!limpio) {
      message.warning(`Escriba el nombre de la ${etiqueta}`);
      return;
    }
    try {
      await api.post(endpoint, { nombre: limpio });
      message.success(`${etiqueta} "${limpio}" creada`);
      cargarAuxiliares();
    } catch (e) {
      message.error(mensajeError(e, `No se pudo crear la ${etiqueta}`));
    }
  };

  // ---------- Productos (creación y parametrización — RF-12/RF-13) ----------
  const guardarProducto = async (valores: Record<string, unknown>) => {
    try {
      if (productoEditando) {
        await api.put(`/catalogo/productos/${productoEditando.id}`, valores);
        message.success('Producto actualizado');
      } else {
        await api.post('/catalogo/productos', valores);
        message.success('Producto creado');
      }
      setModalProducto(false);
      setProductoEditando(null);
      formProducto.resetFields();
      cargarAuxiliares();
    } catch (e) {
      message.error(mensajeError(e, 'No se pudo guardar el producto'));
    }
  };

  const columnas = [
    { title: 'Código de barras', dataIndex: 'codigoBarras', key: 'cb' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'd' },
    { title: 'Unidad', dataIndex: ['unidadBase', 'codigo'], key: 'u', width: 70 },
    { title: 'Precio venta', dataIndex: 'precioVenta', key: 'p', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
    ...(tienePermiso('costos.ver') ? [{ title: 'Costo promedio', dataIndex: 'costoPromedio', key: 'c', render: (v?: number) => (v !== undefined ? `$${v.toLocaleString('es-CO')}` : '—') }] : []),
    {
      title: 'Saldos', key: 's',
      render: (_: unknown, r: Referencia) => (
        <Space>
          <Tag color="green">Disp: {r.saldos.disponible}</Tag>
          <Tag color="orange">Res: {r.saldos.reservada}</Tag>
          <Tag color="red">Dañ: {r.saldos.danada}</Tag>
        </Space>
      ),
    },
    { title: 'IVA %', dataIndex: 'ivaPorcentaje', key: 'i', width: 70 },
    {
      title: 'Estado', dataIndex: 'estado', key: 'e', width: 90,
      render: (v: string) => <Tag color={v === 'ACTIVO' ? 'green' : 'default'}>{v}</Tag>,
    },
    ...(tienePermiso('catalogo.editar')
      ? [{
          title: '', key: 'acc', width: 60,
          render: (_: unknown, r: Referencia) => (
            <Button
              size="small"
              icon={<EditOutlined />}
              title="Editar referencia"
              onClick={() => {
                setEditando(r);
                form.setFieldsValue({
                  codigoBarras: r.codigoBarras,
                  productoId: r.productoId,
                  marcaId: r.marcaId,
                  presentacionId: r.presentacionId,
                  unidadBaseId: r.unidadBaseId,
                  fraccionMinima: r.fraccionMinima,
                  ivaPorcentaje: r.ivaPorcentaje,
                  estado: r.estado,
                });
                setModalAbierto(true);
              }}
            />
          ),
        }]
      : []),
  ];

  const tabReferencias = (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Buscar por código de barras o nombre (lector de códigos compatible)"
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 380 }}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onPressEnter={() => cargar(busqueda)}
          data-testid="buscar-referencia"
        />
        <Button icon={<SearchOutlined />} onClick={() => cargar(busqueda)}>Buscar</Button>
        <Button icon={<ReloadOutlined />} onClick={() => { setBusqueda(''); cargar(); }} />
        {tienePermiso('catalogo.crear') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditando(null); form.resetFields(); setModalAbierto(true); }}
            data-testid="btn-nueva-referencia"
          >
            Nueva referencia
          </Button>
        )}
      </Space>
      <Table rowKey="id" columns={columnas as never} dataSource={refs} loading={cargando} size="small" scroll={{ x: 960 }} />
    </div>
  );

  const tabProductos = (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {tienePermiso('catalogo.crear') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setProductoEditando(null); formProducto.resetFields(); setModalProducto(true); }}
            data-testid="btn-nuevo-producto"
          >
            Nuevo producto
          </Button>
        )}
      </Space>
      <Table
        rowKey="id"
        size="small"
        dataSource={productos}
        columns={[
          { title: 'Nombre', dataIndex: 'nombre' },
          { title: 'Control vencimiento', dataIndex: 'controlVencimiento', render: (v: boolean) => (v ? <Tag color="blue">Sí</Tag> : 'No') },
          { title: 'Garantía (meses)', dataIndex: 'mesesGarantia' },
          { title: 'Referencias', dataIndex: 'totalReferencias' },
          {
            title: '', width: 60,
            render: (_: unknown, p: Producto) =>
              tienePermiso('catalogo.editar') ? (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setProductoEditando(p);
                    formProducto.setFieldsValue({
                      nombre: p.nombre,
                      descripcion: p.descripcion,
                      controlVencimiento: p.controlVencimiento,
                      mesesGarantia: p.mesesGarantia,
                    });
                    setModalProducto(true);
                  }}
                />
              ) : null,
          },
        ]}
      />
    </div>
  );

  const tabAuxiliares = (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card size="small" title="Marcas">
          <Input.Search
            placeholder="Nombre de la nueva marca"
            enterButton={<><PlusOutlined /> Crear</>}
            onSearch={(v) => crearAuxiliar('/catalogo/marcas', v, 'marca')}
            style={{ marginBottom: 12 }}
          />
          <Table rowKey="id" size="small" pagination={false} dataSource={marcas} columns={[{ title: 'Nombre', dataIndex: 'nombre' }]} />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small" title="Presentaciones">
          <Input.Search
            placeholder="Nombre de la nueva presentación"
            enterButton={<><PlusOutlined /> Crear</>}
            onSearch={(v) => crearAuxiliar('/catalogo/presentaciones', v, 'presentación')}
            style={{ marginBottom: 12 }}
          />
          <Table rowKey="id" size="small" pagination={false} dataSource={presentaciones} columns={[{ title: 'Nombre', dataIndex: 'nombre' }]} />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small" title="Unidades de medida (base del sistema)">
          <Table
            rowKey="id" size="small" pagination={false} dataSource={unidades}
            columns={[
              { title: 'Código', dataIndex: 'codigo', width: 90 },
              { title: 'Nombre', dataIndex: 'nombre' },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      <Typography.Title level={4}>Catálogo</Typography.Title>
      <Tabs
        items={[
          { key: 'refs', label: 'Referencias vendibles', children: tabReferencias },
          { key: 'prod', label: 'Productos', children: tabProductos },
          { key: 'aux', label: 'Marcas y presentaciones', children: tabAuxiliares },
        ]}
      />

      {/* Modal nueva/editar referencia: los selects permiten crear marcas,
          presentaciones y productos nuevos al vuelo */}
      <Modal
        title={editando ? `Editar referencia: ${editando.descripcion}` : 'Nueva referencia vendible'}
        open={modalAbierto}
        onCancel={() => { setModalAbierto(false); setEditando(null); }}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item name="codigoBarras" label="Código de barras (único)" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input placeholder="Escanee o digite el código" data-testid="input-codigo-barras" />
          </Form.Item>
          <Form.Item name="productoId" label="Producto (escriba para buscar o crear uno nuevo)" rules={[{ required: true, message: 'Obligatorio' }]}>
            <SelectCreable opciones={productos} endpoint="/catalogo/productos" etiqueta="producto" placeholder="Seleccione o cree uno nuevo" onCreado={cargarAuxiliares} />
          </Form.Item>
          <Form.Item name="marcaId" label="Marca (puede crear una nueva)" rules={[{ required: true, message: 'Obligatorio' }]}>
            <SelectCreable opciones={marcas} endpoint="/catalogo/marcas" etiqueta="marca" placeholder="Seleccione o cree una nueva" onCreado={cargarAuxiliares} />
          </Form.Item>
          <Form.Item name="presentacionId" label="Presentación (puede crear una nueva)" rules={[{ required: true, message: 'Obligatorio' }]}>
            <SelectCreable opciones={presentaciones} endpoint="/catalogo/presentaciones" etiqueta="presentación" placeholder="Seleccione o cree una nueva" onCreado={cargarAuxiliares} />
          </Form.Item>
          <Form.Item name="unidadBaseId" label="Unidad base" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Select options={unidades.map((u) => ({ value: u.id, label: `${u.codigo} - ${u.nombre}` }))} placeholder="Seleccione" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="fraccionMinima" label="Fracción mínima" initialValue={1}>
              <InputNumber min={0.0001} step={0.5} style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="ivaPorcentaje" label="IVA %" initialValue={19}>
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
          </Space>
          {editando && (
            <Form.Item name="estado" label="Estado de la referencia" initialValue="ACTIVO">
              <Select options={[{ value: 'ACTIVO', label: 'Activo (se puede vender)' }, { value: 'INACTIVO', label: 'Inactivo' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal de producto: parametrización de vencimiento y garantía (RF-12/13) */}
      <Modal
        title={productoEditando ? `Editar producto: ${productoEditando.nombre}` : 'Nuevo producto'}
        open={modalProducto}
        onCancel={() => { setModalProducto(false); setProductoEditando(null); }}
        onOk={() => formProducto.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={formProducto} layout="vertical" onFinish={guardarProducto}>
          <Form.Item name="nombre" label="Nombre del producto" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción"><Input /></Form.Item>
          <Form.Item name="controlVencimiento" valuePropName="checked" initialValue={false}>
            <Checkbox>Controla fecha de vencimiento (productos perecederos — RF-12)</Checkbox>
          </Form.Item>
          <Form.Item name="mesesGarantia" label="Meses de garantía (0 = sin garantía — RF-13)" initialValue={0}>
            <InputNumber min={0} max={120} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import {
  Typography, Table, Button, Modal, Form, Input, InputNumber, Select, Space, App, Tag, DatePicker,
} from 'antd';
import { PlusOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';

interface Ingreso {
  id: number;
  consecutivo: string;
  proveedor: { nombre: string };
  facturaProveedor: string;
  estado: string;
  motivoAnulacion: string | null;
  fecha: string;
  usuario: string;
  detalles: { id: number; descripcion: string; cantidad: number; costoUnitario: number; fechaVencimiento: string | null }[];
  total: number;
}
interface Tercero { id: number; nombreCompleto: string; identificacion: string; esProveedor: boolean }
interface Referencia { id: number; descripcion: string; codigoBarras: string; precioVenta: number; producto: { controlVencimiento: boolean } }

export function Compras() {
  const { message, modal } = App.useApp();
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalIngreso, setModalIngreso] = useState(false);
  const [form] = Form.useForm();
  const [proveedores, setProveedores] = useState<Tercero[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [lineas, setLineas] = useState<{ referenciaId: number; descripcion: string; cantidad: number; costoUnitario: number; fechaVencimiento?: string }[]>([]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get<Ingreso[]>('/compras/ingresos');
      setIngresos(data);
    } catch (e) {
      message.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirModal = async () => {
    const [prov, refs] = await Promise.all([
      api.get('/terceros', { params: { rol: 'proveedor' } }),
      api.get('/catalogo/referencias'),
    ]);
    setProveedores(prov.data);
    setReferencias(refs.data);
    setLineas([]);
    form.resetFields();
    setModalIngreso(true);
  };

  const agregarLinea = (referenciaId: number) => {
    const ref = referencias.find((r) => r.id === referenciaId);
    if (!ref || lineas.some((l) => l.referenciaId === referenciaId)) return;
    setLineas((prev) => [...prev, { referenciaId, descripcion: ref.descripcion, cantidad: 1, costoUnitario: 0 }]);
  };

  const guardarIngreso = async () => {
    try {
      const valores = await form.validateFields();
      if (lineas.length === 0) {
        message.warning('Agregue al menos una línea');
        return;
      }
      const { data } = await api.post('/compras/ingresos', {
        proveedorId: valores.proveedorId,
        facturaProveedor: valores.facturaProveedor,
        detalles: lineas.map((l) => ({
          referenciaId: l.referenciaId,
          cantidad: l.cantidad,
          costoUnitario: l.costoUnitario,
          fechaVencimiento: l.fechaVencimiento || undefined,
        })),
      });
      message.success(`Documento de ingreso ${data.consecutivo} generado`);
      setModalIngreso(false);
      cargar();
    } catch (e) {
      if ((e as { errorFields?: unknown }).errorFields) return; // validación del formulario
      message.error(mensajeError(e, 'No se pudo registrar el ingreso'));
    }
  };

  const anular = (ingreso: Ingreso) => {
    let motivo = '';
    modal.confirm({
      title: `Anular documento ${ingreso.consecutivo}`,
      content: (
        <Input.TextArea
          placeholder="Motivo de la anulación (obligatorio)"
          onChange={(e) => (motivo = e.target.value)}
        />
      ),
      okText: 'Anular',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.post(`/compras/ingresos/${ingreso.id}/anular`, { motivo });
          message.success('Documento anulado (anulación lógica, trazabilidad conservada)');
          cargar();
        } catch (e) {
          message.error(mensajeError(e, 'No fue posible anular el documento'));
        }
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4}>Compras y Documentos de Ingreso</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirModal}>Nuevo ingreso</Button>
        <Button icon={<ReloadOutlined />} onClick={cargar} />
      </Space>
      <Table
        rowKey="id"
        size="small"
        loading={cargando}
        dataSource={ingresos}
        expandable={{
          expandedRowRender: (r: Ingreso) => (
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={r.detalles}
              columns={[
                { title: 'Producto', dataIndex: 'descripcion' },
                { title: 'Cantidad', dataIndex: 'cantidad' },
                { title: 'Costo unitario', dataIndex: 'costoUnitario', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                { title: 'Vencimiento', dataIndex: 'fechaVencimiento', render: (v: string | null) => v ?? '—' },
              ]}
            />
          ),
        }}
        columns={[
          { title: 'Consecutivo', dataIndex: 'consecutivo', width: 120 },
          { title: 'Proveedor', dataIndex: ['proveedor', 'nombre'] },
          { title: 'Factura soporte', dataIndex: 'facturaProveedor' },
          { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
          { title: 'Total', dataIndex: 'total', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
          {
            title: 'Estado', dataIndex: 'estado', width: 110,
            render: (v: string) => <Tag color={v === 'CERRADO' ? 'green' : v === 'ANULADO' ? 'red' : 'blue'}>{v}</Tag>,
          },
          {
            title: '', width: 80,
            render: (_: unknown, r: Ingreso) =>
              r.estado === 'CERRADO' ? (
                <Button size="small" danger icon={<StopOutlined />} onClick={() => anular(r)}>Anular</Button>
              ) : null,
          },
        ]}
      />
      <Modal
        title="Nuevo documento de ingreso"
        open={modalIngreso}
        width={760}
        onCancel={() => setModalIngreso(false)}
        onOk={guardarIngreso}
        okText="Registrar ingreso"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="proveedorId" label="Proveedor" rules={[{ required: true, message: 'Obligatorio' }]} style={{ minWidth: 260 }}>
              <Select
                showSearch
                optionFilterProp="label"
                options={proveedores.map((p) => ({ value: p.id, label: `${p.nombreCompleto} (${p.identificacion})` }))}
                placeholder="Seleccione"
              />
            </Form.Item>
            <Form.Item name="facturaProveedor" label="Factura del proveedor (soporte obligatorio)" rules={[{ required: true, message: 'Obligatorio' }]} style={{ minWidth: 260 }}>
              <Input placeholder="Ej: INV-999" />
            </Form.Item>
          </Space>
          <Form.Item label="Producto (agregar línea)">
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Busque el producto y agregue líneas"
              value={undefined}
              onChange={agregarLinea}
              options={referencias
                .filter((r) => !lineas.some((l) => l.referenciaId === r.id))
                .map((r) => ({ value: r.id, label: `${r.codigoBarras} — ${r.descripcion}` }))}
            />
          </Form.Item>
        </Form>
        <Table
          rowKey="referenciaId"
          size="small"
          pagination={false}
          dataSource={lineas}
          columns={[
            { title: 'Producto', dataIndex: 'descripcion' },
            {
              title: 'Cantidad', dataIndex: 'cantidad', width: 120,
              render: (_: unknown, l: (typeof lineas)[number]) => (
                <InputNumber min={0.0001} value={l.cantidad}
                  onChange={(v) => setLineas((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, cantidad: v ?? 1 } : x)))} />
              ),
            },
            {
              title: 'Costo unitario', dataIndex: 'costoUnitario', width: 160,
              render: (_: unknown, l: (typeof lineas)[number]) => (
                <InputNumber min={0} value={l.costoUnitario}
                  onChange={(v) => setLineas((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, costoUnitario: v ?? 0 } : x)))} />
              ),
            },
            {
              title: 'Vencimiento (si aplica)', dataIndex: 'fechaVencimiento', width: 180,
              render: (_: unknown, l: (typeof lineas)[number]) => {
                const ref = referencias.find((r) => r.id === l.referenciaId);
                return (
                  <DatePicker
                    size="small"
                    onChange={(d) => setLineas((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, fechaVencimiento: d?.toISOString() } : x)))}
                    status={ref?.producto?.controlVencimiento && !l.fechaVencimiento ? 'error' : undefined}
                  />
                );
              },
            },
          ]}
        />
      </Modal>
    </div>
  );
}

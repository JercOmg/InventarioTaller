import { useCallback, useEffect, useState } from 'react';
import { Typography, Table, Button, Modal, Form, Input, InputNumber, Space, App, Tag, Radio } from 'antd';
import { ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Venta {
  id: number;
  factura: string | null;
  cliente: string;
  usuario: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  fecha: string;
  detalles: {
    id: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    devuelto: number;
  }[];
}

export function Ventas() {
  const { tienePermiso } = useAuth();
  const { message } = App.useApp();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [ventaDevolver, setVentaDevolver] = useState<Venta | null>(null);
  const [form] = Form.useForm();

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get<Venta[]>('/ventas');
      setVentas(data);
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

  const abrirDevolucion = async (venta: Venta) => {
    // Cargar detalle fresco (con devuelto actualizado)
    const { data } = await api.get<Venta[]>(`/ventas`);
    const fresca = data.find((v) => v.id === venta.id) ?? venta;
    setVentaDevolver(fresca);
    form.resetFields();
    form.setFieldsValue({ detalles: {} });
  };

  const registrarDevolucion = async (valores: Record<string, unknown>) => {
    if (!ventaDevolver) return;
    const detalles = ventaDevolver.detalles
      .map((d) => {
        const cantidad = valores[`cant_${d.id}`] as number | undefined;
        const estado = valores[`estado_${d.id}`] as string | undefined;
        return cantidad && cantidad > 0
          ? { ventaDetalleId: d.id, cantidad, estadoReingreso: estado ?? 'DISPONIBLE' }
          : null;
      })
      .filter(Boolean);
    if (detalles.length === 0) {
      message.warning('Indique al menos una cantidad a devolver');
      return;
    }
    try {
      const { data } = await api.post('/ventas/devoluciones', {
        ventaId: ventaDevolver.id,
        motivo: valores.motivo,
        aprobadorUsuario: valores.aprobadorUsuario,
        aprobadorPassword: valores.aprobadorPassword,
        detalles,
      });
      message.success(`Devolución ${data.consecutivo} registrada`);
      setVentaDevolver(null);
      cargar();
    } catch (e) {
      message.error(mensajeError(e, 'No se pudo registrar la devolución'));
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Ventas y Devoluciones</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={cargar} />
      </Space>
      <Table
        rowKey="id"
        size="small"
        loading={cargando}
        dataSource={ventas}
        expandable={{
          expandedRowRender: (r: Venta) => (
            <Table
              rowKey="id" size="small" pagination={false} dataSource={r.detalles}
              columns={[
                { title: 'Producto', dataIndex: 'descripcion' },
                { title: 'Cantidad', dataIndex: 'cantidad' },
                { title: 'Precio', dataIndex: 'precioUnitario', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                { title: 'Devuelto', dataIndex: 'devuelto' },
              ]}
            />
          ),
        }}
        columns={[
          { title: 'Factura', dataIndex: 'factura', width: 110 },
          { title: 'Cliente', dataIndex: 'cliente' },
          { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
          { title: 'Usuario', dataIndex: 'usuario' },
          { title: 'Subtotal', dataIndex: 'subtotal', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
          { title: 'IVA', dataIndex: 'impuestos', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
          { title: 'Total', dataIndex: 'total', render: (v: number) => <strong>${v.toLocaleString('es-CO')}</strong> },
          {
            title: '', width: 130,
            render: (_: unknown, r: Venta) =>
              tienePermiso('ventas.devoluciones') ? (
                <Button size="small" icon={<UndoOutlined />} onClick={() => abrirDevolucion(r)}>Devolver</Button>
              ) : null,
          },
        ]}
      />
      <Modal
        title={`Registrar devolución — factura ${ventaDevolver?.factura ?? ''}`}
        open={Boolean(ventaDevolver)}
        width={720}
        onCancel={() => setVentaDevolver(null)}
        onOk={() => form.submit()}
        okText="Registrar devolución"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={registrarDevolucion}>
          <Table
            rowKey="id" size="small" pagination={false}
            dataSource={ventaDevolver?.detalles ?? []}
            columns={[
              { title: 'Producto', dataIndex: 'descripcion' },
              { title: 'Vendido', dataIndex: 'cantidad', width: 80 },
              { title: 'Ya devuelto', dataIndex: 'devuelto', width: 100 },
              {
                title: 'Cantidad a devolver', width: 150,
                render: (_: unknown, d: Venta['detalles'][number]) => {
                  const disponible = d.cantidad - d.devuelto;
                  if (disponible <= 0) return <Tag>Completo</Tag>;
                  return (
                    <Form.Item name={`cant_${d.id}`} noStyle>
                      <InputNumber min={0.0001} max={disponible} placeholder={`máx ${disponible}`} style={{ width: '100%' }} />
                    </Form.Item>
                  );
                },
              },
              {
                title: 'Estado al reingresar', width: 200,
                render: (_: unknown, d: Venta['detalles'][number]) => (
                  <Form.Item name={`estado_${d.id}`} noStyle initialValue="DISPONIBLE">
                    <Radio.Group size="small" options={[
                      { value: 'DISPONIBLE', label: 'Disponible' },
                      { value: 'DANADO', label: 'Dañado' },
                    ]} optionType="button" />
                  </Form.Item>
                ),
              },
            ]}
          />
          <Form.Item name="motivo" label="Motivo de la devolución" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="aprobadorUsuario" label="Usuario que aprueba" rules={[{ required: true, message: 'Requiere aprobación de otro usuario autorizado' }]}>
              <Input placeholder="Ej: gerencia" />
            </Form.Item>
            <Form.Item name="aprobadorPassword" label="Contraseña del aprobador" rules={[{ required: true, message: 'Obligatorio' }]}>
              <Input.Password />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import {
  Typography, Table, Button, Modal, Form, Input, InputNumber, Select, Space, App, Tag, DatePicker,
} from 'antd';
import { PlusOutlined, ReloadOutlined, UnlockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Reserva {
  id: number;
  consecutivo: string;
  cliente: string;
  pedidoRef: string;
  fechaLimite: string;
  estado: string;
  motivoLiberacion: string | null;
  vencida: boolean;
  usuario: string;
  detalles: { descripcion: string; cantidad: number }[];
}

export function Reservas() {
  const { tienePermiso } = useAuth();
  const { message, modal } = App.useApp();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [form] = Form.useForm();
  const [clientes, setClientes] = useState<{ id: number; nombreCompleto: string }[]>([]);
  const [referencias, setReferencias] = useState<{ id: number; descripcion: string; codigoBarras: string }[]>([]);
  const [lineas, setLineas] = useState<{ referenciaId: number; descripcion: string; cantidad: number }[]>([]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get<Reserva[]>('/reservas');
      setReservas(data);
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

  const abrirNuevo = async () => {
    const [cl, refs] = await Promise.all([
      api.get('/terceros', { params: { rol: 'cliente' } }),
      api.get('/catalogo/referencias'),
    ]);
    setClientes(cl.data);
    setReferencias(refs.data);
    setLineas([]);
    form.resetFields();
    setModalNuevo(true);
  };

  const guardar = async () => {
    try {
      const valores = await form.validateFields();
      if (lineas.length === 0) {
        message.warning('Agregue al menos una línea');
        return;
      }
      const { data } = await api.post('/reservas', {
        clienteId: valores.clienteId,
        pedidoRef: valores.pedidoRef,
        fechaLimite: valores.fechaLimite.toISOString(),
        detalles: lineas.map((l) => ({ referenciaId: l.referenciaId, cantidad: l.cantidad })),
      });
      message.success(`Reserva ${data.consecutivo} creada`);
      setModalNuevo(false);
      cargar();
    } catch (e) {
      if ((e as { errorFields?: unknown }).errorFields) return;
      message.error(mensajeError(e, 'No se pudo crear la reserva'));
    }
  };

  const liberar = (r: Reserva) => {
    let motivo = '';
    modal.confirm({
      title: `Liberar reserva ${r.consecutivo}`,
      content: <Input.TextArea placeholder="Motivo (obligatorio)" onChange={(e) => (motivo = e.target.value)} />,
      onOk: async () => {
        try {
          await api.post(`/reservas/${r.id}/liberar`, { motivo });
          message.success('Reserva liberada: las unidades volvieron a disponibilidad');
          cargar();
        } catch (e) {
          message.error(mensajeError(e));
        }
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4}>Reservas de Inventario</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        {tienePermiso('reservas.crear') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={abrirNuevo}>Nueva reserva</Button>
        )}
        <Button icon={<ReloadOutlined />} onClick={cargar} />
      </Space>
      <Table
        rowKey="id" size="small" loading={cargando} dataSource={reservas}
        columns={[
          { title: 'Consecutivo', dataIndex: 'consecutivo', width: 120 },
          { title: 'Cliente', dataIndex: 'cliente' },
          { title: 'Pedido', dataIndex: 'pedidoRef' },
          { title: 'Límite', dataIndex: 'fechaLimite', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
          { title: 'Productos', dataIndex: 'detalles', render: (d: Reserva['detalles']) => d.map((x) => `${x.cantidad} × ${x.descripcion}`).join(', ') },
          {
            title: 'Estado', dataIndex: 'estado', width: 130,
            render: (v: string, r: Reserva) => (
              <Tag color={v === 'ACTIVA' ? (r.vencida ? 'red' : 'green') : 'default'}>{v}{r.vencida ? ' (vencida)' : ''}</Tag>
            ),
          },
          {
            title: '', width: 110,
            render: (_: unknown, r: Reserva) =>
              tienePermiso('reservas.liberar') && r.estado === 'ACTIVA' ? (
                <Button size="small" icon={<UnlockOutlined />} onClick={() => liberar(r)}>Liberar</Button>
              ) : null,
          },
        ]}
      />
      <Modal
        title="Nueva reserva" open={modalNuevo} width={700}
        onCancel={() => setModalNuevo(false)} onOk={guardar} okText="Crear reserva" cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="clienteId" label="Cliente" rules={[{ required: true, message: 'Obligatorio' }]} style={{ minWidth: 240 }}>
              <Select showSearch optionFilterProp="label" options={clientes.map((c) => ({ value: c.id, label: c.nombreCompleto }))} placeholder="Seleccione" />
            </Form.Item>
            <Form.Item name="pedidoRef" label="Pedido asociado" rules={[{ required: true, message: 'Obligatorio' }]}>
              <Input placeholder="Ej: PED-777" />
            </Form.Item>
            <Form.Item name="fechaLimite" label="Fecha límite" rules={[{ required: true, message: 'Obligatorio' }]}>
              <DatePicker showTime />
            </Form.Item>
          </Space>
          <Form.Item label="Producto (agregar línea)">
            <Select
              showSearch optionFilterProp="label" value={undefined}
              onChange={(id: number) => {
                const ref = referencias.find((r) => r.id === id);
                if (ref && !lineas.some((l) => l.referenciaId === id)) {
                  setLineas((prev) => [...prev, { referenciaId: id, descripcion: ref.descripcion, cantidad: 1 }]);
                }
              }}
              options={referencias.filter((r) => !lineas.some((l) => l.referenciaId === r.id)).map((r) => ({ value: r.id, label: `${r.codigoBarras} — ${r.descripcion}` }))}
              placeholder="Busque el producto"
            />
          </Form.Item>
        </Form>
        <Table
          rowKey="referenciaId" size="small" pagination={false} dataSource={lineas}
          columns={[
            { title: 'Producto', dataIndex: 'descripcion' },
            {
              title: 'Cantidad', dataIndex: 'cantidad', width: 130,
              render: (_: unknown, l: (typeof lineas)[number]) => (
                <InputNumber min={0.0001} value={l.cantidad}
                  onChange={(v) => setLineas((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, cantidad: v ?? 1 } : x)))} />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}

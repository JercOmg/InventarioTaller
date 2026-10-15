import { useCallback, useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Radio, Checkbox, App, Typography, Space } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import { api, mensajeError } from '../api/client';

interface Tercero {
  id: number;
  identificacion: string;
  tipoPersona: 'NATURAL' | 'JURIDICA';
  nombre: string | null;
  apellido: string | null;
  razonSocial: string | null;
  telefono: string | null;
  email: string | null;
  esCliente: boolean;
  esProveedor: boolean;
  nombreCompleto: string;
}

export function Terceros() {
  const { message } = App.useApp();
  const [items, setItems] = useState<Tercero[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Tercero | null>(null);
  const [form] = Form.useForm();

  const tipoPersona = Form.useWatch('tipoPersona', form);

  const cargar = useCallback(async (q?: string) => {
    setCargando(true);
    try {
      const { data } = await api.get<Tercero[]>('/terceros', { params: q ? { busqueda: q } : {} });
      setItems(data);
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

  const abrirNuevo = () => {
    setEditando(null);
    form.resetFields();
    form.setFieldsValue({ tipoPersona: 'NATURAL', esCliente: true, esProveedor: false });
    setModalAbierto(true);
  };

  const abrirEdicion = (t: Tercero) => {
    setEditando(t);
    form.setFieldsValue({
      ...t,
      esCliente: t.esCliente,
      esProveedor: t.esProveedor,
    });
    setModalAbierto(true);
  };

  const guardar = async (valores: Record<string, unknown>) => {
    try {
      if (editando) {
        await api.put(`/terceros/${editando.id}`, valores);
        message.success('Tercero actualizado');
      } else {
        await api.post('/terceros', valores);
        message.success('Tercero creado');
      }
      setModalAbierto(false);
      cargar();
    } catch (e) {
      message.error(mensajeError(e, 'No se pudo guardar el tercero'));
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Clientes y Proveedores (Terceros)</Typography.Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Buscar por identificación o nombre"
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 340 }}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onPressEnter={() => cargar(busqueda)}
        />
        <Button icon={<SearchOutlined />} onClick={() => cargar(busqueda)}>Buscar</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirNuevo}>Nuevo tercero</Button>
      </Space>
      <Table
        rowKey="id"
        size="small"
        loading={cargando}
        dataSource={items}
        columns={[
          { title: 'Identificación', dataIndex: 'identificacion' },
          { title: 'Nombre / Razón social', dataIndex: 'nombreCompleto' },
          { title: 'Tipo', dataIndex: 'tipoPersona', render: (v: string) => (v === 'JURIDICA' ? 'Jurídica' : 'Natural') },
          { title: 'Teléfono', dataIndex: 'telefono' },
          {
            title: 'Roles', key: 'roles',
            render: (_: unknown, t: Tercero) => (
              <Space>
                {t.esCliente && <span>Cliente</span>}
                {t.esProveedor && <span>Proveedor</span>}
              </Space>
            ),
          },
          {
            title: '', key: 'acc', width: 60,
            render: (_: unknown, t: Tercero) => (
              <Button size="small" icon={<EditOutlined />} onClick={() => abrirEdicion(t)} />
            ),
          },
        ]}
      />
      <Modal
        title={editando ? `Editar tercero: ${editando.nombreCompleto}` : 'Nuevo tercero'}
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item name="identificacion" label="Identificación (NIT o cédula)" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input disabled={Boolean(editando)} />
          </Form.Item>
          <Form.Item name="tipoPersona" label="Tipo de persona" rules={[{ required: true }]}>
            <Radio.Group options={[{ value: 'NATURAL', label: 'Natural' }, { value: 'JURIDICA', label: 'Jurídica' }]} optionType="button" />
          </Form.Item>
          {tipoPersona === 'JURIDICA' ? (
            <Form.Item name="razonSocial" label="Razón social" rules={[{ required: true, message: 'Obligatorio para persona jurídica' }]}>
              <Input />
            </Form.Item>
          ) : (
            <Space size="middle" style={{ display: 'flex' }}>
              <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Input />
              </Form.Item>
            </Space>
          )}
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="telefono" label="Teléfono"><Input /></Form.Item>
            <Form.Item name="email" label="Correo"><Input /></Form.Item>
          </Space>
          <Form.Item label="Roles comerciales" style={{ marginBottom: 4 }}>
            <Space>
              <Form.Item name="esCliente" valuePropName="checked" noStyle><Checkbox>Cliente</Checkbox></Form.Item>
              <Form.Item name="esProveedor" valuePropName="checked" noStyle><Checkbox>Proveedor</Checkbox></Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

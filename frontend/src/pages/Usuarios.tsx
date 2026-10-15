import { useCallback, useEffect, useState } from 'react';
import { Typography, Table, Button, Modal, Form, Input, App, Tag, Checkbox, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Usuario {
  id: number; nombreCompleto: string; nombreUsuario: string; email: string | null;
  activo: boolean; roles: string[]; rolesNombres: string[]; fechaCreacion: string;
}
interface Rol { codigo: string; nombre: string; descripcion: string | null; permisos: string[] }

export function Usuarios() {
  const { usuario: actual } = useAuth();
  const { message } = App.useApp();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form] = Form.useForm();

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [u, r] = await Promise.all([api.get<Usuario[]>('/usuarios'), api.get<Rol[]>('/usuarios/roles')]);
      setUsuarios(u.data);
      setRoles(r.data);
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

  const guardar = async (valores: Record<string, unknown>) => {
    try {
      if (editando) {
        const cuerpo: Record<string, unknown> = {
          nombreCompleto: valores.nombreCompleto,
          email: valores.email ?? '',
          roles: valores.roles,
          activo: valores.activo,
        };
        if (valores.password) cuerpo.password = valores.password;
        await api.put(`/usuarios/${editando.id}`, cuerpo);
        message.success('Usuario actualizado');
      } else {
        await api.post('/usuarios', valores);
        message.success('Usuario creado');
      }
      setModalAbierto(false);
      cargar();
    } catch (e) {
      message.error(mensajeError(e, 'No se pudo guardar el usuario'));
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Usuarios, Roles y Permisos</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditando(null); form.resetFields(); setModalAbierto(true); }}>Nuevo usuario</Button>
        <Button icon={<ReloadOutlined />} onClick={cargar} />
      </Space>
      <Table
        rowKey="id" size="small" loading={cargando} dataSource={usuarios}
        columns={[
          { title: 'Usuario', dataIndex: 'nombreUsuario' },
          { title: 'Nombre completo', dataIndex: 'nombreCompleto' },
          { title: 'Correo', dataIndex: 'email', render: (v: string | null) => v ?? '—' },
          { title: 'Roles', dataIndex: 'rolesNombres', render: (v: string[]) => v.map((r) => <Tag key={r}>{r}</Tag>) },
          {
            title: 'Estado', dataIndex: 'activo',
            render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Tag>,
          },
          { title: 'Creado', dataIndex: 'fechaCreacion', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
          {
            title: '', width: 80,
            render: (_: unknown, u: Usuario) => (
              <Button size="small" disabled={u.id === actual?.id} onClick={() => {
                setEditando(u);
                form.setFieldsValue({ nombreCompleto: u.nombreCompleto, email: u.email, roles: u.roles, activo: u.activo });
                setModalAbierto(true);
              }}>Editar</Button>
            ),
          },
        ]}
      />
      <Modal
        title={editando ? `Editar: ${editando.nombreUsuario}` : 'Nuevo usuario'}
        open={modalAbierto} onCancel={() => setModalAbierto(false)} onOk={() => form.submit()}
        okText="Guardar" cancelText="Cancelar" destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item name="nombreCompleto" label="Nombre completo" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input />
          </Form.Item>
          {!editando && (
            <>
              <Form.Item name="nombreUsuario" label="Nombre de usuario (único)" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Input />
              </Form.Item>
            </>
          )}
          <Form.Item name="email" label="Correo"><Input /></Form.Item>
          <Form.Item
            name="password"
            label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña temporal'}
            rules={editando ? [] : [{ required: true, message: 'Obligatorio' }, { min: 8, message: 'Mínimo 8 caracteres' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="roles" label="Roles asignados" rules={[{ required: true, message: 'Seleccione al menos un rol' }]}>
            <Checkbox.Group
              options={roles.map((r) => ({ value: r.codigo, label: r.nombre }))}
            />
          </Form.Item>
          <Form.Item name="activo" label="Cuenta activa" valuePropName="checked" initialValue>
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

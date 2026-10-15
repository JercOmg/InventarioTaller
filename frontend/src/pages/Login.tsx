import { Card, Form, Input, Button, Typography, App } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { mensajeError } from '../api/client';

export function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  if (usuario) return <Navigate to="/" replace />;

  const enviar = async (valores: { nombreUsuario: string; password: string }) => {
    try {
      await iniciarSesion(valores.nombreUsuario, valores.password);
      message.success('Bienvenido');
      navigate('/');
    } catch (e) {
      message.error(mensajeError(e, 'Usuario o contraseña incorrectos'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f2d3d 0%, #274b6d 100%)',
      }}
    >
      <Card style={{ width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          🔧 Sistema de Inventario — Ferretería
        </Typography.Title>
        <Form onFinish={enviar} layout="vertical" data-testid="form-login">
          <Form.Item name="nombreUsuario" rules={[{ required: true, message: 'Ingrese su usuario' }]}>
            <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" data-testid="input-usuario" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Ingrese su contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" data-testid="input-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" data-testid="btn-login">
            Iniciar sesión
          </Button>
        </Form>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16, fontSize: 12 }}>
          Demo: admin / Admin123! · vendedor / Vendedor123! · bodega / Bodega123!
        </Typography.Text>
      </Card>
    </div>
  );
}

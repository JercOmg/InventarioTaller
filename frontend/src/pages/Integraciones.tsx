import { useCallback, useEffect, useState } from 'react';
import { Typography, Table, Button, App, Alert, Tag, Input } from 'antd';
import { api, mensajeError } from '../api/client';

interface ApiKey { id: number; nombre: string; activa: boolean; createdAt: string }

export function Integraciones() {
  const { message, modal } = App.useApp();
  const [info, setInfo] = useState<{ descripcion: string; decisionesPendientes: string; apiKeys: ApiKey[] } | null>(null);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/integraciones');
      setInfo(data);
    } catch (e) {
      message.error(mensajeError(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crearClave = () => {
    let nombre = '';
    modal.confirm({
      title: 'Nueva API Key para sistema externo',
      content: <Input placeholder="Nombre del sistema (ej: Contabilidad Siigo)" onChange={(e) => (nombre = e.target.value)} />,
      okText: 'Crear',
      onOk: async () => {
        try {
          const { data } = await api.post('/integraciones/api-keys', { nombre });
          modal.info({
            title: 'API Key generada',
            content: (
              <div>
                <p>Copie esta clave ahora: no podrá volver a consultarse.</p>
                <code style={{ wordBreak: 'break-all' }}>{data.key}</code>
              </div>
            ),
          });
          cargar();
        } catch (e) {
          message.error(mensajeError(e));
        }
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4}>Integraciones (RF-25)</Typography.Title>
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message={info?.descripcion ?? 'Cargando...'}
        description={info?.decisionesPendientes}
      />
      <Button type="primary" style={{ marginBottom: 16 }} onClick={crearClave}>Generar API Key</Button>
      <Table
        rowKey="id" size="small" dataSource={info?.apiKeys ?? []}
        columns={[
          { title: 'Nombre', dataIndex: 'nombre' },
          { title: 'Creada', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('es-CO') },
          { title: 'Estado', dataIndex: 'activa', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Activa' : 'Inactiva'}</Tag> },
        ]}
      />
    </div>
  );
}

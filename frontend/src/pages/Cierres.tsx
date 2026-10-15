import { useCallback, useEffect, useState } from 'react';
import { Typography, Table, Button, Modal, Input, App, Tag, Space } from 'antd';
import { LockOutlined, UnlockOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Cierre {
  id: number; periodo: string; estado: string; cerro: string; fechaCierre: string;
  reabrio: string | null; fechaReapertura: string | null; motivoReapertura: string | null;
}

export function Cierres() {
  const { tienePermiso } = useAuth();
  const { message, modal } = App.useApp();
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [periodoInput, setPeriodoInput] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get<Cierre[]>('/cierres');
      setCierres(data);
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

  const ejecutarCierre = async () => {
    try {
      await api.post('/cierres', { periodo: periodoInput });
      message.success(`Periodo ${periodoInput} cerrado: las transacciones con fecha en ese mes quedan bloqueadas`);
      setModalAbierto(false);
      setPeriodoInput('');
      cargar();
    } catch (e) {
      message.error(mensajeError(e));
    }
  };

  const reabrir = (c: Cierre) => {
    let motivo = '';
    modal.confirm({
      title: `Reabrir periodo ${c.periodo}`,
      content: <Input.TextArea placeholder="Motivo de la reapertura (obligatorio, queda en auditoría)" onChange={(e) => (motivo = e.target.value)} />,
      okText: 'Reabrir',
      onOk: async () => {
        try {
          await api.post(`/cierres/${c.id}/reabrir`, { motivo });
          message.success('Periodo reabierto temporalmente; la acción quedó registrada en auditoría');
          cargar();
        } catch (e) {
          message.error(mensajeError(e));
        }
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4}>Cierres Mensuales</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        {tienePermiso('cierres.ejecutar') && (
          <Button type="primary" danger icon={<LockOutlined />} onClick={() => setModalAbierto(true)}>Cerrar periodo</Button>
        )}
        <Button icon={<ReloadOutlined />} onClick={cargar} />
      </Space>
      <Table
        rowKey="id" size="small" loading={cargando} dataSource={cierres}
        columns={[
          { title: 'Periodo', dataIndex: 'periodo', width: 110 },
          {
            title: 'Estado', dataIndex: 'estado', width: 120,
            render: (v: string) => <Tag color={v === 'CERRADO' ? 'red' : 'orange'}>{v}</Tag>,
          },
          { title: 'Cerró', dataIndex: 'cerro' },
          { title: 'Fecha cierre', dataIndex: 'fechaCierre', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
          { title: 'Reabrió', dataIndex: 'reabrio', render: (v: string | null) => v ?? '—' },
          { title: 'Motivo reapertura', dataIndex: 'motivoReapertura', render: (v: string | null) => v ?? '—', ellipsis: true },
          {
            title: '', width: 120,
            render: (_: unknown, c: Cierre) =>
              tienePermiso('cierres.ejecutar') && c.estado === 'CERRADO' ? (
                <Button size="small" icon={<UnlockOutlined />} onClick={() => reabrir(c)}>Reabrir</Button>
              ) : null,
          },
        ]}
      />
      <Modal title="Cerrar periodo contable" open={modalAbierto} onOk={ejecutarCierre} onCancel={() => setModalAbierto(false)} okText="Cerrar periodo" okButtonProps={{ danger: true }} cancelText="Cancelar">
        <Input placeholder="Periodo (formato AAAA-MM, ej: 2026-09)" value={periodoInput} onChange={(e) => setPeriodoInput(e.target.value)} style={{ marginBottom: 12 }} />
        <Typography.Text type="secondary">
          Se consolidarán los saldos del mes y quedará bloqueada la creación o modificación de transacciones con fecha dentro del periodo. Solo Gerencia puede reabrirlo con motivo auditado.
        </Typography.Text>
      </Modal>
    </div>
  );
}

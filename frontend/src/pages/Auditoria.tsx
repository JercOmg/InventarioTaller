import { useCallback, useEffect, useState } from 'react';
import { Typography, Table, Input, Select, DatePicker, Button, App, Space, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';

interface AuditoriaItem {
  id: number;
  tablaAfectada: string;
  registroId: number;
  accion: string;
  entidad: string | null;
  usuario: { nombreUsuario: string; nombreCompleto: string };
  direccionIp: string | null;
  estadoAnterior: unknown;
  estadoNuevo: unknown;
  fechaEvento: string;
}

export function Auditoria() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AuditoriaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState<{ desde?: string; hasta?: string; tabla?: string; accion?: string; pagina: number }>({ pagina: 1 });

  const cargar = useCallback(async (f = filtros) => {
    setCargando(true);
    try {
      const { data } = await api.get<{ total: number; items: AuditoriaItem[] }>('/auditoria', {
        params: { ...f, tamano: 30 },
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      message.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Typography.Title level={4}>Auditoría de Movimientos (RF-22)</Typography.Title>
      <Typography.Text type="secondary">
        Registro inmutable: quien, cuándo, desde dónde y qué cambió. Ningún rol puede modificar o eliminar estos registros.
      </Typography.Text>
      <Space style={{ margin: '16px 0' }} wrap>
        <DatePicker.RangePicker
          onChange={(fechas) => setFiltros((f) => ({ ...f, desde: fechas?.[0]?.toISOString(), hasta: fechas?.[1]?.toISOString(), pagina: 1 }))}
        />
        <Input
          placeholder="Tabla afectada (ej: ventas)" style={{ width: 200 }}
          onChange={(e) => setFiltros((f) => ({ ...f, tabla: e.target.value || undefined, pagina: 1 }))}
        />
        <Select
          allowClear placeholder="Acción" style={{ width: 140 }}
          options={['INSERT', 'UPDATE', 'ANULACION', 'LOGIN', 'APROBACION', 'RECHAZO'].map((a) => ({ value: a, label: a }))}
          onChange={(v) => setFiltros((f) => ({ ...f, accion: v, pagina: 1 }))}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => cargar({ ...filtros, pagina: 1 })}>Filtrar</Button>
        <Button icon={<ReloadOutlined />} onClick={() => { setFiltros({ pagina: 1 }); cargar({ pagina: 1 }); }} />
      </Space>
      <Table
        rowKey="id" size="small" loading={cargando} dataSource={items}
        pagination={{ total, pageSize: 30, current: filtros.pagina, onChange: (p) => { setFiltros((f) => ({ ...f, pagina: p })); cargar({ ...filtros, pagina: p }); } }}
        columns={[
          { title: 'Fecha/Hora', dataIndex: 'fechaEvento', width: 160, render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss') },
          { title: 'Acción', dataIndex: 'accion', width: 110, render: (v: string) => <Tag color={v === 'INSERT' ? 'green' : v === 'UPDATE' ? 'blue' : v === 'ANULACION' ? 'red' : 'purple'}>{v}</Tag> },
          { title: 'Tabla', dataIndex: 'tablaAfectada', width: 170 },
          { title: 'Registro', dataIndex: 'registroId', width: 80 },
          { title: 'Usuario', dataIndex: ['usuario', 'nombreUsuario'], width: 110 },
          { title: 'IP', dataIndex: 'direccionIp', width: 130 },
          {
            title: 'Estado anterior → nuevo', ellipsis: true,
            render: (_: unknown, r: AuditoriaItem) => (
              <span style={{ fontSize: 12 }}>
                {r.estadoAnterior !== null && r.estadoAnterior !== undefined ? JSON.stringify(r.estadoAnterior) : '—'}
                {' → '}
                {r.estadoNuevo !== null && r.estadoNuevo !== undefined ? JSON.stringify(r.estadoNuevo) : '—'}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

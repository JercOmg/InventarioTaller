import { useState } from 'react';
import { Typography, Table, Input, Tag, App, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { api, mensajeError } from '../api/client';

interface Garantia {
  id: number; factura: string | null; cliente: string; producto: string;
  mesesCobertura: number; fechaInicio: string; fechaFin: string; estado: 'VIGENTE' | 'EXPIRADA';
}

export function Garantias() {
  const { message } = App.useApp();
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [factura, setFactura] = useState('');

  const consultar = async (f?: string) => {
    try {
      const { data } = await api.get<Garantia[]>('/garantias', { params: f ? { factura: f } : {} });
      setGarantias(data);
      if (f && data.length === 0) message.info(`No hay garantías registradas para la factura ${f}`);
    } catch (e) {
      message.error(mensajeError(e));
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Garantías Posventa</Typography.Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Número de factura (ej: FV-000001)"
          value={factura}
          onChange={(e) => setFactura(e.target.value)}
          onPressEnter={() => consultar(factura)}
          style={{ width: 280 }}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={() => consultar(factura)}>Consultar</Button>
        <Button onClick={() => { setFactura(''); consultar(); }}>Ver todas</Button>
      </Space>
      <Table
        rowKey="id" size="small" dataSource={garantias}
        columns={[
          { title: 'Factura', dataIndex: 'factura' },
          { title: 'Cliente', dataIndex: 'cliente' },
          { title: 'Producto', dataIndex: 'producto' },
          { title: 'Cobertura', dataIndex: 'mesesCobertura', render: (v: number) => `${v} meses` },
          { title: 'Inicio', dataIndex: 'fechaInicio', render: (v: string) => new Date(v).toLocaleDateString('es-CO') },
          { title: 'Fin', dataIndex: 'fechaFin', render: (v: string) => new Date(v).toLocaleDateString('es-CO') },
          {
            title: 'Estado', dataIndex: 'estado',
            render: (v: string) => <Tag color={v === 'VIGENTE' ? 'green' : 'red'}>{v}</Tag>,
          },
        ]}
      />
    </div>
  );
}

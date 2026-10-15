import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Table, Tag, Alert, Empty } from 'antd';
import {
  WarningOutlined, ClockCircleOutlined, LockOutlined, ShoppingOutlined, InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../api/client';

interface DashboardData {
  referenciasActivas: number;
  ventasHoy: number;
  saldos: { disponible: number; reservada: number; danada: number };
  reservas: { activas: number; porVencer: number };
  alertas: { diasAntelacion: number };
  stockBajo: { referenciaId: number; codigoBarras: string; descripcion: string; disponible: number; reservada: number }[];
  proximosVencimientos: { id: number; producto: string; fechaVencimiento: string; cantidadIngresada: number }[];
  reservasPorVencer: { id: number; consecutivo: string; cliente: string | null; fechaLimite: string; unidades: number }[];
  ultimasVentas: { id: number; factura: string; cliente: string; total: number; fecha: string }[];
}

export function Dashboard() {
  const [datos, setDatos] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then((r) => setDatos(r.data));
  }, []);

  if (!datos) return <Card loading style={{ minHeight: 300 }} />;

  return (
    <div>
      <Typography.Title level={4}>Dashboard</Typography.Title>

      {datos.reservas.porVencer > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<LockOutlined />}
          style={{ marginBottom: 12 }}
          message={`${datos.reservas.porVencer} reserva(s) vencen en los próximos 3 días — revise la sección Reservas`}
        />
      )}
      {datos.stockBajo.some((s) => s.disponible === 0) && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 12 }}
          message="Hay productos agotados: revise la tabla de stock crítico más abajo y registre una compra"
        />
      )}

      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card size="small"><Statistic title="Referencias activas" value={datos.referenciasActivas} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Ventas de hoy" value={datos.ventasHoy} prefix={<ShoppingOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Disponible" value={datos.saldos.disponible} valueStyle={{ color: '#3f8600' }} prefix={<InboxOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Reservado" value={datos.saldos.reservada} valueStyle={{ color: '#cf8a08' }} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Dañado" value={datos.saldos.danada} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="Reservas activas" value={datos.reservas.activas} prefix={<LockOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col span={12}>
          <Card
            size="small"
            title={<><WarningOutlined /> Stock crítico (5 unidades o menos)</>}
          >
            {datos.stockBajo.length === 0 ? (
              <Empty description="Ningún producto en nivel crítico" />
            ) : (
              <Table
                rowKey="referenciaId" size="small" pagination={false} dataSource={datos.stockBajo}
                columns={[
                  { title: 'Producto', dataIndex: 'descripcion', ellipsis: true },
                  { title: 'Código', dataIndex: 'codigoBarras', width: 150 },
                  {
                    title: 'Disponible', dataIndex: 'disponible', width: 100,
                    render: (v: number) => <Tag color={v === 0 ? 'red' : 'orange'}>{v}</Tag>,
                  },
                ]}
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title={<><ClockCircleOutlined /> Próximos vencimientos ({datos.alertas.diasAntelacion} días)</>}>
            {datos.proximosVencimientos.length === 0 ? (
              <Empty description="Ningún producto próximo a vencer" />
            ) : (
              <Table
                rowKey="id" size="small" pagination={false} dataSource={datos.proximosVencimientos}
                columns={[
                  { title: 'Producto', dataIndex: 'producto', ellipsis: true },
                  { title: 'Vence', dataIndex: 'fechaVencimiento', width: 110, render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
                  { title: 'Cant.', dataIndex: 'cantidadIngresada', width: 70 },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col span={12}>
          <Card size="small" title="Últimas ventas">
            {datos.ultimasVentas.length === 0 ? (
              <Empty description="Aún no hay ventas registradas" />
            ) : (
              <Table
                rowKey="id" size="small" pagination={false} dataSource={datos.ultimasVentas}
                columns={[
                  { title: 'Factura', dataIndex: 'factura', width: 110 },
                  { title: 'Cliente', dataIndex: 'cliente', ellipsis: true },
                  { title: 'Fecha', dataIndex: 'fecha', width: 130, render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
                  { title: 'Total', dataIndex: 'total', width: 110, render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                ]}
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title={<><LockOutlined /> Reservas activas (por fecha límite)</>}>
            {datos.reservasPorVencer.length === 0 ? (
              <Empty description="No hay reservas activas" />
            ) : (
              <Table
                rowKey="id" size="small" pagination={false} dataSource={datos.reservasPorVencer}
                columns={[
                  { title: 'Consecutivo', dataIndex: 'consecutivo', width: 120 },
                  { title: 'Cliente', dataIndex: 'cliente', ellipsis: true },
                  { title: 'Límite', dataIndex: 'fechaLimite', width: 110, render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
                  { title: 'Unidades', dataIndex: 'unidades', width: 90 },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

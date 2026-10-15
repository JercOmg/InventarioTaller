import { useCallback, useEffect, useState } from 'react';
import { Typography, Card, InputNumber, Button, Table, App, Space, Divider, Tag, Row, Col, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface ReferenciaLista {
  id: number;
  codigoBarras: string;
  descripcion: string;
  precioVenta: number;
}
interface HistorialPrecio {
  id: number; precioAnterior: number; precioNuevo: number; porcentajeIncremento: number | null; usuario: string; fecha: string;
}
interface HistorialCosto { id: number; costoAnterior: number; costoNuevo: number; origen: string; fecha: string }
interface InfoPrecios {
  referencia: { descripcion: string; precioVigente: number; costoPromedio?: number };
  precios: HistorialPrecio[];
  costos: HistorialCosto[];
}

export function Precios() {
  const { tienePermiso } = useAuth();
  const { message } = App.useApp();
  const [referencias, setReferencias] = useState<ReferenciaLista[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [info, setInfo] = useState<InfoPrecios | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [porcentaje, setPorcentaje] = useState<number | null>(null);
  const [precioDirecto, setPrecioDirecto] = useState<number | null>(null);

  const cargarReferencias = useCallback(async (q?: string) => {
    setCargando(true);
    try {
      const { data } = await api.get<ReferenciaLista[]>('/catalogo/referencias', {
        params: q ? { busqueda: q } : {},
      });
      setReferencias(data);
    } catch (e) {
      message.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga inmediata: la lista de productos de la izquierda siempre visible
  useEffect(() => {
    cargarReferencias();
  }, [cargarReferencias]);

  const seleccionar = async (id: number) => {
    setSeleccionada(id);
    setPorcentaje(null);
    setPrecioDirecto(null);
    try {
      const { data } = await api.get<InfoPrecios>(`/precios/${id}/historial`);
      setInfo(data);
    } catch (e) {
      message.error(mensajeError(e));
    }
  };

  const guardar = async () => {
    if (!seleccionada) return;
    if (porcentaje === null && precioDirecto === null) {
      message.warning('Indique un porcentaje de incremento o un precio directo');
      return;
    }
    setGuardando(true);
    try {
      const { data } = await api.post('/precios', {
        referenciaId: seleccionada,
        ...(porcentaje !== null ? { porcentajeIncremento: porcentaje } : { precioNuevo: precioDirecto }),
      });
      message.success(
        `Precio actualizado: $${data.precioAnterior.toLocaleString('es-CO')} → $${data.precioNuevo.toLocaleString('es-CO')}`,
      );
      setPorcentaje(null);
      setPrecioDirecto(null);
      seleccionar(seleccionada);
      cargarReferencias(busqueda || undefined);
    } catch (e) {
      message.error(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Precios de Venta</Typography.Title>
      <Row gutter={16}>
        {/* Panel izquierdo: lista de productos siempre visible */}
        <Col span={10}>
          <Card size="small" title="Productos del catálogo (haga clic para ver y editar su precio)">
            <Input.Search
              placeholder="Buscar por código de barras o nombre"
              prefix={<SearchOutlined />}
              allowClear
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onSearch={() => cargarReferencias(busqueda || undefined)}
              style={{ marginBottom: 12 }}
            />
            <Table
              rowKey="id"
              size="small"
              loading={cargando}
              dataSource={referencias}
              pagination={{ pageSize: 12, showSizeChanger: false }}
              onRow={(r) => ({ onClick: () => seleccionar(r.id), style: { cursor: 'pointer' } })}
              rowClassName={(r) => (r.id === seleccionada ? 'ant-table-row-selected' : '')}
              columns={[
                { title: 'Producto', dataIndex: 'descripcion', ellipsis: true },
                {
                  title: 'Precio vigente', dataIndex: 'precioVenta', width: 120,
                  render: (v: number) => `$${v.toLocaleString('es-CO')}`,
                },
              ]}
            />
          </Card>
        </Col>

        {/* Panel derecho: detalle e historial del producto seleccionado */}
        <Col span={14}>
          {!info ? (
            <Card size="small">
              <Typography.Text type="secondary">
                Seleccione un producto de la lista de la izquierda para consultar su precio vigente,
                su historial y realizar cambios.
              </Typography.Text>
            </Card>
          ) : (
            <Card
              size="small"
              title={`Vigente: $${info.referencia.precioVigente.toLocaleString('es-CO')}${
                info.referencia.costoPromedio !== undefined
                  ? ` | Costo promedio: $${info.referencia.costoPromedio.toLocaleString('es-CO')}`
                  : ''
              }`}
            >
              {tienePermiso('precios.editar') && (
                <>
                  <Space size="middle" style={{ marginBottom: 16 }} wrap>
                    <span>Porcentaje de incremento sobre el costo:</span>
                    <InputNumber min={0} max={1000} value={porcentaje} onChange={setPorcentaje} addonAfter="%" style={{ width: 140 }} />
                    <span>o precio directo:</span>
                    <InputNumber min={0} value={precioDirecto} onChange={setPrecioDirecto} prefix="$" style={{ width: 160 }} />
                    <Button type="primary" loading={guardando} onClick={guardar}>Actualizar precio</Button>
                  </Space>
                  <Divider />
                </>
              )}
              <Typography.Title level={5}>Historial de precios (inmutable)</Typography.Title>
              {info.precios.length === 0 ? (
                <Typography.Text type="secondary">Sin cambios de precio registrados aún.</Typography.Text>
              ) : (
                <Table
                  rowKey="id" size="small" pagination={false} dataSource={info.precios}
                  columns={[
                    { title: 'Anterior', dataIndex: 'precioAnterior', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                    { title: 'Nuevo', dataIndex: 'precioNuevo', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                    { title: '%', dataIndex: 'porcentajeIncremento', render: (v: number | null) => (v !== null ? <Tag color={v >= 0 ? 'green' : 'red'}>{v}%</Tag> : '—') },
                    { title: 'Responsable', dataIndex: 'usuario' },
                    { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
                  ]}
                />
              )}
              {info.costos.length > 0 && (
                <>
                  <Typography.Title level={5} style={{ marginTop: 24 }}>Historial de costos</Typography.Title>
                  <Table
                    rowKey="id" size="small" pagination={false} dataSource={info.costos}
                    columns={[
                      { title: 'Anterior', dataIndex: 'costoAnterior', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                      { title: 'Nuevo', dataIndex: 'costoNuevo', render: (v: number) => `$${v.toLocaleString('es-CO')}` },
                      { title: 'Origen', dataIndex: 'origen' },
                      { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
                    ]}
                  />
                </>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

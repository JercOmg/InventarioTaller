import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card, Col, Row, Input, InputNumber, Button, Table, Form, Select, App, Typography, Statistic, Divider, Tabs,
} from 'antd';
import { DeleteOutlined, ScanOutlined, CheckOutlined } from '@ant-design/icons';
import { api, mensajeError } from '../api/client';
import type { InputRef } from 'antd';

interface RefVenta {
  referenciaId: number;
  codigoBarras: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: number;
  disponible: number;
  fraccionMinima: number;
}

interface Tercero { id: number; nombreCompleto: string; identificacion: string }

export function PuntoVenta() {
  const { message, modal } = App.useApp();
  const [lineas, setLineas] = useState<RefVenta[]>([]);
  const [clientes, setClientes] = useState<Tercero[]>([]);
  const [reservas, setReservas] = useState<{ id: number; consecutivo: string; cliente: string; estado: string; detalles: { descripcion: string; cantidad: number }[] }[]>([]);
  const [clienteId, setClienteId] = useState<number | undefined>();
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const escaner = useRef<InputRef>(null);

  const subtotal = lineas.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0);

  const cargarAuxiliares = useCallback(async () => {
    const [cl, res] = await Promise.all([
      api.get('/terceros', { params: { rol: 'cliente' } }),
      api.get('/reservas', { params: { estado: 'ACTIVA' } }),
    ]);
    setClientes(cl.data);
    setReservas(res.data);
  }, []);

  useEffect(() => {
    cargarAuxiliares();
  }, [cargarAuxiliares]);

  /** Agrega un producto escaneado o buscado — RF-24: escaneo continuo. */
  const agregarPorCodigo = async (codigo: string) => {
    if (!codigo.trim()) return;
    try {
      const { data } = await api.get('/catalogo/referencias', { params: { codigoBarras: codigo.trim() } });
      if (data.length === 0) {
        message.error('Producto no encontrado');
        return;
      }
      const r = data[0];
      setLineas((prev) => {
        const existente = prev.find((l) => l.referenciaId === r.id);
        if (existente) {
          return prev.map((l) => (l.referenciaId === r.id ? { ...l, cantidad: l.cantidad + 1 } : l));
        }
        return [
          ...prev,
          {
            referenciaId: r.id,
            codigoBarras: r.codigoBarras,
            descripcion: r.descripcion,
            unidad: r.unidadBase?.codigo ?? 'UND',
            cantidad: 1,
            precioUnitario: r.precioVenta,
            ivaPorcentaje: r.ivaPorcentaje,
            disponible: r.saldos?.disponible ?? 0,
            fraccionMinima: r.fraccionMinima,
          },
        ];
      });
    } catch (e) {
      message.error(mensajeError(e, 'Producto no encontrado'));
    } finally {
      escaner.current?.focus(); // queda lista para el siguiente escaneo
    }
  };

  const confirmarVenta = async () => {
    if (lineas.length === 0) {
      message.warning('Agregue productos a la venta');
      return;
    }
    setProcesando(true);
    try {
      const { data } = await api.post('/ventas', {
        clienteId: clienteId ?? null,
        descuentoGlobal: descuentoGlobal || undefined,
        detalles: lineas.map((l) => ({ referenciaId: l.referenciaId, cantidad: l.cantidad })),
      });
      message.success(`Factura ${data.factura} emitida por $${data.total.toLocaleString('es-CO')}`);
      setLineas([]);
      setDescuentoGlobal(0);
      setClienteId(undefined);
      cargarAuxiliares();
    } catch (e) {
      modal.error({
        title: 'La transacción no pudo completarse',
        content: mensajeError(e, 'No fue posible registrar la venta'),
      });
    } finally {
      setProcesando(false);
    }
  };

  const convertirReserva = async (reservaId: number) => {
    setProcesando(true);
    try {
      const { data } = await api.post('/ventas', { reservaId });
      message.success(`Reserva convertida: factura ${data.factura} por $${data.total.toLocaleString('es-CO')}`);
      setLineas([]);
      cargarAuxiliares();
    } catch (e) {
      modal.error({ title: 'No se pudo convertir la reserva', content: mensajeError(e) });
    } finally {
      setProcesando(false);
    }
  };

  const tabCarrito = (
    <Row gutter={16}>
      <Col span={16}>
        <Input
          size="large"
          ref={escaner}
          prefix={<ScanOutlined />}
          placeholder="Escanee el código de barras o digítelo y presione Enter"
          onPressEnter={(e) => {
            const codigo = (e.target as HTMLInputElement).value;
            agregarPorCodigo(codigo).then(() => {
              (e.target as HTMLInputElement).value = '';
            });
          }}
          style={{ marginBottom: 12 }}
          data-testid="input-escaner"
        />
        <Table
          rowKey="referenciaId"
          size="small"
          dataSource={lineas}
          pagination={false}
          columns={[
            { title: 'Código', dataIndex: 'codigoBarras', width: 130 },
            { title: 'Descripción', dataIndex: 'descripcion' },
            {
              title: 'Cantidad', dataIndex: 'cantidad', width: 130,
              render: (_: unknown, l: RefVenta) => (
                <InputNumber
                  min={l.fraccionMinima}
                  step={l.fraccionMinima}
                  value={l.cantidad}
                  onChange={(v) => setLineas((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, cantidad: v ?? 1 } : x)))}
                  status={l.cantidad > l.disponible ? 'error' : undefined}
                />
              ),
            },
            { title: 'Precio', dataIndex: 'precioUnitario', width: 110, render: (v: number) => `$${v.toLocaleString('es-CO')}` },
            {
              title: '', width: 50,
              render: (_: unknown, l: RefVenta) => (
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setLineas((prev) => prev.filter((x) => x.referenciaId !== l.referenciaId))} />
              ),
            },
          ]}
          footer={() =>
            lineas.some((l) => l.cantidad > l.disponible) ? (
              <Typography.Text type="danger">Hay productos con cantidad mayor al saldo disponible</Typography.Text>
            ) : null
          }
        />
      </Col>
      <Col span={8}>
        <Card title="Resumen de la venta">
          <Form layout="vertical">
            <Form.Item label="Cliente (opcional)">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Consumidor final"
                options={clientes.map((c) => ({ value: c.id, label: `${c.nombreCompleto} (${c.identificacion})` }))}
                value={clienteId}
                onChange={setClienteId}
              />
            </Form.Item>
            <Form.Item label="Descuento global ($)">
              <InputNumber min={0} value={descuentoGlobal} onChange={(v) => setDescuentoGlobal(v ?? 0)} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
          <Divider />
          <Statistic title="Subtotal" value={subtotal} precision={0} prefix="$" />
          <Statistic title="Descuento" value={descuentoGlobal} precision={0} prefix="$" />
          <Statistic
            title="Total a pagar (IVA incluido)"
            value={lineas.reduce((s, l) => {
              const base = l.precioUnitario * l.cantidad;
              return s + base + (base * l.ivaPorcentaje) / 100;
            }, 0)}
            precision={0}
            prefix="$"
            valueStyle={{ fontSize: 28, color: '#1668dc' }}
          />
          <Button
            type="primary"
            size="large"
            block
            icon={<CheckOutlined />}
            loading={procesando}
            style={{ marginTop: 16 }}
            onClick={confirmarVenta}
            data-testid="btn-confirmar-venta"
          >
            Confirmar venta y facturar
          </Button>
        </Card>
      </Col>
    </Row>
  );

  const tabReservas = (
    <Table
      rowKey="id"
      size="small"
      dataSource={reservas}
      columns={[
        { title: 'Consecutivo', dataIndex: 'consecutivo' },
        { title: 'Cliente', dataIndex: 'cliente' },
        {
          title: 'Productos', dataIndex: 'detalles',
          render: (d: { descripcion: string; cantidad: number }[]) => d.map((x) => `${x.cantidad} × ${x.descripcion}`).join(', '),
        },
        {
          title: '', width: 160,
          render: (_: unknown, r: { id: number }) => (
            <Button type="primary" size="small" onClick={() => convertirReserva(r.id)} disabled={procesando}>
              Convertir en venta
            </Button>
          ),
        },
      ]}
    />
  );

  return (
    <div>
      <Typography.Title level={4}>Punto de Venta</Typography.Title>
      <Tabs items={[{ key: 'carrito', label: 'Nueva venta', children: tabCarrito }, { key: 'reservas', label: 'Convertir reserva (RF-10)', children: tabReservas }]} />
    </div>
  );
}

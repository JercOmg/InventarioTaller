import { useCallback, useEffect, useState } from 'react';
import {
  Typography, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Space, App, Tag, Statistic, Card, Col, Row, Alert,
} from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Saldo {
  referenciaId: number;
  codigoBarras: string;
  descripcion: string;
  unidadBase: string;
  disponible: number;
  reservada: number;
  danada: number;
  total: number;
}
interface Movimiento {
  id: number; tipo: string; clase: string; descripcion: string; cantidad: number;
  disponibleAntes: number; disponibleDespues: number; usuario: string; fecha: string; detalle: string | null;
}
interface Tercero { id: number; nombreCompleto: string }
interface Ajuste {
  id: number; consecutivo: string; concepto: string; justificacion: string; estado: string;
  solicita: string; aprueba: string | null; fecha: string;
  detalles: { descripcion: string; cantidadSistema: number; cantidadContada: number | null; cantidadAjuste: number }[];
}

export function Inventario() {
  const { tienePermiso } = useAuth();
  const { message, modal } = App.useApp();
  const [saldos, setSaldos] = useState<Saldo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(false);


  const cargarSaldos = useCallback(async (q?: string) => {
    setCargando(true);
    try {
      const { data } = await api.get<{ items: Saldo[] }>('/inventario/saldos', {
        params: { tamano: 200, ...(q ? { busqueda: q } : {}) },
      });
      setSaldos(data.items);
    } catch (e) {
      message.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarMovs = useCallback(async () => {
    const { data } = await api.get<Movimiento[]>('/inventario/movimientos');
    setMovimientos(data);
  }, []);

  useEffect(() => {
    cargarSaldos();
    cargarMovs();
  }, [cargarSaldos, cargarMovs]);

  const referencias = saldos.map((s) => ({ id: s.referenciaId, descripcion: s.descripcion, codigoBarras: s.codigoBarras }));

  // --- Clasificar dañados (RF-04) ---
  const [modalDanado, setModalDanado] = useState<Saldo | null>(null);
  const [formDanado] = Form.useForm();

  const declararDanado = async () => {
    if (!modalDanado) return;
    try {
      const valores = await formDanado.validateFields();
      await api.post('/inventario/danados', {
        referenciaId: modalDanado.referenciaId,
        cantidad: valores.cantidad,
        motivo: valores.motivo,
      });
      message.success('Clasificación como dañado registrada');
      setModalDanado(null);
      formDanado.resetFields();
      cargarSaldos();
      cargarMovs();
    } catch (e) {
      if ((e as { errorFields?: unknown }).errorFields) return;
      message.error(mensajeError(e));
    }
  };

  // --- Ajustes (RF-19) ---
  const [modalAjuste, setModalAjuste] = useState(false);
  const [ajustes, setAjustes] = useState<Ajuste[]>([]);
  const [lineasAjuste, setLineasAjuste] = useState<{ referenciaId: number; descripcion: string; cantidadContada?: number; cantidadAjuste?: number }[]>([]);
  const [formAjuste] = Form.useForm();

  const cargarAjustes = useCallback(async () => {
    const { data } = await api.get<Ajuste[]>('/inventario/ajustes');
    setAjustes(data);
  }, []);

  useEffect(() => {
    cargarAjustes();
  }, [cargarAjustes]);

  const crearAjuste = async () => {
    try {
      const valores = await formAjuste.validateFields();
      if (lineasAjuste.length === 0) {
        message.warning('Agregue al menos una línea');
        return;
      }
      const { data } = await api.post('/inventario/ajustes', {
        concepto: valores.concepto,
        justificacion: valores.justificacion,
        detalles: lineasAjuste.map((l) => ({
          referenciaId: l.referenciaId,
          ...(l.cantidadContada !== undefined ? { cantidadContada: l.cantidadContada } : { cantidadAjuste: l.cantidadAjuste }),
        })),
      });
      message.success(`Ajuste ${data.consecutivo} creado (queda PENDIENTE de aprobación)`);
      setModalAjuste(false);
      setLineasAjuste([]);
      formAjuste.resetFields();
      cargarAjustes();
    } catch (e) {
      if ((e as { errorFields?: unknown }).errorFields) return;
      message.error(mensajeError(e));
    }
  };

  const decidirAjuste = (ajuste: Ajuste, decision: 'APROBADO' | 'RECHAZADO') => {
    modal.confirm({
      title: decision === 'APROBADO' ? `Aprobar ajuste ${ajuste.consecutivo}` : `Rechazar ajuste ${ajuste.consecutivo}`,
      content: 'Se aplicará el movimiento de inventario correspondiente.' ,
      okText: decision === 'APROBADO' ? 'Aprobar' : 'Rechazar',
      okButtonProps: decision === 'APROBADO' ? {} : { danger: true },
      onOk: async () => {
        try {
          await api.post(`/inventario/ajustes/${ajuste.id}/aprobar`, { decision });
          message.success(`Ajuste ${decision === 'APROBADO' ? 'aprobado y aplicado' : 'rechazado'}`);
          cargarAjustes();
          cargarSaldos();
          cargarMovs();
        } catch (e) {
          message.error(mensajeError(e));
        }
      },
    });
  };

  // --- Baja por vencimiento (RF-12) ---
  const [modalBaja, setModalBaja] = useState(false);
  const [formBaja] = Form.useForm();
  const registrarBaja = async () => {
    try {
      const valores = await formBaja.validateFields();
      await api.post('/inventario/bajas-vencimiento', valores);
      message.success('Baja por vencimiento registrada');
      setModalBaja(false);
      formBaja.resetFields();
      cargarSaldos();
      cargarMovs();
    } catch (e) {
      if ((e as { errorFields?: unknown }).errorFields) return;
      message.error(mensajeError(e));
    }
  };

  // --- Devolución a proveedor (RF-11) ---
  const [modalDevProv, setModalDevProv] = useState(false);
  const [formDevProv] = Form.useForm();
  const [proveedores, setProveedores] = useState<Tercero[]>([]);
  const [lineasDevProv, setLineasDevProv] = useState<{ referenciaId: number; descripcion: string; cantidad: number }[]>([]);

  const [conDanados, setConDanados] = useState<{ id: number; descripcion: string; codigoBarras: string; danada: number }[]>([]);

  const abrirDevProv = async () => {
    const [prov, sal] = await Promise.all([
      api.get('/terceros', { params: { rol: 'proveedor' } }),
      api.get<{ items: Saldo[] }>('/inventario/saldos', { params: { tamano: 500 } }),
    ]);
    setProveedores(prov.data);
    setConDanados(
      sal.data.items
        .filter((s) => s.danada > 0)
        .map((s) => ({ id: s.referenciaId, descripcion: s.descripcion, codigoBarras: s.codigoBarras, danada: s.danada })),
    );
    setLineasDevProv([]);
    formDevProv.resetFields();
    setModalDevProv(true);
  };

  const registrarDevProv = async () => {
    try {
      const valores = await formDevProv.validateFields();
      if (lineasDevProv.length === 0) {
        message.warning('Agregue las mercancías dañadas a devolver');
        return;
      }
      const { data } = await api.post('/inventario/devoluciones-proveedor', {
        proveedorId: valores.proveedorId,
        motivo: valores.motivo,
        detalles: lineasDevProv,
      });
      message.success(`Solicitud de cambio ${data.consecutivo} generada`);
      setModalDevProv(false);
      cargarSaldos();
      cargarMovs();
    } catch (e) {
      if ((e as { errorFields?: unknown }).errorFields) return;
      message.error(mensajeError(e));
    }
  };

  const tabSaldos = (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Buscar por código de barras o producto"
          allowClear
          style={{ width: 360 }}
          onSearch={(v) => cargarSaldos(v || undefined)}
          data-testid="buscar-saldos"
        />
      </Space>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><Statistic title="Disponible" value={saldos.reduce((s, x) => s + x.disponible, 0)} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Reservada" value={saldos.reduce((s, x) => s + x.reservada, 0)} valueStyle={{ color: '#cf8a08' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Dañada" value={saldos.reduce((s, x) => s + x.danada, 0)} valueStyle={{ color: '#cf1322' }} /></Card></Col>
      </Row>
      <Table
        rowKey="referenciaId" size="small" loading={cargando} dataSource={saldos}
        columns={[
          { title: 'Código', dataIndex: 'codigoBarras', width: 130 },
          { title: 'Descripción', dataIndex: 'descripcion' },
          { title: 'Unidad', dataIndex: 'unidadBase', width: 80 },
          { title: 'Disponible', dataIndex: 'disponible', render: (v: number) => <Tag color="green">{v}</Tag> },
          { title: 'Reservada', dataIndex: 'reservada', render: (v: number) => <Tag color="orange">{v}</Tag> },
          { title: 'Dañada', dataIndex: 'danada', render: (v: number) => <Tag color="red">{v}</Tag> },
          { title: 'Total', dataIndex: 'total' },
          {
            title: '', width: 130,
            render: (_: unknown, s: Saldo) =>
              tienePermiso('inventario.danados') && s.disponible > 0 ? (
                <Button size="small" danger icon={<WarningOutlined />} onClick={() => setModalDanado(s)}>Dañado</Button>
              ) : null,
          },
        ]}
      />
    </div>
  );

  const tabMovimientos = (
    <Table
      rowKey="id" size="small" dataSource={movimientos} scroll={{ y: 480 }}
      columns={[
        { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('MM-DD HH:mm:ss'), width: 110 },
        { title: 'Tipo', dataIndex: 'tipo', width: 80, render: (v: string) => <Tag color={v === 'ENTRADA' ? 'green' : v === 'SALIDA' ? 'red' : 'blue'}>{v}</Tag> },
        { title: 'Clase', dataIndex: 'clase', width: 150 },
        { title: 'Producto', dataIndex: 'descripcion' },
        { title: 'Cant.', dataIndex: 'cantidad', width: 80 },
        { title: 'Antes', dataIndex: 'disponibleAntes', width: 70 },
        { title: 'Después', dataIndex: 'disponibleDespues', width: 80 },
        { title: 'Usuario', dataIndex: 'usuario', width: 140 },
        { title: 'Detalle', dataIndex: 'detalle', ellipsis: true },
      ]}
    />
  );

  const tabAjustes = (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {tienePermiso('inventario.ajustar') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalAjuste(true)}>Nuevo ajuste / conteo</Button>
        )}
      </Space>
      <Table
        rowKey="id" size="small" dataSource={ajustes}
        columns={[
          { title: 'Consecutivo', dataIndex: 'consecutivo', width: 110 },
          { title: 'Concepto', dataIndex: 'concepto' },
          { title: 'Justificación', dataIndex: 'justificacion', ellipsis: true },
          { title: 'Solicita', dataIndex: 'solicita' },
          { title: 'Aprueba', dataIndex: 'aprueba', render: (v: string | null) => v ?? '—' },
          {
            title: 'Estado', dataIndex: 'estado', width: 120,
            render: (v: string) => <Tag color={v === 'APROBADO' ? 'green' : v === 'PENDIENTE' ? 'orange' : 'red'}>{v}</Tag>,
          },
          {
            title: '', width: 190,
            render: (_: unknown, a: Ajuste) =>
              tienePermiso('inventario.ajustar.aprobar') && a.estado === 'PENDIENTE' ? (
                <Space>
                  <Button size="small" type="primary" onClick={() => decidirAjuste(a, 'APROBADO')}>Aprobar</Button>
                  <Button size="small" danger onClick={() => decidirAjuste(a, 'RECHAZADO')}>Rechazar</Button>
                </Space>
              ) : null,
          },
        ]}
      />
    </div>
  );

  const tabVencimientos = (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {tienePermiso('inventario.vencimientos.baja') && (
          <Button type="primary" danger onClick={() => setModalBaja(true)}>Registrar baja por vencimiento</Button>
        )}
      </Space>
      <Typography.Text type="secondary">
        La baja opera a nivel de referencia. La granularidad unidad/lote es una decisión pendiente del cliente.
      </Typography.Text>
    </div>
  );

  const tabDevProv = (
    <div>
      {tienePermiso('inventario.danados') && (
        <Button type="primary" style={{ marginBottom: 16 }} onClick={abrirDevProv}>
          Devolver dañados al proveedor
        </Button>
      )}
      <Typography.Text type="secondary" style={{ display: 'block' }}>
        Cierra el ciclo de la mercancía averiada: sale del saldo dañado hacia el proveedor (RF-11).
        Solo aparecen productos con unidades clasificadas previamente como dañadas.
      </Typography.Text>
    </div>
  );

  return (
    <div>
      <Typography.Title level={4}>Inventario</Typography.Title>
      <Tabs
        items={[
          { key: 'saldos', label: 'Saldos', children: tabSaldos },
          { key: 'movs', label: 'Movimientos (kardex)', children: tabMovimientos },
          { key: 'ajustes', label: 'Ajustes y conteos', children: tabAjustes },
          { key: 'venc', label: 'Vencimientos', children: tabVencimientos },
          { key: 'devprov', label: 'Devolución a proveedor', children: tabDevProv },
        ]}
      />

      {/* Modal dañado */}
      <Modal title={`Declarar dañado: ${modalDanado?.descripcion ?? ''}`} open={Boolean(modalDanado)} onOk={declararDanado} onCancel={() => setModalDanado(null)} okText="Registrar" cancelText="Cancelar">
        <Form form={formDanado} layout="vertical">
          <Form.Item name="cantidad" label={`Cantidad (disponible: ${modalDanado?.disponible ?? 0})`} rules={[{ required: true, message: 'Obligatorio' }]}>
            <InputNumber min={0.0001} max={modalDanado?.disponible} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="motivo" label="Motivo de la avería" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input.TextArea rows={2} placeholder="Ej: dañadas por humedad" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal ajuste */}
      <Modal title="Nuevo ajuste / conteo físico" open={modalAjuste} width={700} onOk={crearAjuste} onCancel={() => setModalAjuste(false)} okText="Crear propuesta" cancelText="Cancelar">
        <Form form={formAjuste} layout="vertical">
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="concepto" label="Concepto" rules={[{ required: true }]} style={{ minWidth: 220 }}>
              <Select options={[
                { value: 'CONTEO_FISICO', label: 'Conteo físico' },
                { value: 'MERMA', label: 'Merma' },
                { value: 'ERROR_DIGITACION', label: 'Error de digitación' },
                { value: 'ROBO', label: 'Robo / hurto' },
                { value: 'MUESTRA_COMERCIAL', label: 'Muestra comercial' },
                { value: 'OTRO', label: 'Otro' },
              ]} />
            </Form.Item>
            <Form.Item name="justificacion" label="Justificación documentada" rules={[{ required: true, message: 'Obligatorio' }]} style={{ minWidth: 320 }}>
              <Input placeholder="Ej: pérdida detectada en auditoría" />
            </Form.Item>
          </Space>
          <Form.Item label="Producto">
            <Select
              showSearch optionFilterProp="label" value={undefined} placeholder="Busque el producto"
              onChange={(id: number) => {
                const ref = referencias.find((r) => r.id === id);
                if (ref) setLineasAjuste((prev) => [...prev, { referenciaId: id, descripcion: ref.descripcion }]);
              }}
              options={referencias.map((r) => ({ value: r.id, label: `${r.codigoBarras} — ${r.descripcion}` }))}
            />
          </Form.Item>
        </Form>
        <Table
          rowKey="referenciaId" size="small" pagination={false} dataSource={lineasAjuste}
          columns={[
            { title: 'Producto', dataIndex: 'descripcion' },
            {
              title: 'Cantidad contada (conteo)', dataIndex: 'cantidadContada', width: 180,
              render: (_: unknown, l: (typeof lineasAjuste)[number]) => (
                <InputNumber min={0} value={l.cantidadContada}
                  onChange={(v) => setLineasAjuste((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, cantidadContada: v ?? undefined, cantidadAjuste: undefined } : x)))} />
              ),
            },
            {
              title: 'O delta directo (+/-)', dataIndex: 'cantidadAjuste', width: 180,
              render: (_: unknown, l: (typeof lineasAjuste)[number]) => (
                <InputNumber value={l.cantidadAjuste}
                  onChange={(v) => setLineasAjuste((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, cantidadAjuste: v ?? undefined, cantidadContada: undefined } : x)))} />
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal baja vencimiento */}
      <Modal title="Baja por vencimiento" open={modalBaja} onOk={registrarBaja} onCancel={() => setModalBaja(false)} okText="Registrar baja" cancelText="Cancelar">
        <Form form={formBaja} layout="vertical">
          <Form.Item name="referenciaId" label="Producto (con control de vencimiento)" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Select
              showSearch optionFilterProp="label" placeholder="Seleccione"
              options={referencias.map((r) => ({ value: r.id, label: `${r.codigoBarras} — ${r.descripcion}` }))}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad a retirar" rules={[{ required: true, message: 'Obligatorio' }]}>
            <InputNumber min={0.0001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input.TextArea rows={2} placeholder="Ej: lote caducado el 01/09" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal devolución proveedor */}
      <Modal title="Devolución de dañados al proveedor" open={modalDevProv} width={640} onOk={registrarDevProv} onCancel={() => setModalDevProv(false)} okText="Generar solicitud" cancelText="Cancelar">
        <Form form={formDevProv} layout="vertical">
          <Form.Item name="proveedorId" label="Proveedor" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Select showSearch optionFilterProp="label" options={proveedores.map((p) => ({ value: p.id, label: p.nombreCompleto }))} placeholder="Seleccione" />
          </Form.Item>
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input.TextArea rows={2} placeholder="Ej: solicitud de cambio por defecto de fábrica" />
          </Form.Item>
          {conDanados.length === 0 ? (
            <Alert
              type="warning" showIcon
              message="No hay productos con stock dañado para devolver"
              description="Primero clasifique unidades como dañadas: en la pestaña Saldos use el botón 'Dañado' del producto correspondiente. Luego podrá generar la devolución al proveedor."
            />
          ) : (
            <Form.Item label="Mercancía dañada a devolver (solo productos con saldo dañado)">
              <Select
                showSearch optionFilterProp="label" value={undefined} placeholder="Busque el producto dañado"
                onChange={(id: number) => {
                  const ref = conDanados.find((r) => r.id === id);
                  if (ref) setLineasDevProv((prev) => [...prev, { referenciaId: id, descripcion: ref.descripcion, cantidad: 1 }]);
                }}
                options={conDanados.map((r) => ({ value: r.id, label: `${r.codigoBarras} — ${r.descripcion} (dañadas: ${r.danada})` }))}
              />
            </Form.Item>
          )}
        </Form>
        <Table
          rowKey="referenciaId" size="small" pagination={false} dataSource={lineasDevProv}
          columns={[
            { title: 'Producto', dataIndex: 'descripcion' },
            {
              title: 'Cantidad', dataIndex: 'cantidad', width: 140,
              render: (_: unknown, l: (typeof lineasDevProv)[number]) => {
                const maxDanada = conDanados.find((c) => c.id === l.referenciaId)?.danada;
                return (
                  <InputNumber min={0.0001} max={maxDanada} value={l.cantidad}
                    onChange={(v) => setLineasDevProv((prev) => prev.map((x) => (x.referenciaId === l.referenciaId ? { ...x, cantidad: v ?? 1 } : x)))} />
                );
              },
            },
          ]}
        />
      </Modal>
    </div>
  );
}

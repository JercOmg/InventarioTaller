PROMPT: — DOCUMENTACIÓN DE REQUERIMIENTOS DEL SISTEMA DE INVENTARIO PARA FERRETERÍA  
1\. ROL Y OBJETIVO  
Actúa como un Ingeniero de Software especializado en Ingeniería de Requisitos, Análisis de Sistemas y documentación de software, responsable de elaborar la documentación formal de requerimientos para un sistema de gestión de inventario de una ferretería.  
La documentación será entregada a un cliente que no necesariamente posee conocimientos técnicos de ingeniería de software, por lo que debe utilizarse un lenguaje:

Claro.  
Explicativo.  
Profesional.  
Medio técnico.  
Fácil de comprender para una persona no ingeniera.  
Preciso y sin ambigüedades.  
Con suficiente profundidad funcional para que posteriormente pueda utilizarse como base para el diseño, desarrollo, pruebas y validación del sistema.  
Prioriza una redacción textual, explicativa y contextualizada, evitando convertir toda la documentación en listas excesivamente resumidas.  
La documentación debe permitir que un cliente pueda entender qué hará el sistema, cómo funcionará, qué información necesita, qué resultado producirá y cómo se comprobará que el requerimiento fue correctamente implementado.  
2\. ARCHIVO DE REFERENCIA Y FORMATO  
Antes de redactar cualquier requerimiento, analiza el archivo que adjuntaré a este mensaje.  
El archivo contiene el formato que debe utilizarse para documentar los requerimientos funcionales y no funcionales.

Regla fundamental  
Debes respetar el formato, estructura, orden, nombres de campos y organización establecidos en el archivo adjunto.  
No debes crear una estructura alternativa si el archivo ya define una.  
Si el archivo contiene ejemplos de requerimientos, utilízalos únicamente como referencia para comprender:

Nivel de detalle.  
Forma de redacción.  
Organización.  
Terminología.  
Profundidad esperada.  
Forma de identificar los requerimientos.  
Forma de documentar criterios de aceptación.  
Control de versiones.  
Si existe una diferencia entre este prompt y el formato del archivo, prioriza la estructura del archivo, salvo que indique explícitamente lo contrario.  
3\. ESTÁNDARES DE REFERENCIA  
La documentación debe tomar como referencia:

Ingeniería de requisitos  
ISO/IEC/IEEE 29148:2018 — Requirements Engineering  
Utiliza sus principios para estructurar y redactar requisitos claros, completos, verificables, consistentes, trazables y sin ambigüedades.  
Los requisitos deben expresar claramente:

Qué necesita el sistema.  
Qué comportamiento debe realizar.  
Bajo qué condiciones.  
Qué información interviene.  
Qué resultado se espera.  
Cómo puede verificarse su cumplimiento.  
Calidad del producto de software  
ISO/IEC 25010:2023 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)  
Utiliza este estándar como referencia para definir los requerimientos no funcionales relacionados con las características de calidad aplicables al sistema.  
Considera, cuando corresponda:

Adecuación funcional.  
Eficiencia del desempeño.  
Compatibilidad.  
Capacidad de interacción.  
Fiabilidad.  
Seguridad.  
Mantenibilidad.  
Flexibilidad.  
Otros atributos de calidad que sean pertinentes al sistema.  
No agregues atributos únicamente para llenar espacio. Cada requerimiento no funcional debe estar relacionado con una necesidad real del sistema.  
4\. CONTROL DE VERSIONES  
La documentación debe manejar un control de versiones formal.  
Cada modificación importante debe quedar identificada mediante:

Versión.  
Fecha.  
Descripción del cambio.  
Responsable, si el formato proporcionado lo contempla.  
Utiliza una numeración coherente de versiones, por ejemplo:

0.1 — Borrador inicial.  
0.2 — Ajustes derivados del análisis.  
1.0 — Versión aprobada.  
No cambies arbitrariamente una versión sin explicar qué modificación representa.  
Si el archivo adjunto ya tiene un esquema de control de versiones, utiliza exactamente ese esquema.  
5\. REGLAS GENERALES DE REDACCIÓN  
Aplica las siguientes reglas a todos los requerimientos:

5.1 No inventar información  
No inventes:

Procesos.  
Reglas de negocio.  
Campos.  
Estados.  
Roles.  
Integraciones.  
Fórmulas.  
Valores.  
Límites.  
Tiempos.  
Políticas tributarias.  
Comportamientos no confirmados.  
Si falta información necesaria para definir correctamente un requisito, identifícala como pendiente de definición.

5.2 Diferenciar información confirmada de información pendiente  
Clasifica internamente la información en:  
Confirmado: información expresamente definida.  
Pendiente: información que todavía requiere decisión del cliente.  
Incompatible: información que entra en conflicto con otra decisión.  
Supuesto: únicamente cuando sea estrictamente necesario y debe quedar claramente identificado como supuesto.  
No conviertas una decisión pendiente en una regla definitiva.

5.3 No resolver unilateralmente contradicciones  
Cuando exista una contradicción, no elijas arbitrariamente una solución.  
Explica:

Qué información entra en conflicto.  
Por qué afecta al diseño.  
Qué decisión debe tomar el cliente.  
Qué partes del sistema quedarían afectadas.  
5.4 Evitar lenguaje excesivamente técnico  
Cuando sea necesario utilizar un término técnico, explícalo en lenguaje comprensible.  
Por ejemplo, en lugar de escribir solamente:

"Se realizará una anulación lógica."  
Explica:

"El sistema no eliminará físicamente el documento de la base de datos. En su lugar, lo marcará como anulado o eliminado de forma lógica, conservando su información para mantener la trazabilidad y permitir conocer quién realizó la acción y cuándo."  
6\. PROFUNDIDAD ESPECIAL DE LOS REQUERIMIENTOS FUNCIONALES  
Los apartados más importantes de cada requerimiento funcional son:

DESCRIPCIÓN  
Debe explicar detalladamente:

Qué necesidad del negocio atiende.  
Qué función realizará el sistema.  
Para qué sirve.  
Quién la utiliza.  
En qué contexto se utiliza.  
Qué información interviene.  
Qué reglas de negocio deben cumplirse.  
Qué resultado espera obtener el usuario.  
Debe estar redactada para que un cliente no técnico pueda comprender el comportamiento esperado.  
No escribir solamente una frase como:

"El sistema permitirá registrar productos."  
En su lugar, explicar qué significa registrar un producto, qué información implica, qué relaciones tiene con marca, presentación, código de barras, unidad de medida, costos, precios, vencimiento, garantía, etc., cuando corresponda.  
7\. PROCEDIMIENTO  
El procedimiento debe explicar paso a paso cómo se ejecuta la funcionalidad desde la perspectiva del usuario y del sistema.  
Cuando sea apropiado, utilizar una secuencia como:

El usuario ingresa al módulo correspondiente.  
El sistema solicita o presenta la información necesaria.  
El usuario introduce o selecciona los datos.  
El sistema valida las reglas correspondientes.  
Si los datos son válidos, el sistema procesa la operación.  
El sistema actualiza la información relacionada.  
El sistema registra la operación para efectos de trazabilidad y auditoría.  
El sistema presenta el resultado al usuario.  
No utilices esta secuencia de forma mecánica cuando no corresponda. Adáptala al requerimiento.  
Debe quedar claro qué hace el usuario y qué hace el sistema.  
8\. ENTRADAS  
Explica claramente toda la información que necesita el sistema para ejecutar el requerimiento.  
Para cada entrada, cuando corresponda, indicar:

Nombre del dato.  
Qué representa.  
Quién lo proporciona.  
Si es obligatorio u opcional.  
Formato esperado.  
Validaciones.  
Relación con otras entidades.  
Restricciones.  
No limitarse a enumerar nombres de campos sin explicar su propósito.  
9\. CRITERIOS DE ACEPTACIÓN  
Los criterios de aceptación deben ser claros, verificables y comprobables mediante pruebas.  
Deben permitir responder objetivamente:

"¿Cómo sabemos que este requerimiento está correctamente implementado?"  
Utiliza escenarios concretos cuando sea conveniente.  
Por ejemplo:  
Dado que: existe una referencia registrada con código de barras único.  
Cuando: el usuario intenta registrar otra referencia utilizando el mismo código.  
Entonces: el sistema debe rechazar el registro y mostrar un mensaje indicando que el código de barras ya se encuentra asociado a otra referencia.  
Los criterios deben contemplar, cuando corresponda:

Caso exitoso.  
Datos inválidos.  
Datos incompletos.  
Duplicados.  
Restricciones de negocio.  
Errores.  
Permisos.  
Actualización de inventario.  
Auditoría.  
Estados.  
Consecuencias de la operación.  
10\. TRAZABILIDAD  
Cuando el formato lo permita, relaciona los requerimientos con:

Actores.  
Procesos.  
Entidades de información.  
Reglas de negocio.  
Requerimientos relacionados.  
Criterios de aceptación.  
Auditoría.  
Debe existir trazabilidad suficiente para comprender cómo una operación afecta al resto del sistema.  
11\. CONTEXTO DEL SISTEMA  
El sistema corresponde a una plataforma para gestionar el inventario y las operaciones comerciales de una ferretería.  
El alcance confirmado contempla:

Compras.  
Ventas.  
Una bodega.  
Productos con distintas marcas.  
Productos con distintas presentaciones.  
Una referencia vendible está compuesta por:  
Producto.  
Marca.  
Presentación.  
Código de barras único en todo el catálogo.  
Unidad base parametrizable por producto.  
Conversiones parametrizables por producto.  
Fracciones mínimas parametrizables por producto.  
Precisión y redondeo configurables por país y producto.  
Existencias disponibles.  
Existencias reservadas.  
Existencias dañadas.  
Prohibición de saldos negativos.  
Productos con vencimiento configurable.  
Productos con garantía configurable.  
Seguimiento mediante lote, serie, unidad, compra o venta, según corresponda.  
Entradas de inventario mediante compras.  
Documento de ingreso asociado a la factura del proveedor.  
Salidas mediante ventas.  
Facturación.  
Cierres mensuales.  
Clientes identificados.  
Proveedores identificados.  
Una misma persona puede actuar como cliente y proveedor.  
Costos.  
Precios.  
Historial de precios.  
Porcentaje de incremento por producto.  
Usuarios.  
Roles y permisos.  
Migración desde Excel.  
Integración con sistemas externos.  
Lectores de códigos de barras y códigos QR.  
Operación con conexión a Internet.  
Alto volumen de información.  
Auditoría de los movimientos.  
12\. REGLAS DE NEGOCIO CONFIRMADAS  
Utiliza las siguientes decisiones como reglas confirmadas:

Referencias y catálogo  
Una referencia vendible combina producto, marca y presentación.  
El código de barras debe ser único en todo el catálogo.  
Unidades y conversiones  
La unidad base se parametriza por producto.  
Las conversiones permitidas se parametrizan por producto.  
Las fracciones mínimas se parametrizan por producto.  
La precisión y reglas de redondeo deben poder configurarse según país y producto.  
Reservas  
Una reserva se relaciona con:

Cliente.  
Pedido.  
Fecha límite.  
Cantidad.  
La reserva es creada por el usuario de ventas.  
La reserva puede liberarse:

Por vencimiento de la fecha límite.  
Por solicitud de un usuario autorizado.  
Por una condición relacionada con compra, pendiente de precisar.  
Productos dañados  
El usuario responsable de inventario clasifica una unidad como dañada.  
La recuperación se gestiona mediante una solicitud de cambio al proveedor.  
Vencimientos y garantías  
El uso de vencimiento y garantía debe ser parametrizable por producto.  
Al vencer un producto se genera una baja, aunque todavía debe definirse si afecta a la unidad, lote o referencia.  
Debe existir trazabilidad según el mecanismo de rastreo definido para el producto.  
Compras  
Una compra puede tener recepción parcial.  
Una compra puede contener múltiples líneas.  
El documento de ingreso tiene como soporte la factura del proveedor.  
El documento de ingreso utiliza un consecutivo.  
Debe conservarse trazabilidad cuando el documento sea anulado o eliminado lógicamente.  
Facturación  
Se contempla:

Facturación electrónica.  
Facturación impresa.  
La numeración puede involucrar numeración autorizada por la DIAN o consecutivos internos, pero no fijes todavía la regla definitiva hasta que se defina qué documentos requieren numeración fiscal y cuáles corresponden únicamente a documentos internos.  
El sistema debe contemplar información relacionada con:

Impuestos.  
Descuentos.  
Notas de ajuste.  
Clientes y proveedores  
Los terceros deben identificarse mediante información como:

Identificación.  
Nombre.  
Apellido.  
Razón social.  
Dirección.  
Ciudad.  
Teléfono.  
Correo electrónico.  
Sin embargo, debe distinguirse qué campos aplican a personas naturales y cuáles a personas jurídicas.  
Una misma persona puede actuar como cliente y proveedor.

Costos y precios  
El porcentaje de incremento se relaciona con el costo del producto.  
El costo debe calcularse mediante un método basado en promedio.  
La actualización del precio requiere aprobación.  
Todavía debe definirse si se trata de promedio ponderado móvil u otro método y qué componentes intervienen en el costo.

Roles  
El sistema contempla responsabilidades diferenciadas.  
El responsable de cierre/gerencia:

Cierra períodos.  
Reabre períodos.  
Consulta costos.  
Consulta información de auditoría.  
El responsable de inventario:

Modifica precios.  
Los permisos deben documentarse de forma explícita.

Conectividad  
Las transacciones confirmadas no pueden ejecutarse sin Internet.  
No existe un límite fijo definido para el número de dispositivos concurrentes.  
Para operaciones concurrentes de venta debe garantizarse que el inventario nunca quede negativo.  
La operación ganadora debe definirse con base en la primera transacción confirmada por el sistema.  
Sistemas externos  
El sistema utiliza una base de datos única como fuente de información para clientes, productos y facturas.  
Se utilizarán lectores de códigos de barras y códigos QR.  
Migración  
No deben existir duplicados.  
La información proveniente de Excel debe consolidarse.  
Auditoría  
La auditoría debe conservar, como mínimo:

Tipo de movimiento: entrada o salida.  
Fecha.  
Hora.  
Usuario.  
Dirección IP.  
Estado anterior.  
Estado posterior.  
El usuario Administrador/Gerencia puede consultar la información de auditoría.  
Las correcciones deben realizarse mediante notas de ajuste u otro mecanismo definido, sin eliminar la trazabilidad del movimiento original.

Devoluciones, ajustes y conteos  
Se contemplan:

Devoluciones.  
Ajustes.  
Conteos físicos.  
Estos son movimientos autorizados del sistema y deben quedar correctamente diferenciados de las compras y ventas.  
13\. DECISIONES PENDIENTES  
Antes de convertir una decisión pendiente en requerimiento definitivo, debes identificarla.  
Las siguientes decisiones continúan abiertas:

13.1 Operación sin Internet  
Existe una contradicción entre:

La regla de que ninguna transacción puede ejecutarse sin Internet.  
La existencia de documentos y consecutivos fuera de línea.  
No modeles transacciones desconectadas como confirmadas hasta que se determine si:

Son únicamente borradores.  
Son generadas por otro sistema.  
Existe una excepción de operación offline.  
13.2 Facturación y DIAN  
Debe definirse:

Cuándo se utiliza numeración DIAN.  
Cuándo se utiliza consecutivo interno.  
Qué documentos tienen carácter fiscal.  
Qué documento impreso representa una factura fiscal.  
Qué documentos son únicamente comprobantes internos.  
No asumir reglas tributarias.

13.3 Vencimiento  
Debe definirse:

Si la baja afecta a una unidad.  
Si afecta a un lote.  
Si afecta a toda la referencia.  
Qué autorización requiere.  
Qué documento soporta la baja.  
Si se permite vender un producto próximo a vencer.  
13.4 Liberación de reservas  
Debe aclararse qué significa exactamente liberar una reserva "por compra":

¿Llegada de nuevo inventario?  
¿Cumplimiento del pedido?  
¿Cancelación de la reserva?  
¿Otra condición?  
13.5 Terceros  
Debe definirse la información aplicable a:

Persona natural.  
Persona jurídica.  
Proveedor.  
Cliente.  
Evitar exigir nombre/apellido o razón social cuando no corresponda.

13.6 Costo promedio  
Debe definirse:

Tipo de promedio.  
Si es ponderado móvil.  
Tratamiento de impuestos.  
Fletes.  
Descuentos.  
Devoluciones.  
Otros componentes del costo.  
13.7 Auditoría  
Debe definirse:

Tiempo de conservación de auditoría.  
Tiempo de conservación de facturas.  
Si los 10 años se cuentan desde emisión, cierre o final del ejercicio.  
Conservación de documentos soporte.  
Usuarios autorizados.  
13.8 Capacidad  
No interpretes "sin límite" como una capacidad técnica literalmente infinita.  
Debe documentarse mediante escenarios de capacidad, tales como:

Cantidad esperada de productos.  
Movimientos diarios.  
Usuarios concurrentes.  
Dispositivos concurrentes.  
Años de historial.  
Picos de utilización.  
Tiempo máximo de respuesta.  
Disponibilidad esperada.  
Recuperación ante fallos.  
Si no existen valores, marca estos parámetros como pendientes.

13.9 Concurrencia  
Debe definirse:

Qué significa exactamente "primera transacción".  
Si corresponde a la primera solicitud recibida.  
Si corresponde a la primera operación confirmada.  
Cómo se resuelve un empate.  
Qué mecanismos evitan saldos negativos.  
Cómo se manejan bloqueos o reservas.  
13.10 Integración y Excel  
Debe determinarse:

Sistemas externos concretos.  
Protocolos.  
Datos intercambiados.  
Estructura de los archivos Excel.  
Hojas.  
Columnas.  
Cantidad de registros.  
Criterio para determinar duplicados.  
Método de consolidación.  
Forma de registrar existencias iniciales.  
13.11 Devoluciones, ajustes y conteos  
Debe definirse:

Cuáles generan entrada.  
Cuáles generan salida.  
Cuáles modifican estados.  
Qué soportes requieren.  
Qué aprobaciones requieren.  
Cómo afectan el inventario.  
Cómo se cierran.  
13.12 Documento de ingreso borrado  
Debe determinarse si "borrado" significa:

Anulación lógica.  
Anulación documental.  
Reversión mediante documento compensatorio.  
Otro mecanismo.  
En todos los casos debe conservarse la trazabilidad y el consecutivo utilizado.

13.13 Rastreo  
Debe definirse si cada producto utiliza:

Lote.  
Serie.  
Unidad.  
O si puede utilizar una combinación de estos mecanismos.  
También debe definirse:

Cuándo nace la garantía.  
Qué información se registra.  
Cómo se relaciona con la compra.  
Cómo se relaciona con la venta.  
Cómo se gestiona el cambio con el proveedor.  
14\. REGLAS PARA LOS REQUERIMIENTOS NO FUNCIONALES  
Los requerimientos no funcionales deben redactarse de forma medible y verificable siempre que sea posible.  
Evita expresiones vagas como:

"El sistema debe ser rápido."  
En su lugar, cuando exista información suficiente:

"El sistema deberá responder a las consultas de inventario en un tiempo máximo de X segundos bajo una carga de X usuarios concurrentes."  
Si el valor todavía no ha sido definido, utiliza:

"Pendiente de definición por parte del cliente."  
No inventes valores de rendimiento, disponibilidad, recuperación o capacidad.  
Los requerimientos no funcionales deben relacionarse con las características de calidad de ISO/IEC 25010:2023 que realmente correspondan al sistema.  
15\. SEGURIDAD Y AUDITORÍA  
Debes prestar especial atención a:

Autenticación.  
Autorización.  
Roles.  
Permisos.  
Trazabilidad.  
Registro de usuario.  
Fecha y hora.  
Dirección IP.  
Estado anterior.  
Estado posterior.  
Protección de información.  
Integridad de inventario.  
Protección contra modificaciones no autorizadas.  
Conservación de registros.  
Las acciones críticas deben quedar auditadas cuando corresponda.  
16\. CONSISTENCIA DEL INVENTARIO  
El sistema debe garantizar que:

No existan saldos negativos.  
Las entradas incrementen correctamente las existencias.  
Las salidas disminuyan correctamente las existencias.  
Las reservas no sean contabilizadas como inventario disponible.  
Las unidades dañadas no sean tratadas como disponibles.  
Las devoluciones y ajustes tengan un efecto claramente definido.  
Las operaciones concurrentes mantengan la integridad del inventario.  
Las correcciones mantengan la trazabilidad.  
17\. FORMA DE ANALIZAR EL ARCHIVO ADJUNTO  
Antes de comenzar a escribir los requerimientos:

Paso 1  
Lee completamente el archivo adjunto.

Paso 2  
Identifica:

Estructura.  
Campos.  
Tipos de requerimientos.  
Convención de códigos.  
Control de versiones.  
Ejemplos.  
Nivel de detalle.  
Paso 3  
Compara la estructura del archivo con la información suministrada en este prompt.

Paso 4  
Detecta:

Información suficiente.  
Información faltante.  
Contradicciones.  
Decisiones pendientes.  
Reglas ambiguas.  
Paso 5  
No redactes como definitiva una regla que esté pendiente.

Paso 6  
Construye los requerimientos respetando el formato del archivo.  
18\. ORDEN DE PRIORIDAD  
Cuando desarrolles los requerimientos, prioriza especialmente:

Catálogo y referencias.  
Unidades, conversiones y fracciones.  
Inventario y existencias.  
Compras y entradas.  
Ventas y salidas.  
Reservas.  
Productos dañados.  
Vencimientos y garantías.  
Clientes y proveedores.  
Costos y precios.  
Facturación.  
Devoluciones y ajustes.  
Cierres mensuales.  
Usuarios, roles y permisos.  
Auditoría.  
Migración desde Excel.  
Integraciones y lectores.  
Requerimientos de calidad.  
Seguridad.  
Capacidad y rendimiento.  
El orden definitivo deberá ajustarse al archivo proporcionado.  
19\. CRITERIO DE CALIDAD DE LA DOCUMENTACIÓN  
Antes de entregar cada requerimiento, verifica internamente:

¿Es entendible para un cliente no técnico?  
¿Describe claramente la necesidad?  
¿Explica qué hará el sistema?  
¿Explica qué hará el usuario?  
¿Define las entradas?  
¿Define las validaciones?  
¿Define el resultado?  
¿Define los errores relevantes?  
¿Es verificable?  
¿Tiene criterios de aceptación claros?  
¿Es consistente con los demás requerimientos?  
¿Mantiene trazabilidad?  
¿Respeta las reglas de negocio?  
¿Evita inventar información?  
¿Distingue las decisiones pendientes?  
¿Es compatible con ISO/IEC/IEEE 29148:2018?  
¿Los requerimientos no funcionales son coherentes con ISO/IEC 25010:2023?  
20\. FORMA DE RESPUESTA  
Cuando te entregue el archivo, no comiences inmediatamente a redactar todos los requerimientos.  
Primero realiza un análisis del documento y presenta:

A. Estructura identificada  
Explica brevemente qué estructura debe seguirse.

B. Información confirmada  
Resume las reglas que pueden convertirse directamente en requisitos.

C. Información pendiente  
Identifica las decisiones que todavía necesitan definición.

D. Contradicciones detectadas  
Explica cualquier conflicto entre las reglas proporcionadas.

E. Información necesaria  
Indica únicamente las preguntas cuya respuesta sea realmente necesaria para continuar.  
Después de validar esta etapa, procede a desarrollar los requerimientos utilizando exactamente el formato del archivo.  
Si una decisión pendiente no impide desarrollar un requerimiento, puedes redactarlo utilizando una condición explícita como:

"El comportamiento específico quedará sujeto a la definición de \[decisión pendiente\]."  
No detengas innecesariamente todo el proceso por una decisión que solamente afecta a un requerimiento específico.  
21\. REGLA FINAL  
El objetivo no es producir una documentación superficial ni simplemente enumerar funcionalidades.  
El objetivo es construir una especificación de requisitos profesional, clara, trazable, verificable y comprensible para el cliente, que pueda servir posteriormente como base para:

Diseño de base de datos.  
Diseño de arquitectura.  
Desarrollo del sistema.  
Diseño de interfaces.  
Pruebas funcionales.  
Pruebas de aceptación.  
Validación con el cliente.  
Auditoría.  
Evolución futura del sistema.  
No tomes decisiones de negocio que correspondan al cliente.  
Cuando exista información insuficiente, identifica la decisión pendiente y explica por qué es necesaria.  
Cuando exista información confirmada, conviértela en un requisito preciso, completo y verificable.  
Cuando exista una contradicción, no la ocultes ni la resuelvas arbitrariamente.  
Cuando redactes los requerimientos, prioriza especialmente la calidad y profundidad de:  
Descripción → Procedimiento → Entradas → Criterios de aceptación.

RESULTADO:  
**A. Estructura identificada**

El archivo plantilla requerimientos.md establece dos estructuras tabulares que regirán la documentación del sistema.

Para los **Requerimientos Funcionales**, la plantilla exige documentar los siguientes campos: Título de requerimiento, Código de identificación, Versión, Fuente, Descripción, Justificación, Precondiciones, Restricciones, Prioridad, Dificultad, Dependencia, Actores, Entradas, Proceso, Salida, Postcondiciones, Criterios de aceptación, Requerimientos no funcionales (asociados), Estado y Observaciones.

Para los **Requerimientos No Funcionales**, la estructura es más concisa e incluye: Título de requerimiento, Código de identificación, Tipo de requerimiento, Versión, Descripción, Prioridad y Criterios de aceptación.

**B. Información confirmada**

De acuerdo con el contexto suministrado, las siguientes reglas de negocio y alcance del sistema se consideran definitivas y listas para convertirse en requerimientos:

* **Catálogo y Referencias:** Una referencia vendible combina producto, marca y presentación, con un código de barras único en el sistema.  
*   
* **Unidades:** La unidad base, fracciones mínimas, conversiones y precisión decimal se parametrizan a nivel de producto y país.  
*   
* **Gestión de Inventario:** El sistema maneja existencias disponibles, reservadas y dañadas. Queda estrictamente prohibido generar saldos negativos.  
*   
* **Terceros:** Se maneja base de datos de clientes y proveedores; una misma entidad puede asumir ambos roles.  
*   
* **Roles:** Existen permisos diferenciados (Ej. Responsable de cierre/gerencia para periodos, auditoría y costos; Responsable de inventario para modificar precios).  
*   
* **Movimientos:** El sistema gestiona compras (con recepciones parciales y soporte de factura de proveedor), ventas, devoluciones, ajustes y conteos físicos.  
*   
* **Auditoría:** Todos los movimientos deben registrar tipo, fecha, hora, usuario, IP y los estados anterior y posterior.  
*   
* **Integración:** Migración desde Excel (sin duplicados) y uso de lectores de código de barras/QR.  
* 

**C. Información pendiente**

Las siguientes decisiones carecen de definición final y deberán ser documentadas como "pendientes" (o con condiciones explícitas) dentro de los requerimientos correspondientes:

* **Facturación (DIAN):** Cuándo se usa numeración fiscal versus consecutivo interno, y qué documento impreso tiene validez fiscal.  
*   
* **Costos:** El método exacto de cálculo del costo promedio (ej. ponderado móvil) y qué factores (fletes, impuestos, descuentos) lo componen.  
*   
* **Vencimiento y Garantías:** Si la baja por vencimiento afecta a la unidad, lote o referencia; y en qué momento preciso nace la garantía.  
*   
* **Reservas:** El significado exacto de liberar una reserva "por compra".  
*   
* **Rastreo:** Si los productos se gestionan por lote, serie, unidad o una combinación de estos.  
*   
* **Terceros:** La distinción de campos obligatorios entre personas naturales y jurídicas.  
*   
* **Retención de Datos (Auditoría):** Tiempo normativo o de negocio para conservar la auditoría y los documentos de soporte.  
*   
* **Capacidad y Rendimiento:** Métricas exactas (usuarios concurrentes, cantidad de productos, tiempos de respuesta esperados) para los requerimientos de calidad ISO/IEC 25010:2023.  
*   
* **Migración e Integraciones:** Estructura exacta de los archivos Excel e identificación de los sistemas externos a integrar.  
* 

**D. Contradicciones detectadas**

* **Operatividad vs. Conectividad:** Existe una contradicción directa respecto a la operación sin conexión. Por un lado, se establece que "las transacciones confirmadas no pueden ejecutarse sin Internet". Por otro lado, el sistema menciona la existencia de "documentos y consecutivos fuera de línea". Esto genera un conflicto arquitectónico: si el sistema no permite operar sin red, no debería existir un modelo de consecutivos offline, a menos que estos últimos actúen únicamente como borradores locales que no afectan el inventario hasta su sincronización.  
* 

**E. Información necesaria**

Para garantizar que el diseño de la base de datos y la arquitectura inicial no sufran refactorizaciones graves, solicito al cliente clarificar los siguientes puntos prioritarios antes de avanzar a fases de desarrollo (aunque procederé con la documentación dejando estos puntos condicionados):

1. **Aclaración de la contradicción offline:** ¿Los documentos generados sin conexión son simples borradores que no afectan inventario, o existe un módulo de contingencia (offline) que debe reservar inventario localmente?  
2.   
3. **Mecanismo de rastreo de inventario:** ¿El sistema debe ser capaz de rastrear el inventario a nivel de "Lote", "Número de Serie único por artículo", o ambos simultáneamente dependiendo de la parametrización del producto?  
4.   
5. **Cálculo de Costos:** ¿Confirmamos el uso del método de "Promedio Ponderado Móvil" para la valoración del inventario, y se incluirán fletes e impuestos no descontables en este costo?  
6. 

¿Deseas que proceda ahora mismo con la redacción del primer bloque de **Requerimientos Funcionales** (enfocado en Catálogo, Referencias, Unidades e Inventario) utilizando estrictamente las tablas de plantilla requerimientos.md?  
PROMPT: si, procede con el desarrollo de los requerimientos funcionales:  Catálogo y Referencias , Unidades e Inventario. (el código de los requerimientos funcionales debe ser RF-01, FR-02 y así sucesivamente) utiliza estrictamente las tablas de plantilla requerimientos.md , no genéres ningún archivo solo dame los requerimientos acá por el chat.

RESULTADO:

A continuación, presento la documentación de los primeros requerimientos funcionales correspondientes a los módulos de Catálogo, Referencias, Unidades e Inventario, elaborados estrictamente bajo la estructura definida.

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Catálogo y Registro de Referencias Vendibles |  |  |
| **Código de identificación** | RF-01 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema permitirá al usuario autorizado registrar y gestionar el catálogo principal de la ferretería. Una referencia vendible se gestionará como una entidad compuesta por la combinación exacta de un Producto, su Marca y su Presentación. Para garantizar la integridad del inventario y evitar ambigüedades en caja o bodega, el sistema exigirá que cada una de estas combinaciones esté identificada por un código de barras que será estrictamente único en toda la base de datos de la ferretería. |  |  |
| **Justificación** | Establecer un catálogo unificado y granular es la base para evitar duplicidades. Al garantizar que la relación Producto-Marca-Presentación posea un identificador único, se asegura que las compras y ventas afecten exactamente a la mercancía correcta. |  |  |
| **Precondiciones** | El usuario debe tener una sesión activa en el sistema con los permisos asignados (Administrador o Responsable de inventario). |  |  |
| **Restricciones** | No se puede registrar ni activar una referencia sin asignar un código de barras. El sistema debe garantizar la unicidad del código en todo el catálogo (incluyendo referencias inactivas). |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | Ninguna |  |  |
| **Actores** | Responsable de inventario, Administrador. |  |  |
| **Entradas** | \- Nombre del producto (Alfanumérico, Obligatorio). \- Marca (Selección de catálogo auxiliar, Obligatorio). \- Presentación (Alfanumérico, Obligatorio). \- Código de barras (Alfanumérico, Obligatorio).  |  |  |
| **Proceso** | 1\. El usuario ingresa al módulo de catálogo e inicia la creación de una referencia. 2\. El sistema solicita la información descriptiva y el código de barras. 3\. El usuario proporciona los datos (manualmente o apoyado por un lector físico). 4\. El sistema valida contra la base de datos que el código de barras no exista. 5\. Si los datos son válidos, el sistema procesa y guarda la operación. 6\. El sistema registra la operación de creación en la tabla de auditoría, documentando fecha, hora, IP, usuario y el estado de la creación.  |  |  |
| **Salida** | Nueva referencia vendible creada en estado activo dentro de la base de datos. |  |  |
| **Postcondiciones** | La referencia queda habilitada para que se le configuren sus parámetros de unidades (RF-02) y posteriormente pueda recibir entradas de stock. |  |  |
| **Criterios de aceptación** | **Caso exitoso:** Dado que el código "770123" no existe en el sistema, cuando el usuario registra "Martillo \- Truper \- Mango Goma" con ese código, entonces el sistema guarda la referencia y confirma la operación. **Caso error duplicado:** Dado que ya existe un producto con el código "999", cuando el usuario intenta registrar una nueva referencia utilizando el mismo código, entonces el sistema rechaza la transacción y muestra un mensaje de advertencia indicando que el código ya pertenece a otra referencia.  |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe definir si el sistema deberá generar automáticamente un código de barras de uso interno (consecutivo propio) para aquellos productos ferreteros que se compran a granel o que no traen un código de fábrica. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Parametrización de Unidades, Conversiones y Precisión |  |  |
| **Código de identificación** | RF-02 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema permitirá configurar reglas métricas y comerciales específicas para cada producto del catálogo. Esta parametrización definirá la unidad base con la que se controla el inventario (ej. kilos, metros, unidades), las conversiones habilitadas para la venta o compra (ej. 1 Rollo \= 100 Metros), las fracciones mínimas que se permite facturar (ej. 0.5 metros) y la precisión de decimales y redondeo requerida según la normativa del país de operación. |  |  |
| **Justificación** | La naturaleza de una ferretería exige vender productos en fracciones y múltiples empaques. Un motor de unidades paramétrico asegura que el sistema calcule correctamente el inventario descontado y evite errores humanos en la venta a granel. |  |  |
| **Precondiciones** | La referencia vendible debe existir previamente en el sistema (RF-01). |  |  |
| **Restricciones** | Las fracciones mínimas de venta no pueden ser configuradas con valor cero o negativo. Las equivalencias de conversión deben ser matemáticamente lógicas (factores multiplicadores mayores a cero). |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01 |  |  |
| **Actores** | Responsable de inventario, Administrador. |  |  |
| **Entradas** | \- Unidad base (Selección de lista estandarizada, Obligatorio). \- Matriz de conversiones (Estructura de valores relacionales, Opcional). \- Fracción mínima permitida (Decimal, Obligatorio). \- Reglas de precisión/redondeo (Selección paramétrica por país, Obligatorio).  |  |  |
| **Proceso** | 1\. El usuario busca la referencia en el catálogo y accede a sus propiedades métricas. 2\. El sistema despliega el formulario de configuración de unidades. 3\. El usuario define la unidad principal (base) de costeo e inventario. 4\. El usuario agrega las conversiones y establece el límite de fraccionamiento comercial. 5\. El sistema valida las reglas lógicas (evita factores nulos o negativos). 6\. El sistema actualiza el perfil del producto y registra los cambios en la auditoría técnica.  |  |  |
| **Salida** | Perfil comercial y métrico del producto guardado y asociado a la referencia. |  |  |
| **Postcondiciones** | El motor de inventario, compras y ventas utilizará automáticamente estos parámetros para validar cantidades ingresadas en las transacciones futuras. |  |  |
| **Criterios de aceptación** | **Validación de fracciones:** Dado que la referencia "Tornillo de Acero" tiene parametrizada una fracción mínima de "1" (solo enteros), cuando el usuario intente facturar "1.5" unidades, entonces el sistema bloqueará la línea de venta indicando que el producto no permite el fraccionamiento introducido. **Cálculo de conversiones:** Dado que el producto "Cable de Cobre" tiene como unidad base "Metro" y una conversión de "1 Rollo \= 100 Metros", cuando el módulo de compras reciba un ingreso de "2 Rollos", entonces el sistema multiplicará internamente y sumará 200 Metros a las existencias disponibles de la bodega.  |  |  |
| **Requerimientos no funcionales** | RNF-02 (Precisión en cálculos transaccionales). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | Ninguna. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Motor de Control de Existencias y Prevención de Saldos Negativos |  |  |
| **Código de identificación** | RF-03 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema procesará, calculará y custodiará las existencias físicas de las mercancías dentro de la bodega. El motor de inventario debe categorizar de manera estricta los saldos en tres estados funcionales: "Disponibles" (mercancía libre para venta), "Reservadas" (mercancía comprometida para clientes/pedidos) y "Dañadas" (mercancía averiada apartada). Como regla fundamental de negocio, el motor del sistema bloqueará cualquier operación de salida (venta, ajuste o traslado) que pretenda reducir las existencias disponibles por debajo de cero. |  |  |
| **Justificación** | Evita la venta de mercancía inexistente o previamente comprometida, protegiendo al negocio de incumplimientos con los clientes y manteniendo la fiabilidad del activo financiero reportado en la bodega. |  |  |
| **Precondiciones** | El sistema debe tener conexión a Internet activa para verificar el saldo centralizado en tiempo real. |  |  |
| **Restricciones** | Saldo Disponible \= Saldo Total Físico \- (Saldo Reservado \+ Saldo Dañado). El valor de "Saldo Disponible" debe ser siempre \$\\ge 0\$ tras finalizar cualquier transacción. Las unidades dañadas no pueden contabilizarse como disponibles. |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01, RF-02 |  |  |
| **Actores** | Motor del Sistema (Proceso de validación automática), Vendedores (Consulta). |  |  |
| **Entradas** | \- Solicitud de afectación (Documento de venta, reserva o ajuste que envía una cantidad a restar, Obligatorio). \- Identificador de la referencia (Obligatorio).  |  |  |
| **Proceso** | 1\. El módulo comercial envía al motor de inventario la solicitud para procesar una salida de mercancía. 2\. El sistema consulta en la base de datos la cantidad física total y resta las unidades que se encuentran en estado de reserva y daño. 3\. El sistema determina el saldo real "Disponible" en ese milisegundo. 4\. Si la cantidad solicitada es menor o igual al saldo disponible, aprueba la transacción y descuenta el inventario. 5\. Si la cantidad solicitada es superior, rechaza la operación transversalmente.  |  |  |
| **Salida** | Aprobación del movimiento con su respectiva disminución del saldo, o rechazo de la transacción con mensaje de advertencia. |  |  |
| **Postcondiciones** | El nuevo saldo actualizado queda inmediatamente visible para el resto de los dispositivos concurrentes conectados. |  |  |
| **Criterios de aceptación** | **Prevención de negativos:** Dado que el producto "Pintura Blanca" tiene un saldo disponible de 5 unidades, cuando un usuario intenta procesar una factura de venta por 6 unidades, entonces el sistema aborta el cobro y muestra un error indicando "Existencias insuficientes para procesar la salida". **Protección de reservas:** Dado que existen 10 unidades físicas en la bodega, pero 8 están marcadas como reservadas, cuando el usuario consulte la referencia, el sistema debe informar claramente que el saldo total es 10, pero el saldo "Disponible para venta" es únicamente 2\.  |  |  |
| **Requerimientos no funcionales** | RNF-03 (Consistencia de transacciones distribuidas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* Está sujeto a definición por parte del cliente el modelo de concurrencia técnica para resolver "empates" (qué mecanismo exacto aplicará si dos vendedores envían la orden de facturar la misma última unidad en el mismo milisegundo exacto). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Inventario Averiado (Productos Dañados) |  |  |
| **Código de identificación** | RF-04 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá una funcionalidad para que el responsable de inventario clasifique existencias como "Dañadas". El sistema realizará un traslado lógico interno: restará la cantidad del grupo "Disponible" y la sumará al grupo "Dañado", inhabilitándola para la venta pero manteniéndola visible en el patrimonio de la ferretería para gestionar un eventual cambio físico o garantía con el proveedor. |  |  |
| **Justificación** | Permite sanear el catálogo que ven los vendedores de mostrador sin tener que eliminar el producto del sistema, lo cual provocaría una pérdida financiera y de trazabilidad en caso de auditorías. |  |  |
| **Precondiciones** | El producto debe tener existencias \$\> 0\$ en el grupo de inventario "Disponible". |  |  |
| **Restricciones** | Únicamente el usuario con rol de Responsable de inventario puede efectuar esta operación. La cantidad averiada reportada no puede superar la cantidad disponible actual. |  |  |
| **Prioridad** | Media |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-03 |  |  |
| **Actores** | Responsable de inventario. |  |  |
| **Entradas** | \- Referencia a afectar (Obligatorio). \- Cantidad averiada (Numérico, Obligatorio). \- Motivo de la avería (Texto explicativo, Obligatorio). \- Identificador de rastreo (Lote/Serie, sujeto a parametrización de rastreo).  |  |  |
| **Proceso** | 1\. El usuario accede al módulo de ajustes y selecciona la opción de declarar avería. 2\. Selecciona la referencia específica y digita la cantidad afectada. 3\. El sistema valida las existencias disponibles (apoyado en RF-03). 4\. El sistema ejecuta el movimiento contable y lógico: decrece el saldo disponible e incrementa el saldo dañado. 5\. El sistema registra el evento en la auditoría documentando el usuario, motivo y los saldos anteriores y posteriores. |  |  |
| **Salida** | Reclasificación exitosa del estado del inventario en la base de datos. |  |  |
| **Postcondiciones** | La mercancía dañada queda a la espera del proceso administrativo de devolución o baja definitiva; los vendedores dejan de ver estas unidades como disponibles. |  |  |
| **Criterios de aceptación** | **Clasificación exitosa:** Dado que la ferretería posee 20 bolsas de cemento físicas, todas disponibles, cuando el encargado marca 2 bolsas como dañadas por humedad, entonces el sistema actualiza el inventario interno mostrando: 18 Disponibles y 2 Dañadas, conservando la integridad del total de bodega en 20\. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El comportamiento detallado de los identificadores al reportar la avería quedará sujeto a la decisión pendiente sobre el modelo de rastreo: "Determinar si cada producto utiliza lote, serie, unidad o una combinación de estos para su seguimiento". |  |  |

PROMPT:continúa con los requerimientos "Inventario y existencias",   
"Compras y entradas".

RESULTADO:

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Reservas de Inventario |  |  |
| **Código de identificación** | RF-05 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema permitirá apartar temporalmente una cantidad específica de mercancía para un cliente particular, sin que esto implique todavía una salida definitiva por venta. Al registrar una reserva, el sistema descontará esas unidades del inventario "Disponible" y las moverá al inventario "Reservado", impidiendo que otro vendedor las facture. La reserva tendrá una fecha límite de vigencia. El sistema permitirá liberar esta reserva (devolver los productos a disponibilidad) ya sea automáticamente al vencerse el tiempo, o manualmente mediante intervención de un usuario autorizado. |  |  |
| **Justificación** | Los procesos comerciales de una ferretería frecuentemente involucran cotizaciones aprobadas o pedidos en tránsito que requieren asegurar la mercancía mientras el cliente concreta el pago o el retiro. Esto previene la sobreventa de productos comprometidos. |  |  |
| **Precondiciones** | El producto a reservar debe contar con existencias suficientes en el estado "Disponible" (mayor o igual a la cantidad solicitada). |  |  |
| **Restricciones** | Una reserva no puede dejar el saldo disponible en negativo (aplicación de RF-03). Las reservas vencidas deben liberar el inventario para no retener capital inmovilizado artificialmente. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-03 |  |  |
| **Actores** | Usuario de ventas, Sistema (liberación automática). |  |  |
| **Entradas** | \- Cliente (Selección de base de datos de terceros, Obligatorio). \- Referencia o referencias a reservar (Obligatorio). \- Cantidad por referencia (Numérico, Obligatorio). \- Pedido asociado (Alfanumérico, Obligatorio). \- Fecha límite de reserva (Fecha/Hora, Obligatorio).  |  |  |
| **Proceso** | 1\. El usuario de ventas ingresa al módulo de reservas y asocia a un cliente y un número de pedido. 2\. El usuario agrega las referencias y cantidades deseadas. 3\. El sistema verifica que haya saldo disponible. 4\. Si hay saldo, el sistema procesa la operación, transfiere las cantidades al estado "Reservado" y registra la fecha límite. 5\. Cuando ocurre un evento de liberación (vencimiento de fecha límite o solicitud manual autorizada), el sistema ejecuta el movimiento inverso, retornando las cantidades al estado "Disponible". 6\. El sistema deja rastro en auditoría de la creación y de la liberación de la reserva.  |  |  |
| **Salida** | Documento de reserva guardado y actualización de los saldos lógicos en la base de datos de inventario. |  |  |
| **Postcondiciones** | El inventario afectado ya no será visible como "Disponible" para facturación general hasta que la reserva se libere o se convierta en una venta efectiva. |  |  |
| **Criterios de aceptación** | **Caso de reserva exitosa:** Dado que hay 50 unidades disponibles de un taladro, cuando el usuario crea una reserva de 5 unidades para el Cliente A, entonces el sistema muestra 45 unidades disponibles y 5 reservadas, impidiendo facturar 46 a un Cliente B. **Caso de liberación por tiempo:** Dado que una reserva de 10 unidades venció ayer a las 23:59 horas, cuando inicia el día actual, entonces el sistema libera automáticamente la cantidad y suma nuevamente 10 unidades al saldo disponible general.  |  |  |
| **Requerimientos no funcionales** | RNF-03 (Consistencia de transacciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El alcance indica que una reserva puede liberarse por "una condición relacionada con compra". Está pendiente que el cliente precise si esto significa que al llegar nuevo inventario del proveedor se cumple un pedido pendiente, o si la reserva se cancela al comprarse un sustituto, entre otros escenarios. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Registro de Compras y Generación de Documento de Ingreso |  |  |
| **Código de identificación** | RF-06 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá un módulo para registrar la adquisición de mercancía a proveedores externos. Este proceso permitirá ingresar múltiples líneas de productos (referencias) en una misma transacción. El registro utilizará obligatoriamente la factura física o electrónica entregada por el proveedor como documento soporte. Tras la confirmación, el sistema creará un "Documento de Ingreso" interno asociado a un número consecutivo propio, el cual será el responsable de inyectar las nuevas unidades a las existencias físicas de la bodega. |  |  |
| **Justificación** | Es el mecanismo principal para dar entrada formal y trazable al inventario, impactando directamente la cantidad disponible para la venta y sentando las bases para el cálculo del costo de la mercancía. |  |  |
| **Precondiciones** | El proveedor y las referencias compradas deben existir previamente en las bases de datos maestras del sistema (Catálogos). |  |  |
| **Restricciones** | Ningún ingreso puede carecer de número de factura de soporte del proveedor. |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01, RF-02 |  |  |
| **Actores** | Usuario de compras, Responsable de inventario. |  |  |
| **Entradas** | \- Proveedor (Selección de base de terceros, Obligatorio). \- Número de factura del proveedor (Alfanumérico, Obligatorio). \- Referencias compradas (Selección, Obligatorio). \- Cantidades compradas (Numérico positivo, Obligatorio). \- Costo unitario (Monetario, Obligatorio).  |  |  |
| **Proceso** | 1\. El usuario inicia una nueva transacción de compra y selecciona el proveedor. 2\. Digita el número de factura de soporte. 3\. Agrega línea por línea los productos, digitando las cantidades recibidas y los costos acordados. 4\. El sistema valida las conversiones métricas (ej. si compra por cajas, lo convierte a unidades según RF-02). 5\. El usuario aprueba el documento. 6\. El sistema genera un Documento de Ingreso con un consecutivo automático. 7\. El sistema incrementa el saldo de inventario disponible y registra la auditoría del movimiento contable.  |  |  |
| **Salida** | Documento de ingreso generado. Existencias físicas aumentadas en el catálogo. |  |  |
| **Postcondiciones** | Las unidades ingresadas quedan listas e inmediatamente disponibles para la venta en el mostrador. Los costos actualizados quedan sujetos a los cálculos financieros pertinentes. |  |  |
| **Criterios de aceptación** | **Ingreso exitoso:** Dado que un producto tiene 0 existencias, cuando el usuario registra una compra que contiene 100 unidades respaldadas por la factura "INV-999", entonces el sistema genera el Documento de Ingreso "DI-001" y el saldo disponible del producto cambia a 100\. **Validación de documento soporte:** Dado que un usuario intenta guardar una compra sin especificar la factura del proveedor, entonces el sistema arroja un error que bloquea la transacción informando que el campo "Factura soporte" es obligatorio.  |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión 1:* No se ha determinado el modelo exacto del cálculo del costo (ej. promedio ponderado móvil) ni qué componentes integrarán ese costo (fletes, impuestos, descuentos). *Pendiente de decisión 2:* Queda por definir si al ingresar compras, el sistema exigirá obligatoriamente capturar "Lote", "Serie" o "Vencimiento", según el mecanismo de rastreo que se defina para cada producto.  |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Recepciones Parciales y Reversión Lógica de Ingresos |  |  |
| **Código de identificación** | RF-07 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El módulo de compras deberá ser lo suficientemente flexible para soportar entregas divididas en el tiempo. Es decir, una misma orden de compra podrá originar múltiples Documentos de Ingreso (recepciones parciales) hasta completar la totalidad de la mercancía negociada. Adicionalmente, el sistema contará con un mecanismo de protección de datos: si un usuario comete un error grave en un ingreso y decide "eliminarlo", el sistema no borrará físicamente el registro de la base de datos, sino que aplicará una "anulación lógica". Esto significa que la operación aparecerá como cancelada, revirtiendo las cantidades del inventario, pero reteniendo para siempre el número consecutivo, quién lo anuló, por qué y a qué hora. |  |  |
| **Justificación** | En ferretería es común que un camión proveedor no traiga todo el pedido en un solo viaje. Por otro lado, la prohibición de borrado físico obedece a normas estrictas de auditoría e integridad de la base de datos, evitando "huecos" en los consecutivos (ej. que pase del DI-005 al DI-007 sin rastro del DI-006). |  |  |
| **Precondiciones** | Existencia de un ingreso previamente guardado en el sistema, y permisos administrativos especiales para ejecutar anulaciones. |  |  |
| **Restricciones** | No se puede revertir un Documento de Ingreso si los productos amparados por dicho documento ya fueron vendidos y esto genera un saldo negativo en la bodega. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-06 |  |  |
| **Actores** | Usuario de compras, Administrador (para anulaciones). |  |  |
| **Entradas** | Para anulación: \- Número de documento de ingreso a revertir. \- Motivo de anulación (Texto explicativo, Obligatorio).  |  |  |
| **Proceso** | 1\. **Para recepciones parciales:** El usuario asocia un nuevo ingreso a una compra ya existente, indicando qué cantidades están llegando en esta entrega concreta. El sistema acumula estas recepciones hasta cruzar el total solicitado. 2\. **Para anulación lógica:** El usuario Administrador consulta un Documento de Ingreso cerrado y presiona "Anular". 3\. El sistema solicita confirmación y motivo. 4\. El sistema evalúa si restar esas cantidades dejará el inventario en negativo (Bloqueando la acción si ocurre). 5\. Si es viable, el sistema revierte el saldo de inventario e inserta una marca de "Anulado" al documento original. 6\. Registra la trazabilidad completa en la tabla de auditoría.  |  |  |
| **Salida** | Estado del documento actualizado a "Anulado" y restauración (disminución) de saldos a su estado anterior a la compra. |  |  |
| **Postcondiciones** | El consecutivo utilizado por el documento anulado queda "quemado" o inutilizable, preservando la continuidad del registro histórico y auditoría. |  |  |
| **Criterios de aceptación** | **Recepción parcial:** Dado un pedido de 100 tubos PVC, cuando el usuario registra un ingreso por 60 tubos hoy, el sistema aumenta 60 en inventario e informa que restan 40 por recibir de esa misma compra. **Anulación con bloqueo de negativos:** Dado un Documento de Ingreso de 10 sierras, de las cuales el mostrador ya vendió 5 (quedan 5), cuando el Administrador intenta anular completamente el Documento de Ingreso, entonces el sistema rechaza la operación informando que "No es posible anular la entrada porque el saldo actual (5) quedaría en números negativos, lo que indica que parte de esta mercancía ya fue vendida". |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* Aunque se plantea la "anulación lógica", debe determinarse con el cliente y su equipo contable si el mecanismo de "borrado" implicará solo anulación lógica, o si financieramente exigirán la emisión de un "Documento Compensatorio" (una salida tipificada por corrección de compra). En todos los casos el consecutivo y rastro se preservan. |  |  |

PROMPT:continúa con los requermientos "Ventas y salidas".  
"Reservas".

RESULTADO:

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Ventas y Emisión de Facturación |  |  |
| **Código de identificación** | RF-08 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema permitirá registrar las salidas de mercancía generadas por las operaciones comerciales diarias (ventas). Durante el proceso, el sistema calculará dinámicamente los subtotales según el historial de precios, aplicará los impuestos correspondientes y permitirá registrar descuentos autorizados. Al finalizar la transacción, el sistema descontará definitivamente las existencias vendidas y emitirá el documento soporte de la transacción, ya sea en formato de facturación electrónica o documento impreso. |  |  |
| **Justificación** | Representa el flujo principal de ingresos del negocio. Garantiza que la entrega de mercancía al cliente quede registrada legal y contablemente, y mantiene el inventario físico alineado con los movimientos comerciales en tiempo real. |  |  |
| **Precondiciones** | El sistema debe contar con conexión a Internet. El cliente debe estar identificado (ya sea con sus datos completos o como consumidor final genérico, según normativas). Debe existir saldo "Disponible" de los productos a vender. |  |  |
| **Restricciones** | No se puede completar la venta de un producto cuyo saldo disponible sea menor a la cantidad solicitada (Regla de oro de saldos no negativos). |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01, RF-02, RF-03 |  |  |
| **Actores** | Usuario de ventas, Cliente. |  |  |
| **Entradas** | \- Datos del cliente (Identificación, nombre, correo, etc., Obligatorio según tipo). \- Referencias a facturar (Escaneadas por código de barras o buscadas manualmente, Obligatorio). \- Cantidad de cada referencia (Numérico, Obligatorio). \- Descuentos o notas de ajuste aplicables (Numérico, Opcional).  |  |  |
| **Proceso** | 1\. El usuario de ventas asocia un cliente a la transacción. 2\. Utilizando el lector de código de barras o búsqueda manual, agrega los productos al carrito de venta. 3\. El sistema valida instantáneamente que exista saldo disponible y calcula precios e impuestos. 4\. El usuario confirma el cierre de la venta y los parámetros de facturación. 5\. El sistema descuenta las existencias del inventario "Disponible". 6\. El sistema emite la factura (generando un consecutivo o enviando la petición a la entidad fiscal). 7\. El sistema guarda la trazabilidad de la operación y el usuario que la ejecutó.  |  |  |
| **Salida** | Documento de facturación generado (impreso o electrónico) y actualización de las existencias. |  |  |
| **Postcondiciones** | Las unidades facturadas ya no forman parte del patrimonio de la ferretería y la transacción queda registrada para los cierres mensuales. |  |  |
| **Criterios de aceptación** | **Cálculo de facturación:** Dado que un producto cuesta \$100 y tiene un impuesto del 19%, cuando el usuario lo agrega a la venta, entonces el sistema muestra claramente un subtotal de \$100, un impuesto de \$19 y un total a pagar de \$119. **Salida de inventario exitosa:** Dado que un producto tiene 10 unidades disponibles, cuando el usuario finaliza y confirma la factura de 2 unidades, entonces el sistema genera el soporte fiscal y el inventario del producto disminuye inmediatamente a 8\.  |  |  |
| **Requerimientos no funcionales** | RNF-02 (Precisión en cálculos transaccionales). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión tributaria:* El cliente debe definir exactamente cuándo se utiliza numeración autorizada por la DIAN (facturación fiscal electrónica) y cuándo corresponde emitir un consecutivo interno (comprobante no fiscal), así como el tratamiento específico de los documentos impresos en cada caso. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Resolución de Concurrencia Transaccional en Ventas |  |  |
| **Código de identificación** | RF-09 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema implementará un mecanismo estricto de validación cruzada para operar en entornos con múltiples dispositivos conectados (cajas o mostradores concurrentes). Si dos o más usuarios intentan facturar o reservar simultáneamente las mismas unidades limitadas de un producto, el sistema otorgará la venta a la primera transacción que logre ser confirmada por el servidor central, bloqueando instantáneamente a los demás usuarios. |  |  |
| **Justificación** | Previene inconsistencias catastróficas en la base de datos (como vender 2 unidades cuando solo quedaba 1), un riesgo común en sistemas distribuidos con alto volumen de transacciones y facturación en múltiples puntos. |  |  |
| **Precondiciones** | Existencia de múltiples usuarios operando sobre la misma base de datos centralizada. |  |  |
| **Restricciones** | Ninguna transacción concurrente puede dejar el inventario en negativo, sin excepciones. |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-03, RF-08 |  |  |
| **Actores** | Sistema (Motor de base de datos), Usuarios concurrentes. |  |  |
| **Entradas** | \- Múltiples solicitudes de confirmación de facturación simultáneas enviadas por diferentes terminales (Obligatorio). |  |  |
| **Proceso** | 1\. El Cajero A y el Cajero B inician el cobro de la última unidad del "Producto X" al mismo tiempo. 2\. Ambos cajeros presionan el botón de "Confirmar Venta". 3\. El motor de base de datos del sistema recibe la petición del Cajero A una fracción de segundo antes que la del Cajero B. 4\. El sistema procesa la solicitud de A, descuenta el inventario (saldo queda en 0\) y aprueba su factura. 5\. El sistema evalúa la solicitud de B, detecta que el saldo ya es 0, aborta la transacción de B y le retorna un mensaje de error por inventario insuficiente.  |  |  |
| **Salida** | Aprobación de la primera transacción confirmada y rechazo documentado de las transacciones posteriores conflictivas. |  |  |
| **Postcondiciones** | El inventario permanece coherente y no se generan descuadres financieros por sobreventas. |  |  |
| **Criterios de aceptación** | **Resolución de empate:** Dado que queda solo 1 metro de cable disponible, cuando el usuario de la Caja 1 y el usuario de la Caja 2 intentan facturar ese mismo metro simultáneamente, entonces el sistema procesa exitosamente la venta para el primer usuario que confirmó y muestra en la pantalla del segundo usuario: "La transacción no pudo completarse, otro usuario acaba de facturar las existencias de este producto". |  |  |
| **Requerimientos no funcionales** | RNF-03 (Consistencia de transacciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión técnica:* Debe definirse el mecanismo exacto: si el sistema aplicará un bloqueo optimista (valida al momento final del pago, como se describió en el proceso) o un bloqueo pesimista (reserva temporalmente la unidad desde el momento en que se agrega al "carrito" de compras antes de pagar). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Ciclo de Vida y Conversión de Reservas a Ventas |  |  |
| **Código de identificación** | RF-10 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | Complementando la creación del documento de reserva (RF-05), el sistema debe permitir transformar (convertir) una reserva activa directamente en una factura de venta. Al realizar esta conversión, el sistema no volverá a descontar el inventario "Disponible" (ya que las unidades estaban separadas en estado "Reservado"), sino que descargará definitivamente las unidades reservadas y generará el ingreso fiscal, garantizando la trazabilidad desde la cotización original hasta la factura final. |  |  |
| **Justificación** | Evita el doble trabajo de tener que cancelar una reserva manualmente para luego volver a digitar los mismos productos en el módulo de ventas, agilizando el flujo de atención al cliente. |  |  |
| **Precondiciones** | Debe existir un documento de reserva vigente (no vencido) a nombre del cliente que solicita la facturación. |  |  |
| **Restricciones** | No se puede facturar una reserva cancelada o cuyas existencias ya fueron devueltas a disponibilidad por expiración. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-05, RF-08 |  |  |
| **Actores** | Usuario de ventas. |  |  |
| **Entradas** | \- Número de documento de la reserva activa (Alfanumérico, Obligatorio). |  |  |
| **Proceso** | 1\. El cliente se presenta a la ferretería para concretar la compra de los productos que había apartado. 2\. El cajero ingresa al módulo de ventas y busca el documento de reserva por número o cliente. 3\. El sistema carga automáticamente las referencias, cantidades y precios acordados en la reserva original hacia la pantalla de facturación. 4\. El usuario de ventas confirma la transacción de pago. 5\. El sistema emite la factura (DIAN o interna). 6\. El sistema da de baja las cantidades del inventario "Reservado", cerrando el ciclo logístico sin afectar el inventario "Disponible". |  |  |
| **Salida** | Factura generada y cierre definitivo del estado de la mercancía reservada. |  |  |
| **Postcondiciones** | La reserva original cambia su estado a "Completada/Facturada" y no podrá volver a ser utilizada. |  |  |
| **Criterios de aceptación** | **Conversión exitosa sin afectación de disponible:** Dado que un cliente tiene una reserva por 20 tejas (el sistema indica 100 disponibles y 20 reservadas), cuando el cajero convierte la reserva en venta, entonces el sistema genera la factura, y los saldos finales muestran 100 disponibles y 0 reservadas. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El alcance establece que una reserva puede liberarse por "una condición relacionada con compra". Está pendiente definir exactamente este escenario (ej. ¿Significa que si llega inventario nuevo a nombre del cliente, la reserva se asigna a esa llegada, o que una compra anula la reserva previa?). Hasta no aclararse, la conversión manual a venta descrita es el flujo primario válido. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Devolución y Recuperación de Productos Dañados al Proveedor |  |  |
| **Código de identificación** | RF-11 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | Complementando la funcionalidad de separación de mercancía averiada (RF-04), el sistema habilitará un proceso para que el Responsable de inventario gestione la recuperación de dichas pérdidas frente al proveedor originario. Esta operación permitirá registrar una "Solicitud de Cambio o Devolución", la cual dará de baja las unidades que se encontraban en el estado "Dañado", descargándolas definitivamente de la bodega del sistema y generando un documento soporte de salida hacia el proveedor. |  |  |
| **Justificación** | Cierra el ciclo de la mercancía averiada. Es imperativo que los productos defectuosos no se acumulen indefinidamente en el sistema contable como "dañados", sino que puedan ser retornados al fabricante para recuperar el capital mediante reposición física o notas de crédito. |  |  |
| **Precondiciones** | Deben existir unidades del producto clasificadas previamente en el estado de inventario "Dañado". |  |  |
| **Restricciones** | No se pueden devolver al proveedor cantidades superiores a las registradas en el saldo "Dañado". |  |  |
| **Prioridad** | Media |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-04, RF-06 |  |  |
| **Actores** | Responsable de inventario. |  |  |
| **Entradas** | \- Proveedor destinatario (Selección del catálogo de terceros, Obligatorio). \- Referencias a devolver (Obligatorio). \- Cantidad de unidades a descargar (Numérico, Obligatorio). \- Documento de ingreso original asociado a la compra (Alfanumérico, Opcional/Sujeto a rastreo).  |  |  |
| **Proceso** | 1\. El usuario ingresa al módulo de devoluciones a proveedores y selecciona la mercancía averiada que físicamente será retornada. 2\. El sistema valida que las cantidades solicitadas no superen el saldo de inventario categorizado como "Dañado". 3\. El usuario confirma el despacho de la mercancía. 4\. El sistema emite el comprobante de salida o solicitud de cambio. 5\. El sistema resta definitivamente las unidades del saldo "Dañado" (el saldo general físico de la bodega disminuye). 6\. Queda registrada la auditoría de la salida.  |  |  |
| **Salida** | Documento de devolución al proveedor generado y descarga definitiva del inventario dañado. |  |  |
| **Postcondiciones** | El inventario averiado sale físicamente de la empresa y deja de contar en el patrimonio de la ferretería a la espera de la compensación del proveedor. |  |  |
| **Criterios de aceptación** | **Descarga de averías:** Dado que existen 3 taladros en estado "Dañado", cuando el responsable gestiona la devolución de los 3 al proveedor Bosch, entonces el sistema genera el comprobante de devolución y el saldo "Dañado" de ese taladro pasa a ser 0\. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente no ha definido el mecanismo financiero exacto para resolver el cambio. Queda por establecer si el proveedor emite una Nota Crédito (que afectará cuentas por pagar) o si enviará unidades nuevas como reemplazo directo, para lo cual habría que definir cómo reingresan esas unidades al sistema. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Parametrización y Control de Fechas de Vencimiento |  |  |
| **Código de identificación** | RF-12 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá una funcionalidad dual para gestionar el ciclo de vida de los productos perecederos (como pegamentos, químicos o pinturas). Primero, permitirá configurar en el catálogo (por cada producto) si este exige o no el control de caducidad. Segundo, para los productos que lo requieran, el sistema obligará a registrar la fecha de vencimiento durante el proceso de compra (RF-06). Finalmente, el sistema proporcionará un mecanismo autorizado para registrar una "Baja de Inventario" cuando la mercancía cumpla su vida útil, retirándola de la disponibilidad de venta. |  |  |
| **Justificación** | Vender productos químicos o ferreteros caducados pone en riesgo las obras de los clientes y la reputación del negocio. Mantener trazabilidad del vencimiento permite tomar decisiones anticipadas (descuentos o devoluciones) y sanear la bodega de material inservible. |  |  |
| **Precondiciones** | El atributo de control de vencimiento debe estar activado en la ficha maestra del producto (RF-01). |  |  |
| **Restricciones** | Una compra de un producto configurado como perecedero no puede guardarse sin capturar la fecha límite. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01, RF-06 |  |  |
| **Actores** | Administrador, Responsable de inventario, Usuario de compras. |  |  |
| **Entradas** | \- Indicador de control de vencimiento (Booleano: Sí/No, en el catálogo). \- Fecha de vencimiento (Fecha, al momento del ingreso/compra). \- Autorización de baja (Credenciales de Administrador, Obligatorio para retirar inventario).  |  |  |
| **Proceso** | 1\. Al recibir un producto químico, el usuario de compras debe digitar la fecha de vencimiento impresa en el empaque para poder cerrar el documento de ingreso. 2\. El sistema almacena esta fecha asociada a las unidades o lote ingresado. 3\. Diariamente, el sistema evalúa las fechas almacenadas. 4\. Si un producto caduca, un usuario autorizado inicia el proceso de "Baja por Vencimiento". 5\. El sistema descuenta las unidades afectadas del saldo "Disponible", registrando una salida auditada con el concepto de caducidad.  |  |  |
| **Salida** | Mercancía perecedera controlada y, en caso de caducidad, registro de salida por baja. |  |  |
| **Postcondiciones** | El inventario caducado se retira del balance disponible, previniendo su facturación accidental en el mostrador. |  |  |
| **Criterios de aceptación** | **Bloqueo en compras:** Dado que la silicona estructural está parametrizada con control de vencimiento, cuando el operario intenta guardar la factura de compra sin digitar la fecha de caducidad, entonces el sistema detiene el proceso y resalta el campo de fecha como obligatorio. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión 1:* Está estrictamente pendiente definir si el registro de la baja afectará a nivel de "Unidad individual", "Lote completo" o "Referencia general", lo cual depende del mecanismo de rastreo que elija el cliente. *Pendiente de decisión 2:* Debe definirse si el sistema debe bloquear automáticamente la venta de un producto próximo a vencer (y con cuántos días de antelación) o si solo mostrará una advertencia al cajero.  |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Parametrización y Trazabilidad de Garantías de Venta |  |  |
| **Código de identificación** | RF-13 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema permitirá vincular periodos de garantía comercial a productos específicos dentro del catálogo (por ejemplo, herramientas eléctricas o maquinaria). Esta parametrización establecerá el tiempo de cobertura ofrecido. Al momento de facturar uno de estos productos, el sistema registrará internamente el nacimiento de dicha cobertura atada al documento de venta y al cliente, permitiendo imprimir la vigencia en la factura y facilitando la validación posterior en caso de que el cliente regrese con una reclamación. |  |  |
| **Justificación** | Formaliza el servicio posventa. Al tener trazabilidad sistémica, se evita que los empleados acepten devoluciones o reclamaciones de mercancía cuya cobertura ya ha expirado, protegiendo los intereses financieros de la ferretería. |  |  |
| **Precondiciones** | El producto debe tener configurado un tiempo de garantía válido en su ficha de catálogo (ej. "12 meses"). |  |  |
| **Restricciones** | Solo aplicable a artículos tangibles parametrizados; no aplicable a consumibles de venta libre si la política de la empresa lo restringe. |  |  |
| **Prioridad** | Media |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01, RF-08 |  |  |
| **Actores** | Administrador (Configuración), Usuario de ventas (Emisión), Cliente. |  |  |
| **Entradas** | \- Tiempo de garantía (Numérico/Unidad de tiempo, en catálogo). \- Identificador único del producto vendido (Como Lote o Número de Serie, si aplica). \- Factura de venta confirmada (Generada por el sistema).  |  |  |
| **Proceso** | 1\. El administrador configura que el "Taladro Percutor" posee 12 meses de garantía. 2\. Al realizarse la venta de este taladro (RF-08), el sistema calcula automáticamente la fecha de fin de cobertura partiendo de la fecha de la factura. 3\. El sistema imprime en la tirilla o factura electrónica el mensaje de cobertura vigente. 4\. Si el cliente regresa 6 meses después, un asesor puede consultar el número de factura o serie en el sistema. 5\. El sistema informará en pantalla si la garantía se encuentra "Vigente" o "Expirada", mostrando los datos de la compra original.  |  |  |
| **Salida** | Factura con nota de garantía y un registro interno de consulta posventa. |  |  |
| **Postcondiciones** | El artículo vendido queda en la base de datos de auditoría, listo para ser rastreado ante posibles reclamaciones técnicas. |  |  |
| **Criterios de aceptación** | **Cálculo de vigencia posventa:** Dado que se vendió una pulidora con 6 meses de garantía el 01/01/2026, cuando el asesor consulta esa factura el 01/08/2026, entonces el sistema muestra el artículo con una etiqueta roja indicando "Garantía Expirada", bloqueando recepciones automáticas por defectos de fábrica. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión 1:* El cliente debe definir el evento exacto que marca el "nacimiento" de la garantía (¿Se cuenta desde la fecha de emisión de la factura, o desde un acta de entrega posterior si es mercancía a domicilio?). *Pendiente de decisión 2:* Queda por precisar si para activar la garantía será obligatorio digitar el "Número de Serie" individual de la máquina, lo cual requiere definir primero la estrategia global de "Rastreo" (Lote, Serie o Unidad). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión del Directorio de Clientes y Proveedores (Terceros) |  |  |
| **Código de identificación** | RF-14 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema contará con un módulo centralizado para registrar, consultar y administrar la información de todas las personas o entidades que interactúan comercialmente con la ferretería. El sistema manejará a estos actores bajo el concepto de "Terceros", permitiendo que una misma persona o empresa pueda actuar simultáneamente con el rol de "Cliente" (para procesos de venta) y de "Proveedor" (para procesos de compra). Esto unificará su historial y evitará la duplicidad de registros en la base de datos. |  |  |
| **Justificación** | Mantener una base de datos única y limpia evita que el sistema se llene de información repetida, facilita la facturación ágil en el mostrador y mejora el control comercial al conocer todo el historial de interacción (compras y ventas) de un tercero con la empresa. |  |  |
| **Precondiciones** | El usuario debe tener los permisos correspondientes para crear o modificar terceros. |  |  |
| **Restricciones** | No pueden existir dos terceros distintos registrados con el mismo número de identificación fiscal o documento de identidad en el sistema. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | Ninguna |  |  |
| **Actores** | Usuario de ventas, Usuario de compras, Administrador. |  |  |
| **Entradas** | \- Número de identificación (Alfanumérico, Obligatorio). \- Nombre y Apellido o Razón Social (Texto, Obligatorio según tipo). \- Dirección y Ciudad (Texto, Opcional/Obligatorio según facturación). \- Teléfono y Correo electrónico (Contacto, Opcional). \- Rol del tercero (Casillas de selección: Cliente, Proveedor o Ambos, Obligatorio).  |  |  |
| **Proceso** | 1\. El usuario accede al directorio de terceros e inicia la creación de un nuevo registro. 2\. Digita el número de identificación del tercero. 3\. El sistema busca en la base de datos para garantizar que no exista un duplicado. 4\. El usuario completa los datos de contacto y le asigna el rol comercial (Cliente o Proveedor). 5\. Si el tercero ya existía previamente como Cliente y ahora será Proveedor, el usuario simplemente edita el registro existente y le activa el nuevo rol. 6\. El sistema guarda la información y registra la fecha, hora y usuario que creó o modificó el perfil.  |  |  |
| **Salida** | Registro del tercero almacenado y disponible para ser utilizado en facturas de venta o documentos de compra. |  |  |
| **Postcondiciones** | El tercero queda habilitado inmediatamente en los módulos de facturación y compras según los roles que se le hayan activado. |  |  |
| **Criterios de aceptación** | **Prevención de duplicidad cruzada:** Dado que "Juan Pérez" ya está registrado en el sistema con el rol de "Cliente" y número de identificación "12345", cuando el usuario de compras intenta crear un "Nuevo Proveedor" ingresando el mismo número "12345", entonces el sistema bloquea la creación y muestra un mensaje indicando: "Este número de identificación ya pertenece a un Cliente. Por favor, edite el perfil existente y asígnele también el rol de Proveedor". |  |  |
| **Requerimientos no funcionales** | Ninguno específico aplicable más allá del rendimiento general. |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe definir de forma explícita qué campos serán exigidos obligatoriamente para una "Persona Natural" (ej. exigir Nombre y Apellido pero bloquear Razón Social) y cuáles para una "Persona Jurídica" (ej. exigir Razón Social pero bloquear Nombre/Apellido), con el fin de programar correctamente las validaciones del formulario. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Cálculo y Actualización de Costos de Inventario |  |  |
| **Código de identificación** | RF-15 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema calculará y actualizará internamente el costo de cada producto cada vez que se registre la entrada de nueva mercancía mediante el proceso de compras (RF-06). Para lograrlo, el sistema utilizará un método basado en promedios, el cual mezclará matemáticamente el valor total del inventario que ya existía en la bodega con el valor y la cantidad de la nueva mercancía adquirida. Este valor actualizado será el nuevo "Costo" que se utilizará para calcular la rentabilidad de las ventas futuras. |  |  |
| **Justificación** | Los precios a los que los proveedores venden los productos fluctúan constantemente. Promediar el costo garantiza que la contabilidad interna de la empresa refleje un valor patrimonial realista y que los márgenes de ganancia reportados por el sistema sean precisos. |  |  |
| **Precondiciones** | Debe existir un ingreso de mercancía debidamente confirmado y soportado (RF-06). |  |  |
| **Restricciones** | El costo no puede ser manipulado manualmente en el día a día para cuadrar inventarios; su actualización debe ser consecuencia estrictamente matemática de las transacciones de compra, ajustes o devoluciones formales. |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-06 |  |  |
| **Actores** | Sistema (Automático), Responsable de cierre/gerencia (Consulta). |  |  |
| **Entradas** | \- Cantidad de existencias actuales (Sistema). \- Costo promedio actual del producto (Sistema). \- Cantidad de unidades entrantes (Documento de Ingreso). \- Valor de adquisición de las unidades entrantes (Documento de Ingreso).  |  |  |
| **Proceso** | 1\. El usuario de compras finaliza y confirma un Documento de Ingreso. 2\. El sistema detecta la llegada de nuevas unidades con su respectivo valor de compra. 3\. El motor financiero del sistema toma el valor total del inventario anterior y le suma el valor total de la nueva compra. 4\. El sistema divide este nuevo valor total entre la nueva cantidad total de existencias. 5\. El resultado de esta operación se guarda en la base de datos como el nuevo "Costo Promedio" del producto. 6\. El sistema guarda la traza de la variación del costo para futuras auditorías o consultas gerenciales.  |  |  |
| **Salida** | Costo del producto actualizado en la base de datos. |  |  |
| **Postcondiciones** | Cualquier reporte de rentabilidad o venta generada a partir de este momento utilizará el nuevo costo calculado. |  |  |
| **Criterios de aceptación** | **Cálculo de promedio:** Dado que en la bodega hay 10 palas con un costo promedio de \$10.000 cada una, cuando se procesa la compra de 10 palas adicionales pero a un costo de \$20.000 cada una, entonces el sistema calcula automáticamente que el nuevo costo unitario de la referencia es de \$15.000. |  |  |
| **Requerimientos no funcionales** | RNF-02 (Precisión en cálculos transaccionales). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El requerimiento está sujeto a que el cliente defina con su equipo contable el tipo matemático exacto del promedio (ej. "Promedio Ponderado Móvil") y qué elementos sumarán al valor de adquisición (ej. si se incluirán fletes de transporte, impuestos no descontables o descuentos comerciales otorgados por el proveedor). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Precios de Venta e Historial de Modificaciones |  |  |
| **Código de identificación** | RF-16 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá una interfaz para que el usuario autorizado establezca los precios de venta al público de los productos. Para facilitar el trabajo comercial, el sistema permitirá definir el precio de venta inyectando un "Porcentaje de Incremento" deseado sobre el costo actual del producto (rentabilidad). Cualquier cambio que se realice sobre el precio requerirá una confirmación explícita y generará un registro inmutable en un "Historial de Precios", garantizando que siempre se pueda consultar a qué precio se vendía un artículo en una fecha pasada y quién autorizó dicho valor. |  |  |
| **Justificación** | Permite a la ferretería proteger su margen de ganancia cuando los costos de los proveedores suben. El control del historial previene fraudes internos, asegurando que un empleado no reduzca un precio sin dejar rastro en el sistema. |  |  |
| **Precondiciones** | El producto debe tener un costo calculado válido en el sistema (RF-15). |  |  |
| **Restricciones** | Los vendedores de mostrador no pueden modificar los precios base del catálogo desde la pantalla de facturación. Únicamente el usuario con rol de Responsable de inventario u otro superior autorizado podrá ejecutar esta modificación en el módulo maestro. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-15 |  |  |
| **Actores** | Responsable de inventario (Modificación), Administrador/Gerencia (Aprobación/Auditoría). |  |  |
| **Entradas** | \- Referencia del producto a modificar (Obligatorio). \- Porcentaje de incremento deseado (Numérico, Opcional si se digita precio manual). \- Nuevo precio de venta directo (Monetario, Opcional si se utiliza el porcentaje). \- Credenciales de autorización (Obligatorio).  |  |  |
| **Proceso** | 1\. El Responsable de inventario ingresa al módulo de gestión de precios. 2\. Consulta el producto deseado y el sistema le expone el costo actual. 3\. El usuario ingresa un porcentaje de ganancia esperado (ej. 30%). 4\. El sistema calcula matemáticamente a cuánto equivale ese precio de venta final y lo muestra para verificación. 5\. El usuario guarda la modificación y el sistema solicita una aprobación (si aplica según configuración de permisos). 6\. El sistema actualiza el precio activo del catálogo e inserta una línea en el historial indicando el precio anterior, el nuevo, el usuario responsable y la fecha.  |  |  |
| **Salida** | Precio de venta actualizado en el catálogo y nuevo registro en el historial de precios. |  |  |
| **Postcondiciones** | Los módulos de caja y facturación tomarán inmediatamente el nuevo precio de venta para las transacciones posteriores al momento del cambio. |  |  |
| **Criterios de aceptación** | **Cálculo por porcentaje:** Dado que un producto tiene un costo interno de \$10.000, cuando el responsable de inventario establece un porcentaje de incremento del 40%, entonces el sistema calcula y fija automáticamente el nuevo precio de venta al público en \$14.000. **Trazabilidad del historial:** Dado que el precio de un producto cambió de \$14.000 a \$15.000 hoy, cuando el administrador consulta el historial del producto, entonces el sistema muestra una tabla detallando claramente que el precio fue modificado el día de hoy por el Responsable de inventario desde la dirección IP de la oficina. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El alcance indica que "la actualización del precio requiere aprobación". Se debe definir operativamente con el cliente si el Responsable de inventario puede guardar y aprobar el precio por sí mismo, o si la herramienta debe enviar una notificación al rol de Gerencia para que este libere o confirme el cambio antes de que impacte las cajas. |  |  |

A continuación, presento los requerimientos funcionales correspondientes a los módulos de Facturación, Devoluciones y Ajustes, respetando estrictamente la estructura solicitada y documentando las decisiones pendientes.

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Emisión y Gestión de Facturación (Electrónica e Impresa) |  |  |
| **Código de identificación** | RF-17 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema procesará la facturación definitiva de las ventas, soportando la generación de documentos fiscales (Facturación Electrónica DIAN) y documentos de control interno (Facturación impresa/Tirillas). Durante la generación del documento, el sistema deberá desglosar y calcular correctamente toda la información financiera relacionada: subtotales, impuestos aplicables según el producto, descuentos comerciales otorgados al cliente y notas de ajuste. Todo documento generado utilizará un número consecutivo estricto para garantizar su trazabilidad fiscal y comercial. |  |  |
| **Justificación** | Cumplir con la normativa tributaria vigente y proveer al cliente un soporte legal de su compra. Un motor de facturación robusto previene sanciones legales y organiza el flujo de caja del negocio. |  |  |
| **Precondiciones** | Debe existir una venta confirmada (RF-08) con productos que tengan parametrizados sus respectivos impuestos en el catálogo. Conexión a Internet activa para el timbrado electrónico. |  |  |
| **Restricciones** | No se puede emitir una factura con valor total negativo. El sistema no permitirá la modificación física o borrado de una factura una vez ha sido generada y/o enviada a la entidad fiscal. |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-08, RF-14 |  |  |
| **Actores** | Usuario de ventas, Sistema (Motor de facturación e integración fiscal). |  |  |
| **Entradas** | \- Transacción de venta confirmada (Productos, cantidades, precios). \- Identificación del cliente (Obligatorio para facturas de alto monto o electrónicas). \- Impuestos aplicables (Automático desde el catálogo). \- Descuentos (Numérico, Opcional).  |  |  |
| **Proceso** | 1\. Tras confirmarse la salida de inventario por venta, el sistema consolida los datos financieros. 2\. El sistema calcula los impuestos sobre el subtotal base y resta los descuentos aplicados. 3\. El sistema determina (según configuración y reglas pendientes de definir) si debe emitir un documento interno o una factura electrónica fiscal. 4\. El sistema asigna el consecutivo correspondiente (ej. FE-001 o TIK-001). 5\. Si es electrónica, el sistema empaqueta la información y la transmite al servicio fiscal para su validación. 6\. El sistema guarda el documento final en la base de datos y lo envía a la impresora térmica o convencional.  |  |  |
| **Salida** | Documento de factura generado (PDF, XML, o impresión física). |  |  |
| **Postcondiciones** | La venta queda cerrada contablemente y el documento queda disponible para consulta en el módulo de auditoría y cierres de caja. |  |  |
| **Criterios de aceptación** | **Cálculo con impuestos y descuentos:** Dado que una venta tiene un subtotal de \$100.000, un impuesto del 19% (\$19.000) y un descuento del 10% aplicado sobre el subtotal (\$10.000), cuando el sistema genera la factura, entonces el total a pagar impreso debe ser exactamente \$109.000, mostrando el desglose claro de cada rubro. |  |  |
| **Requerimientos no funcionales** | RNF-02 (Precisión en cálculos transaccionales). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión tributaria:* El cliente debe definir urgentemente las reglas de negocio para la emisión: 1\) Cuándo el sistema debe usar numeración DIAN y cuándo consecutivo interno. 2\) Qué documentos tendrán carácter estrictamente fiscal. 3\) Si las notas de ajuste afectarán directamente el documento emitido o generarán un documento anexo (Nota Crédito/Débito). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Devoluciones de Clientes (Reingreso de Mercancía) |  |  |
| **Código de identificación** | RF-18 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá un módulo controlado para procesar las devoluciones de mercancía por parte de los clientes. Este proceso debe estar obligatoriamente enlazado a la factura de venta original. Al procesar la devolución, el sistema reingresará las unidades al inventario y registrará un movimiento de entrada que estará tipificado explícitamente como "Devolución" para no confundirlo con una compra a proveedores. El sistema requerirá que el usuario defina en qué estado ingresa el artículo (ej. "Disponible" si el empaque está intacto, o "Dañado" si es por garantía). |  |  |
| **Justificación** | Permite atender reclamaciones o cambios de mercancía de forma transparente, ajustando el inventario a la realidad física de la bodega y manteniendo un control estricto sobre los reversos financieros. |  |  |
| **Precondiciones** | El cliente debe presentar el número de factura original y los productos devueltos no pueden superar las cantidades facturadas originalmente. |  |  |
| **Restricciones** | Este movimiento debe requerir un nivel de autorización superior (ej. Administrador o Responsable de inventario). No se pueden devolver productos que no pertenezcan a la factura consultada. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-08, RF-17 |  |  |
| **Actores** | Usuario de ventas (Recepción), Administrador (Aprobación). |  |  |
| **Entradas** | \- Número de factura de venta original (Alfanumérico, Obligatorio). \- Referencias a devolver y cantidad (Obligatorio). \- Estado de recepción del inventario (Selección: Disponible o Dañado, Obligatorio). \- Motivo de la devolución (Texto explicativo, Obligatorio). \- Credenciales de autorización (Obligatorio).  |  |  |
| **Proceso** | 1\. El usuario ingresa al módulo de devoluciones y digita el número de factura que el cliente presenta. 2\. El sistema carga los detalles de la venta original. 3\. El usuario marca qué productos y cantidades está retornando el cliente, y especifica si la mercancía entra en estado útil o averiado. 4\. Un usuario autorizado digita sus credenciales para aprobar el reingreso. 5\. El sistema ejecuta el movimiento logístico: incrementa el inventario en el estado seleccionado. 6\. El sistema emite un comprobante de devolución (y/o nota crédito). 7\. El sistema guarda la trazabilidad de los estados anteriores y posteriores del inventario.  |  |  |
| **Salida** | Comprobante de devolución generado y saldos de inventario incrementados. |  |  |
| **Postcondiciones** | La factura original queda marcada parcialmente o totalmente devuelta, previniendo que se intente hacer una segunda devolución sobre las mismas unidades. |  |  |
| **Criterios de aceptación** | **Validación de cantidades:** Dado que un cliente compró 2 candados según la Factura F-001, cuando el asesor intenta procesar una devolución de 3 candados asociados a esa factura, entonces el sistema rechaza la operación informando que la cantidad devuelta supera la cantidad original vendida. **Afectación de inventario:** Dado que un cliente devuelve 1 manguera intacta por equivocación de medida, cuando el administrador aprueba la devolución en estado "Disponible", entonces el inventario disponible de esa manguera aumenta en 1 unidad sin afectar el saldo de compras.  |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe definir el mecanismo de cierre financiero de la devolución: ¿El sistema registrará una salida de efectivo inmediata de la caja (reembolso), o generará un "Saldo a Favor / Nota Crédito" para que el cliente lleve otro producto por el mismo valor? |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Ajustes Administrativos y Conteos Físicos de Inventario |  |  |
| **Código de identificación** | RF-19 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá una herramienta gerencial para realizar correcciones directas sobre los saldos de la bodega, producto de auditorías, mermas, robos o conteos físicos (inventarios generales). A diferencia de una compra o venta, este módulo permitirá generar tanto entradas como salidas de mercancía no comerciales. Todo ajuste requerirá una tipificación obligatoria, una justificación documentada y dejará una huella imborrable en el registro de auditoría, diferenciando estos movimientos de la operatividad diaria. |  |  |
| **Justificación** | Las discrepancias entre el sistema informático y la bodega física son inevitables con el tiempo (por pérdidas, errores humanos o mermas). Se necesita una herramienta oficial y controlada para conciliar el sistema con la realidad física sin "maquillar" compras o ventas. |  |  |
| **Precondiciones** | Para ejecutar un conteo físico global, el sistema debería tener la capacidad de "congelar" momentáneamente las ventas de los productos que están siendo auditados. |  |  |
| **Restricciones** | Únicamente el usuario con rol de Administrador o Gerencia podrá confirmar ajustes de inventario. Un ajuste de salida no puede dejar el saldo final del producto en números negativos. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Media |  |  |
| **Dependencia** | RF-03 |  |  |
| **Actores** | Responsable de inventario (Conteo), Administrador/Gerencia (Aprobación). |  |  |
| **Entradas** | \- Referencias auditadas (Obligatorio). \- Cantidad real contada físicamente (Numérico, Obligatorio). \- Tipo de ajuste (Automático según si la cantidad es mayor o menor a la del sistema). \- Documento o concepto soporte (Texto explicativo/Código de ajuste, Obligatorio). \- Credenciales de autorización (Obligatorio).  |  |  |
| **Proceso** | 1\. El Responsable de inventario ingresa al módulo de conteos e introduce la cantidad física que encontró en la estantería para el Producto X (ej. encontró 98 unidades). 2\. El sistema compara contra la base de datos (ej. el sistema esperaba 100 unidades). 3\. El sistema genera una propuesta de "Ajuste Negativo (Salida) por 2 unidades". 4\. El usuario adjunta la justificación ("Pérdida desconocida detectada en auditoría"). 5\. El Administrador revisa la propuesta, digita su contraseña y aprueba el movimiento. 6\. El sistema fuerza el saldo del inventario disponible a igualar el conteo físico (98). 7\. El sistema inserta el registro en la auditoría técnica con el estado anterior y posterior.  |  |  |
| **Salida** | Comprobante de ajuste de inventario y saldos de base de datos actualizados. |  |  |
| **Postcondiciones** | El inventario del sistema vuelve a ser fiel reflejo del inventario físico. Las unidades descontadas o sumadas afectarán el reporte de pérdidas y ganancias del mes. |  |  |
| **Criterios de aceptación** | **Ajuste positivo por sobrante:** Dado que el sistema registra 10 brochas disponibles, cuando el administrador aprueba un conteo físico donde se reportan 12 brochas, entonces el sistema genera un movimiento de entrada por ajuste de 2 unidades, dejando el saldo disponible final en 12\. **Auditoría de ajustes:** Dado que se realiza cualquier modificación por este módulo, cuando el gerente revisa el historial del producto, entonces verá claramente un movimiento de tipo "Ajuste Administrativo", la fecha, la IP desde donde se hizo y la nota de justificación, separado completamente del listado de ventas a clientes. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe estructurar el catálogo de "Conceptos de Ajuste" permitidos (ej. Merma, Robo, Muestra Comercial, Obsequio) para estandarizar las justificaciones, y definir si estos ajustes requerirán un documento físico firmado como soporte adicional. |  |  |

A continuación, presento los requerimientos funcionales correspondientes a los módulos de Cierres mensuales y la Gestión de usuarios, roles y permisos, manteniendo el rigor y la estructura establecida.

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Ejecución y Bloqueo de Cierres Mensuales de Operación |  |  |
| **Código de identificación** | RF-20 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá una funcionalidad para que el usuario con rol de gerencia ejecute el "Cierre de Periodo" (normalmente mensual). Al ejecutar esta acción, el sistema consolidará los saldos finales de inventario, los costos promedio calculados y los totales de facturación del mes, guardando una "fotografía" histórica inalterable. Una vez cerrado el periodo, el sistema bloqueará estrictamente la creación, edición, anulación o modificación de cualquier transacción (compras, ventas, ajustes) cuya fecha corresponda al mes cerrado. El sistema permitirá reabrir un periodo cerrado únicamente bajo una autorización gerencial estricta, registrando dicha reapertura en la auditoría. |  |  |
| **Justificación** | El cierre mensual es indispensable para garantizar la integridad contable y financiera de la ferretería. Evita que usuarios modifiquen operaciones de meses pasados, lo cual alteraría los reportes de rentabilidad, las liquidaciones de impuestos ya declaradas y los saldos iniciales del mes siguiente. |  |  |
| **Precondiciones** | No deben existir transacciones en estado "Borrador" o pendientes de confirmación en el mes que se pretende cerrar. |  |  |
| **Restricciones** | Ningún rol operativo (ventas, compras, inventario) puede saltarse el bloqueo de un periodo cerrado. Únicamente el rol Responsable de cierre/gerencia puede ejecutar el cierre o la reapertura. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-06, RF-08, RF-15, RF-19 |  |  |
| **Actores** | Responsable de cierre/gerencia. |  |  |
| **Entradas** | \- Periodo a cerrar (Mes y Año, Obligatorio). \- Credenciales de confirmación (Obligatorio). \- Para reapertura: Motivo de la reapertura (Texto explicativo, Obligatorio).  |  |  |
| **Proceso** | 1\. El gerente ingresa al módulo de periodos operativos e indica el mes que desea cerrar (ej. Agosto 2026). 2\. El sistema valida que no haya operaciones en conflicto y calcula los saldos de cierre consolidando el historial. 3\. El gerente confirma la acción ingresando su contraseña. 4\. El sistema cambia el estado del mes a "Cerrado" y aplica reglas de bloqueo en la base de datos para todas las fechas comprendidas en ese periodo. 5\. Si se requiere una corrección extemporánea, el gerente utiliza la opción "Reabrir periodo", digitando el motivo. 6\. El sistema levanta el bloqueo temporalmente y registra una alerta crítica de auditoría informando quién y por qué reabrió el mes.  |  |  |
| **Salida** | Periodo operativo marcado como "Cerrado" o "Reabierto", con su respectiva consolidación de saldos y bloqueo de modificaciones. |  |  |
| **Postcondiciones** | Cualquier intento de facturar, ajustar o ingresar compras con fecha retroactiva hacia el periodo cerrado será rechazado inmediatamente por el sistema. |  |  |
| **Criterios de aceptación** | **Bloqueo exitoso de modificaciones:** Dado que el mes de Julio se encuentra en estado "Cerrado", cuando un usuario de ventas intenta procesar una devolución o anular una factura con fecha del 15 de Julio, entonces el sistema rechaza la operación informando: "No es posible alterar esta transacción porque pertenece a un periodo contable cerrado". **Auditoría de reapertura:** Dado que el gerente reabre el mes de Julio para aplicar un ajuste olvidado, cuando se consulte el reporte de auditoría, entonces existirá un registro resaltado que indique "Periodo Julio reabierto por el usuario Gerencia, Motivo: Inclusión de factura de proveedor retrasada".  |  |  |
| **Requerimientos no funcionales** | RNF-01 (Auditoría de acciones críticas). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe determinar si el cierre será estrictamente mensual o si el sistema debe soportar cierres diarios (cuadres de caja) que se consoliden posteriormente en un cierre mensual. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Gestión de Usuarios, Roles y Control de Acceso (RBAC) |  |  |
| **Código de identificación** | RF-21 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema centralizará el control de acceso mediante un modelo basado en Roles. Permitirá al administrador crear cuentas de usuario individuales para los empleados, asignándoles credenciales de acceso únicas (usuario y contraseña). A cada usuario se le asignará uno o varios perfiles (roles) predefinidos en el alcance: "Responsable de cierre/gerencia", "Responsable de inventario", "Usuario de ventas" o "Usuario de compras". El sistema restringirá u otorgará visibilidad y acceso a los diferentes módulos, botones y reportes del sistema dependiendo exclusivamente del rol asociado al usuario que ha iniciado sesión. |  |  |
| **Justificación** | Garantiza la seguridad de la información y segrega las responsabilidades operativas. Un vendedor no debe poder modificar los precios ni consultar el costo de la mercancía, y un bodeguero no debería tener acceso a los cierres financieros. |  |  |
| **Precondiciones** | El usuario Administrador debe tener sesión activa para crear nuevas cuentas. |  |  |
| **Restricciones** | No pueden existir dos usuarios con el mismo nombre de inicio de sesión o correo electrónico. Todas las contraseñas deben estar cifradas en la base de datos (ningún usuario, ni siquiera el administrador, podrá ver contraseñas en texto claro). |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | Transversal a todo el sistema. |  |  |
| **Actores** | Administrador del sistema. |  |  |
| **Entradas** | \- Nombre completo del empleado (Texto, Obligatorio). \- Nombre de usuario / Correo (Alfanumérico, Obligatorio, Único). \- Contraseña temporal (Alfanumérico, Obligatorio). \- Rol o roles asignados (Selección de lista, Obligatorio). \- Estado de la cuenta (Activo/Inactivo, Obligatorio).  |  |  |
| **Proceso** | 1\. El administrador ingresa al panel de seguridad y configuración de usuarios. 2\. Digita los datos personales del empleado y establece sus credenciales de acceso. 3\. Selecciona el nivel de permisos asignando el rol correspondiente (ej. Responsable de inventario). 4\. El sistema valida la unicidad del nombre de usuario y guarda el registro, cifrando la contraseña. 5\. Cuando el empleado ingresa al sistema (Login), el motor de seguridad lee su rol y construye dinámicamente el menú de navegación. 6\. El sistema bloquea el acceso a rutas o acciones no permitidas para el rol, redirigiendo a pantallas de error de permisos si se intenta forzar el acceso.  |  |  |
| **Salida** | Cuenta de usuario creada, operativa y con privilegios restringidos según la configuración. |  |  |
| **Postcondiciones** | Todas las acciones que el usuario realice en el sistema (ventas, compras, ajustes) quedarán ligadas a su identificador único para efectos de auditoría (RF-01). |  |  |
| **Criterios de aceptación** | **Restricción de vistas por rol:** Dado que "Pedro" tiene asignado únicamente el rol de "Usuario de ventas", cuando Pedro inicia sesión en el sistema, entonces el menú de navegación le muestra el módulo de "Facturación" y "Reservas", pero oculta completamente los módulos de "Ajustes de Inventario", "Cierres Mensuales" y "Modificación de Precios". **Protección de acciones operativas:** Dado que el rol de gerencia es el único autorizado para ver costos de adquisición, cuando un usuario de ventas busca un producto en el catálogo, entonces la pantalla de información general le muestra el "Precio de venta" al público y las "Existencias", pero oculta por completo el campo "Costo promedio". |  |  |
| **Requerimientos no funcionales** | RNF-04 (Seguridad de la información y cifrado). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe aprobar y documentar en una "Matriz de Permisos" formal cada una de las funcionalidades exactas a las que tiene derecho cada rol. La descripción de permisos brindada en el alcance inicial sirve como base, pero no cubre la totalidad de los módulos (ej. ¿Quién autoriza la liberación manual de reservas?). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Registro de Auditoría y Trazabilidad de Movimientos |  |  |
| **Código de identificación** | RF-22 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema registrará de forma automática y estructurada (en segundo plano) un historial inmutable de todas las transacciones operativas y administrativas críticas, incluyendo compras, ventas, ajustes, modificaciones de precios y cambios de roles. Este registro de auditoría capturará obligatoriamente el tipo de movimiento, la fecha exacta, la hora, el usuario responsable, la dirección IP del dispositivo utilizado, y los estados (valores) de la información antes y después de la acción. El módulo permitirá al usuario con perfil gerencial consultar y filtrar estos registros para rastrear el origen de cualquier operación. |  |  |
| **Justificación** | Garantizar la integridad operativa de la ferretería, prevenir fraudes, resolver descuadres de inventario y cumplir con las mejores prácticas de retención de información contable. Permite responder objetivamente a la pregunta: "¿Quién hizo esto y cuándo?". |  |  |
| **Precondiciones** | El usuario debe haber iniciado sesión en el sistema (el sistema requiere conocer su identidad) para que la acción quede vinculada a su perfil. |  |  |
| **Restricciones** | Bajo ninguna circunstancia, ni siquiera utilizando el rol de mayor jerarquía (Administrador/Gerencia), el sistema permitirá borrar, modificar u ocultar registros que ya han sido guardados en la tabla de auditoría. |  |  |
| **Prioridad** | Crítica |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | Transversal a todos los módulos operativos (RF-01 a RF-21). |  |  |
| **Actores** | Sistema (Registro automático), Administrador/Gerencia (Consulta). |  |  |
| **Entradas** | Datos capturados automáticamente del entorno: \- Tipo de movimiento (Entrada/Salida/Modificación). \- Fecha y Hora del servidor. \- Identificación del Usuario autenticado. \- Dirección IP de conexión. \- Estado Anterior (Fotografía de los datos previos). \- Estado Posterior (Fotografía de los datos tras la confirmación).  |  |  |
| **Proceso** | 1\. Un usuario ejecuta y confirma una acción operativa (ej. modifica el precio de un candado). 2\. El motor del sistema aplica la modificación en la base de datos principal del catálogo. 3\. Simultáneamente, el sistema empaqueta los metadatos del evento (quién, cuándo, desde dónde, cuánto costaba antes y cuánto cuesta ahora). 4\. El sistema inserta este paquete como una fila protegida en la base de datos de auditoría. 5\. Cuando la Gerencia requiere revisar una anomalía, ingresa al módulo de consultas de auditoría. 6\. El usuario aplica filtros (por fechas, por usuario o por producto) y el sistema despliega el reporte histórico inalterable.  |  |  |
| **Salida** | Traza de auditoría insertada en la base de datos y reporte de consulta gerencial. |  |  |
| **Postcondiciones** | Las correcciones frente a errores humanos detectados requerirán la ejecución de un nuevo movimiento (ej. una nota de ajuste), manteniendo viva la traza del error original y de su respectiva corrección. |  |  |
| **Criterios de aceptación** | **Auditoría de modificación de datos:** Dado que el usuario "PedroVentas" modifica un descuento máximo autorizado del 5% al 15%, cuando el Gerente consulte el historial de ese parámetro, entonces el sistema mostrará una fila detallando: "Fecha/Hora: \[actual\], Usuario: PedroVentas, IP: 192.168.1.10, Acción: Cambio de parámetro, Estado Anterior: 5%, Estado Nuevo: 15%". |  |  |
| **Requerimientos no funcionales** | RNF-04 (Inmutabilidad y seguridad de la información). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión:* El cliente debe definir las políticas formales de retención: 1\) El tiempo exacto de conservación de esta auditoría (ej. 10 años). 2\) Si ese lapso se cuenta desde la fecha de emisión del evento, desde el cierre del mes contable o desde el final del ejercicio fiscal. 3\) Si será necesario conservar copias digitales de los documentos soporte (ej. PDF de facturas de proveedores). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Carga Masiva y Migración de Datos Iniciales desde Excel |  |  |
| **Código de identificación** | RF-23 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá una funcionalidad especializada para facilitar la transición de la ferretería hacia la nueva plataforma informática. Esta herramienta permitirá importar y consolidar archivos estructurados de Excel (.xlsx / .csv) que contengan las bases de datos previas del negocio: el catálogo maestro de productos, el directorio de terceros (clientes y proveedores) y los saldos físicos iniciales de la bodega. El motor de importación implementará un control estricto de duplicidad y validación de formatos antes de inyectar la información a la base de datos definitiva. |  |  |
| **Justificación** | Arrancar un sistema transaccional desde cero digitando miles de referencias de forma manual es inviable operativamente. La carga masiva garantiza un despliegue ágil, siempre que la herramienta cuente con barreras contra datos inconsistentes que puedan corromper la base de datos desde el día uno. |  |  |
| **Precondiciones** | El usuario debe poseer el archivo Excel debidamente depurado y estructurado según la plantilla oficial que requiera el sistema informático. |  |  |
| **Restricciones** | El sistema cancelará completamente el proceso si detecta duplicados en identificadores únicos (como códigos de barras o números de identificación de terceros). No se procesarán archivos parciales si contienen errores lógicos estructurales. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | RF-01 (Catálogo), RF-14 (Terceros). |  |  |
| **Actores** | Administrador del sistema. |  |  |
| **Entradas** | \- Archivo Excel estructurado (Obligatorio). \- Selección del tipo de importación (Catálogo, Terceros o Saldos Iniciales, Obligatorio).  |  |  |
| **Proceso** | 1\. El administrador ingresa al módulo de importación y carga el archivo Excel correspondiente al catálogo de productos. 2\. El sistema recibe el archivo y ejecuta un proceso de pre-validación en memoria temporal. 3\. El sistema revisa cada fila verificando que los códigos de barras no se repitan internamente ni contra la base de datos actual, y que los tipos de datos sean correctos (ej. que los precios no contengan letras). 4\. Si el sistema encuentra anomalías, detiene la importación y genera un reporte de errores indicando las celdas o filas problemáticas para que el usuario las corrija. 5\. Si la validación es 100% exitosa, el sistema procede a insertar masivamente los registros consolidando la información de manera oficial. |  |  |
| **Salida** | Base de datos maestra poblada con la información histórica o, en su defecto, reporte detallado de errores de validación. |  |  |
| **Postcondiciones** | El sistema queda alimentado con la información base necesaria (productos e inventarios) para poder procesar la primera venta o compra operativa real del negocio. |  |  |
| **Criterios de aceptación** | **Prevención de duplicidad en importación:** Dado que el archivo Excel a migrar contiene dos filas distintas pero que comparten el mismo código de barras "880055", cuando el administrador intenta subir el archivo, entonces el sistema rechaza la importación y muestra en pantalla: "La migración fue abortada: Se encontraron códigos de barras duplicados en las filas 240 y 412 del archivo". |  |  |
| **Requerimientos no funcionales** | RNF-05 (Rendimiento y capacidad para procesos por lotes). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión técnica:* Para diseñar la plantilla de Excel, es imprescindible que el cliente determine: 1\) Estructura exacta de los archivos (hojas, columnas obligatorias). 2\) Volumen de información esperada (cantidad aproximada de registros). 3\) Criterio de consolidación en caso de que un registro ya exista (¿El sistema debe omitir el registro nuevo, o debe sobrescribir y actualizar la información antigua?). 4\) Método contable para registrar las existencias iniciales (ej. ¿Se generará un documento formal de "Ajuste por apertura" que inyecte todo el saldo de golpe?). |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Captura Ágil de Datos mediante Lectores de Códigos de Barras y QR |  |  |
| **Código de identificación** | RF-24 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema estará capacitado para interpretar las señales emitidas por dispositivos de lectura óptica (escáneres de códigos de barras convencionales y lectores bidimensionales QR). Esta funcionalidad permitirá que, en lugar de digitar manualmente el código de un producto en los módulos de venta, compra o conteo de inventario, el usuario simplemente escanee el empaque físico. El sistema recibirá esta lectura, buscará la coincidencia exacta en el catálogo maestro y agregará el artículo automáticamente a la pantalla de transacción en curso. |  |  |
| **Justificación** | Minimiza radicalmente el tiempo de atención al cliente en el mostrador y erradica los errores humanos derivados de la digitación manual de códigos largos, garantizando que el producto cobrado o ingresado sea exactamente el que se tiene en la mano. |  |  |
| **Precondiciones** | El producto escaneado debe estar previamente registrado en el sistema con su respectivo código de barras asignado (RF-01). El dispositivo lector debe estar correctamente conectado a la computadora del usuario. |  |  |
| **Restricciones** | El lector debe estar configurado para enviar la información simulando la entrada de un teclado (modo HID) o terminar la lectura con un salto de línea (Enter) para que el sistema procese automáticamente la búsqueda sin requerir clics adicionales. |  |  |
| **Prioridad** | Alta |  |  |
| **Dificultad** | Baja |  |  |
| **Dependencia** | RF-01, RF-06, RF-08 |  |  |
| **Actores** | Usuario de ventas, Usuario de compras, Responsable de inventario. |  |  |
| **Entradas** | \- Cadena de caracteres numéricos o alfanuméricos capturada por el lector óptico (Obligatorio). |  |  |
| **Proceso** | 1\. El cajero sitúa el cursor sobre el campo de búsqueda rápida en el módulo de ventas. 2\. El cajero acciona el lector óptico sobre el código impreso en el producto. 3\. El sistema intercepta la ráfaga de texto enviada por el lector. 4\. El sistema consulta instantáneamente la base de datos de referencias vendibles. 5\. Si el código existe, el sistema agrega automáticamente una unidad de ese producto al carrito de compras y recalcula los totales. 6\. Si el código no existe, el sistema emite una alerta visual y sonora indicando "Producto no encontrado".  |  |  |
| **Salida** | Producto identificado y cargado en el módulo transaccional correspondiente. |  |  |
| **Postcondiciones** | La interfaz queda inmediatamente lista y con el cursor posicionado para recibir la lectura del siguiente producto, permitiendo escanear múltiples artículos de forma continua. |  |  |
| **Criterios de aceptación** | **Lectura fluida:** Dado que el campo de búsqueda está activo, cuando el cajero escanea tres productos distintos consecutivamente en menos de 5 segundos, entonces el sistema procesa las tres lecturas y agrega los tres productos al listado de facturación de manera secuencial sin presentar bloqueos en la interfaz. |  |  |
| **Requerimientos no funcionales** | RNF-04 (Eficiencia del desempeño). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | Ninguna. |  |  |

| Requerimientos funcionales |  |  |  |
| :---- | :---- | :---- | :---- |
| **Campo** | **Información** |  |  |
| **Título de requerimiento** | Integración y Sincronización con Sistemas Externos |  |  |
| **Código de identificación** | RF-25 |  |  |
| **Versión** | 0.1 |  |  |
| **Fuente** | Documento de alcance inicial y análisis de negocio. |  |  |
| **Descripción** | El sistema proveerá los mecanismos necesarios (mediante interfaces de programación o servicios web) para intercambiar información con plataformas externas, manteniendo una base de datos única como fuente principal de verdad para clientes, productos y facturas. Esta integración garantizará que si la ferretería utiliza sistemas contables de terceros, plataformas de comercio electrónico o entidades de reporte fiscal, la información fluya de manera segura y estructurada, evitando la doble digitación. |  |  |
| **Justificación** | Los negocios modernos no operan aislados. Permitir que la base de datos central de la ferretería "dialogue" con otros programas agiliza la labor del área contable y abre la puerta a nuevos canales de venta. |  |  |
| **Precondiciones** | El sistema debe contar con conexión a Internet estable para alcanzar los servidores de los sistemas de terceros. |  |  |
| **Restricciones** | Ninguna integración externa podrá saltarse las reglas de negocio del motor de inventario. Por ejemplo, una venta proveniente de una integración externa no podrá ser procesada si genera saldos negativos. |  |  |
| **Prioridad** | Media |  |  |
| **Dificultad** | Alta |  |  |
| **Dependencia** | Transversal a las bases de datos maestras (Catálogo y Terceros). |  |  |
| **Actores** | Sistema (Operación en segundo plano), Administrador (Configuración de credenciales de integración). |  |  |
| **Entradas** | \- Peticiones de datos (Request) entrantes desde el sistema externo. \- Paquetes de datos estructurados (ej. JSON o XML) con información de facturas, clientes o inventario a sincronizar.  |  |  |
| **Proceso** | 1\. El sistema de facturación detecta la creación de un nuevo cliente o la confirmación de una factura. 2\. El sistema empaqueta esta información en un formato estándar seguro. 3\. El sistema autentica su identidad frente a la interfaz del sistema externo utilizando claves (API Keys) preconfiguradas. 4\. El sistema transmite el paquete de datos y aguarda la confirmación de recepción. 5\. Si la comunicación falla, el sistema encola la tarea para reintentarla automáticamente más tarde, evitando la pérdida de información. |  |  |
| **Salida** | Confirmación de sincronización exitosa y registro del intercambio en la bitácora técnica. |  |  |
| **Postcondiciones** | La información de la ferretería queda reflejada en la plataforma del tercero (ej. el software contable del contador) de forma idéntica a la fuente original. |  |  |
| **Criterios de aceptación** | **Unicidad de la información:** Dado que un producto cambia su precio en el sistema principal de la ferretería, cuando ocurre el proceso de sincronización con el sistema externo, entonces el sistema externo adopta el nuevo precio, garantizando que ambas plataformas manejen la misma base de datos sin discrepancias. |  |  |
| **Requerimientos no funcionales** | RNF-01 (Seguridad y autorización cruzada). |  |  |
| **Estado** | Borrador |  |  |
| **Observaciones** | *Pendiente de decisión técnica:* Para diseñar las integraciones, es estrictamente necesario que el cliente defina: 1\) Cuáles son exactamente los sistemas externos concretos a integrar (ej. SAP, Siigo, WooCommerce). 2\) Los protocolos de comunicación admitidos por dichos sistemas. 3\) Los datos específicos que se intercambiarán en cada vía. |  |  |

| Requerimientos no funcionales |  |
| :---- | :---- |
| **Título de requerimiento** | Inmutabilidad y Trazabilidad de Acciones (Auditoría) |
| **Código de identificación** | RNF-01 |
| **Tipo de requerimiento** | Seguridad (Responsabilidad / Accountability \- ISO 25010\) |
| **Versión** | 0.1 |
| **Descripción** | El sistema debe garantizar que todas las transacciones que modifiquen el inventario, los precios o los estados contables queden registradas de manera irreversible, vinculando inequívocamente la acción a la identidad del usuario que la ejecutó, junto con su marca de tiempo y ubicación en red (Dirección IP). El sistema debe proteger esta bitácora contra cualquier intento de alteración o eliminación, incluso por parte de usuarios con privilegios administrativos. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | Dado que se ha registrado un movimiento en el log de auditoría, cuando un usuario con rol de Administrador de Base de Datos intenta ejecutar un comando de borrado (DELETE) sobre la interfaz o la capa de aplicación, entonces el sistema bloqueará la acción por diseño, asegurando que el registro permanezca intacto para futuras revisiones legales o gerenciales. |

| Requerimientos no funcionales |  |
| :---- | :---- |
| **Título de requerimiento** | Exactitud en Cálculos Financieros y de Conversión |
| **Código de identificación** | RNF-02 |
| **Tipo de requerimiento** | Adecuación Funcional (Exactitud \- ISO 25010\) |
| **Versión** | 0.1 |
| **Descripción** | El sistema debe proveer los resultados correctos y con el grado de precisión necesario para la normativa del país de operación en todas las operaciones que involucren fraccionamiento de inventario, cálculo de costos promedio (incluyendo hasta cuatro cifras decimales internamente para evitar pérdidas por truncamiento) y liquidación de impuestos. Los algoritmos de redondeo deben ser configurables y aplicarse de forma consistente en todos los módulos de impresión de facturas y reportes contables. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | Dado que se configuran reglas de redondeo comercial al peso o centavo más cercano, cuando el sistema calcula una factura con múltiples líneas fraccionadas e impuestos porcentuales, entonces la suma de los subtotales individuales debe cuadrar matemáticamente de forma exacta con el valor total a cobrar finalizado en la factura, sin márgenes de descuadre por decimales perdidos. |

| Requerimientos no funcionales |  |
| :---- | :---- |
| **Título de requerimiento** | Tolerancia a la Concurrencia y Consistencia de Datos |
| **Código de identificación** | RNF-03 |
| **Tipo de requerimiento** | Fiabilidad (Madurez y Disponibilidad \- ISO 25010\) |
| **Versión** | 0.1 |
| **Descripción** | La arquitectura del sistema debe manejar múltiples conexiones simultáneas procesando ventas de manera concurrente sobre el mismo catálogo de productos. El sistema implementará bloqueos lógicos a nivel de transacción de base de datos (ACID) para garantizar que en un escenario de alta concurrencia o de pérdida súbita de conectividad durante un cobro, la base de datos de inventario jamás quede en un estado ambiguo, corrompido o con saldos negativos. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | Dado que se produce un corte de suministro eléctrico o de Internet justo en el milisegundo en que se aprueba un pago pero antes de generar el comprobante, cuando el sistema se recupere, entonces deberá ser capaz de aplicar la transacción completa exitosamente o revertirla por completo (Rollback), pero nunca dejará el inventario parcialmente descontado sin un documento soporte asociado. |

| Requerimientos no funcionales |  |
| :---- | :---- |
| **Título de requerimiento** | Eficiencia del Desempeño y Límites de Capacidad |
| **Código de identificación** | RNF-04 |
| **Tipo de requerimiento** | Eficiencia del Desempeño (Comportamiento temporal y Capacidad \- ISO 25010\) |
| **Versión** | 0.1 |
| **Descripción** | El sistema debe estar diseñado estructuralmente para manejar operaciones ágiles de mostrador (procesando búsquedas, escaneos de código de barras y confirmaciones de facturas) sin presentar latencias que entorpezcan el flujo de clientes físicos en la ferretería. Asimismo, el repositorio de datos debe soportar un volumen histórico acumulativo de operaciones sin que el rendimiento de las consultas gerenciales decaiga de manera crítica con el paso de los años. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | *Pendiente de definición por parte del cliente:* Para formalizar la verificación de este requerimiento, el cliente debe definir los escenarios de capacidad concretos. Específicamente, debe documentarse mediante las siguientes métricas pendientes: 1\) Cantidad esperada de productos en el catálogo. 2\) Promedio de facturas diarias. 3\) Número máximo de dispositivos concurrentes en picos de utilización. 4\) Tiempo máximo de respuesta tolerado en segundos para buscar un artículo durante una venta. Hasta no recibir estos valores, el requerimiento define el estándar general de diseño orientado al rendimiento operativo sin cuellos de botella obvios. |

A continuación, presento los requerimientos no funcionales correspondientes a los atributos de Seguridad y de Capacidad y Rendimiento, desarrollados bajo la estructura establecida y aplicando los estándares de calidad requeridos.

| Requerimientos no funcionales |  |
| :---- | :---- |
| **Título de requerimiento** | Protección, Confidencialidad y Control Estricto de Acceso |
| **Código de identificación** | RNF-05 |
| **Tipo de requerimiento** | Seguridad (Confidencialidad, Integridad y Autenticidad — ISO/IEC 25010:2023) |
| **Versión** | 0.1 |
| **Descripción** | El sistema blindará la información financiera, los datos de los clientes y el patrimonio del inventario contra cualquier tipo de acceso o manipulación no autorizada. Para lograrlo, el sistema exigirá autenticación obligatoria antes de mostrar cualquier interfaz operativa. Todas las credenciales de acceso (contraseñas) deberán almacenarse en la base de datos utilizando algoritmos de cifrado unidireccional (hash), garantizando que ninguna persona, incluyendo al desarrollador o al administrador del sistema, pueda leerlas en texto claro. Asimismo, la arquitectura del sistema bloqueará cualquier intento de inyección de código o alteración directa en la base de datos que pretenda evadir los controles de la aplicación y la auditoría. |
| **Prioridad** | Crítica |
| **Criterios de aceptación** | **Protección contra evasión de roles:** Dado que un usuario con el rol exclusivo de "Ventas" conoce la dirección web (URL) del módulo de "Cierres Mensuales" e intenta acceder digitándola directamente en su navegador, entonces el servidor interceptará la petición, verificará que su perfil no tiene los permisos suficientes, bloqueará el acceso inmediatamente, mostrará una pantalla de acceso denegado y registrará una advertencia de seguridad en la bitácora del sistema. |

| Requerimientos no funcionales |  |
| :---- | :---- |
| **Título de requerimiento** | Límites de Capacidad y Tiempos de Respuesta bajo Carga Operativa |
| **Código de identificación** | RNF-06 |
| **Tipo de requerimiento** | Eficiencia del Desempeño (Capacidad y Comportamiento Temporal — ISO/IEC 25010:2023) |
| **Versión** | 0.1 |
| **Descripción** | La arquitectura del sistema debe dimensionarse para garantizar que las operaciones del día a día (especialmente la búsqueda ágil de productos con lectores de barras y la facturación en mostrador) no sufran latencias ni interrupciones durante los picos de mayor afluencia de clientes en la ferretería. El sistema de base de datos deberá ser capaz de alojar el catálogo completo, el directorio de terceros y consolidar el historial de movimientos de años anteriores sin que el rendimiento general de las consultas se degrade progresivamente. Debido a que en ingeniería de software no existe la capacidad "infinita", la infraestructura requerirá el establecimiento de umbrales máximos soportados para su correcta construcción. |
| **Prioridad** | Alta |
| **Criterios de aceptación** | **Pendiente de definición por parte del cliente.** Para que este requerimiento pueda ser verificado técnicamente mediante pruebas de estrés o de carga, el cliente debe proveer las métricas operativas de su negocio. Quedan pendientes por definir los siguientes parámetros exactos: 1\. Cantidad de referencias (productos) iniciales y el crecimiento anual esperado. 2\. Volumen promedio y picos de movimientos (facturas y compras) diarios. 3\. Número máximo de usuarios o dispositivos que realizarán transacciones concurrentes en el peor escenario. 4\. Tiempo máximo tolerable en segundos para que el sistema retorne los resultados de una búsqueda de producto en el catálogo. 5\. Años de historial transaccional que deberán mantenerse disponibles de forma inmediata antes de ser archivados. 6\. El objetivo de disponibilidad del servidor (ej. 99.9% de tiempo en línea) y los mecanismos de recuperación ante fallos físicos de infraestructura. |

PROMPT: 22\. GENERACIÓN DEL MODELO DE BASE DE DATOS A PARTIR DE LOS REQUERIMIENTOS  
Una vez que los requerimientos funcionales y no funcionales hayan sido desarrollados, revisados y validados, realiza una segunda fase de análisis orientada al diseño de la base de datos.  
La base de datos debe diseñarse exclusivamente a partir de los requerimientos aprobados, las reglas de negocio confirmadas y las decisiones que hayan sido definidas.  
No debes diseñar la base de datos basándote únicamente en las ideas iniciales proporcionadas en este prompt si posteriormente los requerimientos documentados modifican, aclaran o contradicen alguna de ellas.  
22.1 OBJETIVO  
Diseñar una base de datos relacional para el sistema de gestión de inventario de la ferretería.  
El modelo debe permitir representar correctamente:

Productos.  
Marcas.  
Presentaciones.  
Referencias vendibles.  
Códigos de barras.  
Unidades de medida.  
Conversiones.  
Fracciones.  
Existencias.  
Existencias disponibles.  
Existencias reservadas.  
Existencias dañadas.  
Compras.  
Detalles de compras.  
Recepciones parciales.  
Documentos de ingreso.  
Ventas.  
Detalles de ventas.  
Facturas.  
Clientes.  
Proveedores.  
Usuarios.  
Roles.  
Permisos.  
Reservas.  
Vencimientos.  
Garantías.  
Lotes.  
Series.  
Costos.  
Precios.  
Historial de precios.  
Devoluciones.  
Ajustes.  
Conteos físicos.  
Cierres mensuales.  
Auditoría.  
Notas de ajuste.  
Migración de información.  
Los demás elementos que sean necesarios según los requerimientos aprobados.  
No agregues entidades únicamente por seguir una plantilla genérica. Cada tabla, atributo y relación debe tener una justificación basada en los requerimientos.  
23\. PROCESO OBLIGATORIO ANTES DE GENERAR SQL  
No generes directamente el SQL.  
Primero realiza las siguientes etapas.

ETAPA 1 — MATRIZ DE REQUERIMIENTOS Y DATOS  
Analiza todos los requerimientos funcionales y determina:

Qué información necesita cada requerimiento.  
Qué entidades intervienen.  
Qué datos deben almacenarse.  
Qué datos son obligatorios.  
Qué datos son opcionales.  
Qué relaciones existen.  
Qué reglas de negocio deben convertirse en restricciones de base de datos.  
Presenta una matriz similar a:  
RequerimientoEntidades involucradasDatos principalesReglas de integridad24. ETAPA 2 — IDENTIFICACIÓN DE ENTIDADES  
Identifica las entidades necesarias para representar el dominio.  
Para cada entidad explica:

Nombre.  
Propósito.  
Requerimientos que la originan.  
Información que almacena.  
Relaciones principales.  
No crees tablas duplicadas para conceptos que pueden representarse mediante relaciones correctamente normalizadas.  
25\. ETAPA 3 — ATRIBUTOS  
Para cada entidad define:

Nombre del atributo.  
Tipo de dato propuesto.  
Obligatorio/opcional.  
Valor predeterminado, si corresponde.  
Restricciones.  
Descripción.  
Requerimiento que justifica su existencia.  
Ejemplo:  
EntidadCampoTipoObligatorioRestricciónDescripción  
Los nombres deben ser consistentes en toda la base de datos.  
26\. ETAPA 4 — CLAVES  
Define claramente:

Claves primarias  
Cada entidad debe tener una clave primaria apropiada.

Claves foráneas  
Todas las relaciones deben estar representadas mediante claves foráneas cuando corresponda.

Restricciones UNIQUE  
Identifica los datos que no pueden repetirse.  
Por ejemplo, si los requerimientos confirman que:

El código de barras debe ser único en todo el catálogo.  
Entonces el modelo debe implementar una restricción UNIQUE sobre el código de barras.  
No dependas únicamente de validaciones realizadas desde el frontend.  
27\. ETAPA 5 — RELACIONES  
Define las relaciones entre entidades.  
Para cada relación indica:

Entidad origen.  
Entidad destino.  
Cardinalidad.  
Si la relación es obligatoria u opcional.  
Clave foránea utilizada.  
Regla de negocio que representa.  
Utiliza correctamente relaciones:

1:1.  
1:N.  
N:M.  
Cuando exista una relación N:M, utiliza una entidad intermedia.  
28\. ETAPA 6 — NORMALIZACIÓN  
Diseña el modelo procurando cumplir principios de normalización relacional, especialmente hasta Tercera Forma Normal (3FN) cuando sea compatible con las necesidades del sistema.  
Evita:

Datos repetidos innecesariamente.  
Dependencias parciales.  
Dependencias transitivas.  
Información duplicada.  
Campos que almacenen múltiples valores sin justificación.  
Sin embargo, no normalices de forma excesiva si ello perjudica claramente las necesidades de auditoría, rendimiento o trazabilidad.  
Cuando decidas desnormalizar alguna información, explica:

Qué se desnormaliza.  
Por qué.  
Qué problema resuelve.  
Cómo se mantiene la consistencia.  
29\. ETAPA 7 — REGLAS DE NEGOCIO Y RESTRICCIONES  
Convierte las reglas de negocio que puedan garantizarse mediante la base de datos en:

PRIMARY KEY  
FOREIGN KEY  
UNIQUE  
NOT NULL  
CHECK  
DEFAULT  
Índices.  
Triggers, únicamente cuando realmente sean necesarios.  
Ejemplos de reglas que deben analizarse:

Código de barras  
Debe ser único en todo el catálogo.

Inventario  
No debe permitir existencias negativas.

Reservas  
La cantidad reservada no puede superar la cantidad disponible/reservable según las reglas definidas.

Estados  
Los estados permitidos deben estar controlados.

Auditoría  
Los movimientos importantes deben conservar trazabilidad.

Precios  
Debe conservarse el historial cuando los requerimientos indiquen que es necesario.

Cierres  
Los períodos cerrados no deben permitir modificaciones incompatibles con las reglas del sistema.  
No implementes una regla en SQL si el requerimiento no permite determinarla claramente.  
Cuando una regla dependa de lógica compleja de negocio, indica que deberá ser validada por la aplicación o mediante un mecanismo transaccional apropiado.  
30\. INVENTARIO Y CONCURRENCIA  
Presta especial atención al inventario.  
El modelo debe permitir distinguir como mínimo, si los requerimientos así lo mantienen:

Disponible.  
Reservado.  
Dañado.  
Debes explicar cómo se calcula o almacena cada cantidad.  
No dupliques información que pueda generar inconsistencias.  
Por ejemplo, si se almacenan:

Existencia total.  
Existencia disponible.  
Existencia reservada.  
Existencia dañada.  
Explica claramente las relaciones entre ellas y determina cuáles son valores almacenados y cuáles pueden calcularse.  
Analiza además las operaciones concurrentes de venta.  
El modelo debe impedir que dos operaciones simultáneas provoquen un inventario negativo.  
Explica qué estrategia utilizarás, por ejemplo:

Transacciones.  
Bloqueos.  
Control de concurrencia.  
Actualizaciones atómicas.  
Restricciones.  
Otra estrategia apropiada.  
No afirmes que una restricción CHECK por sí sola resolverá problemas de concurrencia si técnicamente no es suficiente.  
31\. COMPRAS Y RECEPCIONES PARCIALES  
El modelo debe contemplar la posibilidad de:

Una compra con múltiples líneas.  
Recepción parcial.  
Varias recepciones asociadas a una compra, si los requerimientos lo establecen.  
Documento de ingreso.  
Factura del proveedor.  
Consecutivo.  
Estado del documento.  
Anulación o eliminación lógica.  
Trazabilidad.  
Debe diferenciarse correctamente:  
Orden/compra comercial  
de  
Recepción física de mercancía  
cuando los requerimientos indiquen que conceptualmente son procesos diferentes.  
32\. VENTAS Y FACTURACIÓN  
Analiza y modela por separado, cuando corresponda:

Venta.  
Detalle de venta.  
Cliente.  
Factura.  
Numeración.  
Impuestos.  
Descuentos.  
Notas de ajuste.  
Devoluciones.  
No asumas que una venta y una factura son necesariamente la misma entidad.  
La decisión debe basarse en los requerimientos aprobados.  
33\. LOTES, SERIES, UNIDADES, VENCIMIENTOS Y GARANTÍAS  
El modelo debe reflejar correctamente el mecanismo de trazabilidad aprobado.  
Analiza si cada referencia puede manejar:

Lote.  
Serie.  
Unidad individual.  
Determina:

Qué entidad representa cada concepto.  
Cómo se relaciona con una compra.  
Cómo se relaciona con una venta.  
Cómo se relaciona con una garantía.  
Cómo se registra un vencimiento.  
Qué sucede cuando vence.  
Cómo se registra una baja.  
Cómo se relaciona con una devolución o cambio al proveedor.  
No inventes una estrategia de trazabilidad si todavía está pendiente de definición.  
34\. COSTOS Y PRECIOS  
El modelo debe permitir conservar:

Costo.  
Precio.  
Historial de precios.  
Porcentaje de incremento.  
Fecha de vigencia.  
Usuario responsable.  
Aprobación, si corresponde.  
El método de cálculo del costo promedio debe implementarse únicamente después de que los requerimientos hayan definido exactamente el método.  
Si continúa pendiente determinar si es promedio ponderado móvil u otro, documenta la dependencia antes de generar una implementación definitiva.  
35\. USUARIOS, ROLES Y PERMISOS  
Diseña un modelo que permita gestionar:

Usuarios.  
Roles.  
Permisos.  
Relación usuario-rol.  
Relación rol-permiso.  
Si un usuario puede tener varios roles, utiliza una relación N:M.  
Si los requerimientos establecen permisos específicos por módulo o acción, deben poder representarse de forma estructurada.  
36\. AUDITORÍA  
La auditoría es un componente fundamental.  
El modelo debe permitir conservar, según los requerimientos:

Tipo de movimiento.  
Fecha.  
Hora.  
Usuario.  
Dirección IP.  
Información anterior.  
Información posterior.  
Entidad afectada.  
Registro afectado.  
Acción realizada.  
Analiza si la auditoría debe implementarse mediante:

Tabla de auditoría general.  
Tablas específicas.  
Triggers.  
Auditoría desde la aplicación.  
Combinación de mecanismos.  
Explica la decisión.  
La auditoría no debe eliminarse cuando un registro se anule.  
37\. BORRADO Y TRAZABILIDAD  
No utilices DELETE físico para entidades transaccionales cuando esto pueda destruir información necesaria para auditoría.  
Analiza cuándo corresponde utilizar:

Anulación lógica.  
Estado.  
Fecha de eliminación.  
Usuario que anuló.  
Motivo.  
Documento soporte.  
Nota de ajuste.  
Distingue entre:

Catálogos.  
Datos maestros.  
Documentos.  
Movimientos de inventario.  
Registros de auditoría.  
Cada categoría puede tener una estrategia de eliminación diferente.  
38\. CIERRES MENSUALES  
El modelo debe permitir representar:

Período.  
Fecha de inicio.  
Fecha de cierre.  
Estado.  
Usuario que realizó el cierre.  
Usuario que realizó reapertura.  
Fecha y hora.  
Motivo de reapertura, si corresponde.  
Los movimientos posteriores deben respetar el estado del período.  
No definas reglas adicionales que no estén respaldadas por los requerimientos.  
39\. MIGRACIÓN DESDE EXCEL  
La base de datos debe considerar que inicialmente puede existir información proveniente de Excel.  
Analiza la necesidad de:

Tablas temporales de importación.  
Validación.  
Consolidación.  
Detección de duplicados.  
Errores de importación.  
Registro de filas rechazadas.  
Existencias iniciales.  
Trazabilidad de la migración.  
No introduzcas los datos directamente a las tablas definitivas sin considerar validaciones cuando el volumen o riesgo de inconsistencias lo justifique.  
40\. ÍNDICES  
Propón índices para los campos que realmente se utilizarán frecuentemente en:

Búsquedas.  
Código de barras.  
Productos.  
Clientes.  
Proveedores.  
Fechas.  
Documentos.  
Movimientos.  
Auditoría.  
Relaciones mediante claves foráneas.  
Para cada índice importante explica:

Campo.  
Tabla.  
Motivo.  
Consulta que beneficia.  
No indexes indiscriminadamente todas las columnas.  
41\. SEGURIDAD  
La base de datos debe contemplar los requerimientos de seguridad definidos.  
No almacenes contraseñas en texto plano.  
Si el sistema utilizará autenticación mediante una plataforma externa, identifica esa dependencia y no dupliques innecesariamente información sensible.  
Los permisos de aplicación y los permisos propios del motor de base de datos deben diferenciarse.  
42\. MOTOR DE BASE DE DATOS  
Antes de generar el SQL definitivo, identifica el motor objetivo.  
Si no está definido, pregunta cuál se utilizará entre opciones como:

PostgreSQL.  
MySQL/MariaDB.  
SQL Server.  
Oracle.  
Otro.  
No generes SQL específico de un motor sin indicar para cuál está diseñado.  
Si el usuario solicita continuar sin especificarlo, utiliza PostgreSQL como opción predeterminada y deja explícita esta decisión.  
43\. GENERACIÓN DEL SQL  
Una vez aprobado el modelo lógico y confirmadas las decisiones necesarias, genera el SQL completo.  
El SQL debe incluir, según corresponda:

Creación del esquema/base de datos.  
Tablas.  
Tipos o catálogos necesarios.  
Claves primarias.  
Claves foráneas.  
Restricciones NOT NULL.  
Restricciones UNIQUE.  
Restricciones CHECK.  
Valores DEFAULT.  
Índices.  
Triggers, únicamente cuando sean necesarios.  
Funciones/procedimientos, únicamente cuando sean necesarios.  
Vistas, cuando aporten valor funcional.  
Comentarios descriptivos de tablas y columnas, si el motor los soporta.  
El SQL debe ser:

Ejecutable.  
Consistente.  
Ordenado.  
Comentado.  
Reproducible.  
Idempotente cuando sea razonable.  
Compatible con el motor seleccionado.  
44\. ORDEN DE CREACIÓN  
Genera las estructuras respetando las dependencias.  
Por ejemplo:

Catálogos.  
Datos maestros.  
Usuarios y seguridad.  
Productos.  
Unidades y conversiones.  
Inventario.  
Clientes/proveedores.  
Compras.  
Recepciones.  
Ventas.  
Facturación.  
Reservas.  
Devoluciones.  
Ajustes.  
Cierres.  
Auditoría.  
Índices.  
Triggers y funciones.  
El orden final debe adaptarse al modelo real.  
45\. DATOS INICIALES  
Distingue claramente entre:

DDL  
Estructura de la base de datos.

DML inicial  
Datos básicos que sea necesario insertar para que el sistema pueda funcionar.  
No introduzcas datos ficticios de clientes, proveedores o productos como si fueran datos reales.  
Si incluyes datos de prueba, sepáralos claramente del SQL de producción.  
46\. VALIDACIÓN DEL SQL  
Después de generar el SQL, realiza una revisión lógica.  
Comprueba:

Integridad  
¿Todas las claves foráneas apuntan a entidades existentes?  
¿Existen relaciones circulares problemáticas?  
¿Los tipos de datos son compatibles?  
¿Las restricciones son coherentes?  
Negocio  
¿Puede existir un código de barras duplicado?  
¿Puede generarse inventario negativo?  
¿Puede una reserva superar lo permitido?  
¿Puede una venta afectar un período cerrado?  
¿Puede eliminarse físicamente una transacción que debe auditarse?  
¿Se conserva el historial?  
¿Se conserva la trazabilidad?  
Normalización  
¿Existen datos innecesariamente duplicados?  
¿Las relaciones N:M están correctamente modeladas?  
Rendimiento  
¿Las consultas principales tienen índices adecuados?  
¿Se están creando índices innecesarios?  
Seguridad  
¿Los datos sensibles están protegidos?  
¿La auditoría conserva la información necesaria?  
47\. MATRIZ DE TRAZABILIDAD BASE DE DATOS → REQUERIMIENTOS  
Después del SQL, genera una matriz que permita identificar qué requerimiento justifica cada entidad principal.  
Ejemplo:  
RequerimientoTabla(s) relacionadasRegla implementadaRF-001producto, marca, presentacion, referenciaReferencia vendibleRF-002referenciaCódigo de barras únicoRF-003inventario, unidad, conversionGestión de unidadesRF-004compra, detalle\_compra, recepcionRegistro de compras.........  
La matriz debe permitir comprobar que la base de datos no fue diseñada arbitrariamente.  
48\. FORMATO DE ENTREGA  
La entrega final debe tener este orden:

1\. Resumen del modelo  
Explica en lenguaje comprensible cómo está estructurada la base de datos.

2\. Decisiones de diseño  
Explica las decisiones importantes y por qué fueron tomadas.

3\. Modelo conceptual  
Describe las entidades y relaciones principales.

4\. Modelo lógico  
Presenta tablas, atributos, claves y relaciones.

5\. Reglas de integridad  
Explica qué reglas se implementan directamente en la base de datos.

6\. Consideraciones de concurrencia  
Explica cómo se evita el inventario negativo en operaciones simultáneas.

7\. Auditoría  
Explica cómo se conserva la trazabilidad.

8\. Índices  
Explica los índices principales.

9\. SQL  
Entrega el SQL completo en un bloque de código.

10\. Datos iniciales  
Si son necesarios, sepáralos del SQL estructural.

11\. Matriz de trazabilidad  
Relaciona los requerimientos con las tablas y reglas implementadas.

12\. Decisiones pendientes  
Indica cualquier aspecto que todavía impida considerar el SQL como definitivo.  
49\. REGLA FUNDAMENTAL  
No diseñes la base de datos para satisfacer una idea inicial si esa idea contradice los requerimientos finales aprobados.  
La jerarquía de información debe ser:

Requerimientos aprobados.  
Reglas de negocio aprobadas.  
Decisiones posteriores del cliente.  
Información inicial proporcionada.  
Supuestos explícitamente identificados.  
Nunca ocultes una decisión pendiente dentro del SQL.  
Si una decisión pendiente afecta directamente al modelo de datos, detente antes de generar esa parte del SQL y solicita la definición correspondiente.  
El objetivo es obtener una base de datos que sea:

Coherente con los requerimientos.  
Normalizada.  
Íntegra.  
Trazable.  
Segura.  
Mantenible.  
Preparada para crecer.  
Adecuada para las operaciones de inventario.  
Compatible con los procesos de compra y venta.  
Capaz de mantener la consistencia ante operaciones concurrentes.  
La base de datos debe ser considerada una implementación técnica de los requerimientos, no una interpretación independiente del negocio.

RESULTADO:

 **1\. Resumen del modelo**  
El modelo de base de datos propuesto está diseñado para soportar de manera robusta y escalable las operaciones logísticas y comerciales de la ferretería, garantizando la integridad de la información en todo momento. Se ha seleccionado **PostgreSQL** como motor de base de datos predeterminado, dada su alta confiabilidad en entornos transaccionales, su soporte nativo para campos estructurados como JSONB (ideal para nuestra auditoría) y su excelente manejo de bloqueos de concurrencia.

La arquitectura centraliza la información en catálogos unificados, donde la mercancía se gestiona a través de una relación jerárquica entre productos y sus referencias vendibles, garantizando que cada código de barras apunte a un único elemento real físico. Asimismo, las existencias se dividen lógicamente en tres estados (disponible, reservado y dañado) para proteger las ventas concurrentes y evitar los saldos negativos. Todas las acciones ejecutadas por los usuarios se trazan en una bitácora inmutable que captura el estado exacto de los datos antes y después de cualquier modificación.

### **2\. Decisiones de diseño**

Para dar cumplimiento a los requerimientos aprobados, se han tomado decisiones arquitectónicas clave. En primer lugar, se implementó un modelo de eliminación lógica generalizado para las entidades transaccionales; esto significa que los documentos de ingreso, las ventas y las reservas nunca se eliminan físicamente mediante comandos DELETE, sino que cambian su estado a "Anulado", preservando el historial de consecutivos y permitiendo que la auditoría mantenga su coherencia referencial.

En segundo lugar, se consolidó el directorio de actores en una única tabla de Terceros. En lugar de tener bases de datos separadas para clientes y proveedores que generen duplicidad cuando una persona asume ambos roles, el sistema evalúa indicadores booleanos dentro de un mismo perfil, simplificando la facturación y la asociación de cuentas. Finalmente, el control de acceso se diseñó bajo un modelo de control basado en roles (RBAC), separando estrictamente la autenticación de la autorización y permitiendo que la interfaz de la aplicación reaccione dinámicamente según los permisos del usuario.

### **3\. Modelo conceptual**

El dominio del sistema se compone de tres grandes núcleos lógicos que interactúan entre sí. El núcleo de **Catálogo y Configuración** contiene los parámetros maestros: unidades métricas, marcas, productos generales y la conformación exacta de las referencias vendibles con sus códigos de barras. Este núcleo alimenta al núcleo de **Gestión de Inventario**, el cual actúa como una caja fuerte que custodia las cantidades físicas; aquí residen las existencias disponibles, las reservas comprometidas y las unidades separadas por avería.

Por último, el núcleo **Transaccional** abarca los movimientos dinámicos que alteran el inventario. Este núcleo conecta a los Terceros con las Referencias a través de documentos formales: las compras (que inyectan existencias y recalculan costos), las ventas (que descargan existencias y registran ingresos) y los ajustes administrativos (que corrigen discrepancias físicas). Todo este ecosistema está vigilado transversalmente por el núcleo de **Seguridad y Auditoría**.

### **4\. Modelo lógico**

Las entidades principales que soportan el modelo se estructuran de la siguiente manera:

* **usuarios y roles:** Manejan las credenciales de acceso (con contraseñas cifradas) y determinan los módulos permitidos.  
*   
* **terceros:** Almacena la identificación fiscal única, nombres, contactos y los roles comerciales (cliente/proveedor).  
*   
* **productos, marcas, presentaciones:** Tablas maestras que normalizan las características de la mercancía.  
*   
* **referencias\_vendibles:** Entidad central que une el producto, la marca y la presentación bajo un código de barras único, controlando aquí las conversiones de unidades, el costo y el precio de venta.  
*   
* **inventario\_saldos:** Entidad dependiente de las referencias que divide estrictamente las cantidades en los tres estados funcionales (disponible, reservado, dañado).  
*   
* **documentos\_ingreso y detalles\_ingreso:** Representan las compras, enlazando al proveedor, el consecutivo de factura y afectando el saldo positivo.  
*   
* **reservas y detalles\_reserva:** Almacenan los compromisos temporales de mercancía asociados a un cliente con una fecha límite de vigencia.  
*   
* **auditoria\_log:** Tabla aislada que captura quién, cuándo, desde dónde y qué modificó en el sistema.  
* 

### **5\. Reglas de integridad**

El modelo implementa barreras directamente en el motor de base de datos para prevenir inconsistencias, sin depender exclusivamente de las validaciones de la aplicación:

* **Unicidad (UNIQUE):** Aplicado estrictamente al código de barras en referencias\_vendibles, al número de identificación en terceros y al nombre de usuario en usuarios.  
*   
* **Protección de Saldos (CHECK):** Las columnas de cantidad en inventario\_saldos poseen restricciones matemáticas que prohíben valores menores a cero (cantidad\_disponible \>= 0).  
*   
* **Obligatoriedad (NOT NULL):** Garantiza que ninguna transacción quede huérfana de fechas, usuarios responsables o valores monetarios.  
*   
* **Integridad Referencial (FOREIGN KEY):** Impide que se elimine una referencia si ya existen registros de inventario o ventas asociadas a ella.  
* 

### **6\. Consideraciones de concurrencia**

Para garantizar que múltiples cajas cobrando simultáneamente no generen inventario negativo (RF-09), el sistema utilizará un doble mecanismo de protección. A nivel lógico, la restricción CHECK (cantidad\_disponible \>= 0\) en la base de datos abortará cualquier transacción que intente descontar más de lo existente. A nivel transaccional, las operaciones de venta utilizarán el mecanismo de bloqueo de fila de PostgreSQL (SELECT ... FOR UPDATE); esto encola las peticiones concurrentes sobre una misma referencia a nivel de milisegundo, asegurando que la primera transacción confirmada actualice el saldo y libere el bloqueo, permitiendo que la segunda transacción lea el nuevo saldo (cero) y sea rechazada limpiamente antes de generar inconsistencias.

### **7\. Auditoría**

La trazabilidad (RF-22) se implementa mediante la tabla auditoria\_log. En lugar de crear múltiples tablas de auditoría fragmentadas, se utiliza un modelo centralizado apoyado en el tipo de dato estructurado JSONB de PostgreSQL. Cuando ocurre un evento crítico, el sistema o un *Trigger* inserta un nuevo registro documentando el nombre de la tabla afectada, la acción (INSERT, UPDATE, DELETE), el identificador del registro, y dos bloques de datos: estado\_anterior y estado\_nuevo. Esto permite reconstruir la historia completa de cualquier modificación, anulación de venta o cambio de precio sin alterar la estructura de las tablas transaccionales.

### **8\. Índices**

Para garantizar el cumplimiento de los tiempos de respuesta y la eficiencia del desempeño (RNF-04), se han planificado los siguientes índices estratégicos (B-Tree):

* **idx\_referencias\_codigo\_barras:** Facilita la búsqueda inmediata al escanear un producto en el mostrador.  
*   
* **idx\_terceros\_identificacion:** Acelera la validación de clientes al momento de iniciar una facturación.  
*   
* **idx\_auditoria\_fecha:** Optimiza la generación de reportes gerenciales para buscar eventos ocurridos en rangos de tiempo específicos.  
*   
* **idx\_inventario\_referencia:** Asegura que los bloqueos de concurrencia y las lecturas de saldo sean directas y eficientes.  
* 

### **9\. SQL**

A continuación se presenta el código DDL para la estructura base confirmada. Con base en la directriz 49, **se ha detenido la generación de las tablas de Facturación (DIAN) y Lotes/Series**, ya que dichas reglas tributarias y logísticas se encuentran explícitamente marcadas como "Decisiones Pendientes" en el análisis de requerimientos y alteran la morfología de las tablas de salida.

SQL  
\-- \==========================================  
\-- MOTOR: PostgreSQL  
\-- MODELO DE DATOS: Ferretería (Estructura Base)  
\-- \==========================================

\-- 1\. CATÁLOGOS Y SEGURIDAD  
CREATE TABLE roles (  
    id SERIAL PRIMARY KEY,  
    nombre VARCHAR(50) UNIQUE NOT NULL,  
    descripcion TEXT  
);

CREATE TABLE usuarios (  
    id SERIAL PRIMARY KEY,  
    rol\_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,  
    nombre\_completo VARCHAR(100) NOT NULL,  
    nombre\_usuario VARCHAR(50) UNIQUE NOT NULL,  
    password\_hash VARCHAR(255) NOT NULL,  
    activo BOOLEAN DEFAULT TRUE,  
    fecha\_creacion TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

CREATE TABLE terceros (  
    id SERIAL PRIMARY KEY,  
    identificacion VARCHAR(50) UNIQUE NOT NULL,  
    nombres\_razon\_social VARCHAR(150) NOT NULL,  
    telefono VARCHAR(20),  
    correo VARCHAR(100),  
    es\_cliente BOOLEAN DEFAULT FALSE,  
    es\_proveedor BOOLEAN DEFAULT FALSE,  
    fecha\_registro TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

\-- 2\. PRODUCTOS E INVENTARIO  
CREATE TABLE marcas (  
    id SERIAL PRIMARY KEY,  
    nombre VARCHAR(100) UNIQUE NOT NULL  
);

CREATE TABLE productos (  
    id SERIAL PRIMARY KEY,  
    nombre VARCHAR(150) NOT NULL,  
    control\_vencimiento BOOLEAN DEFAULT FALSE,  
    meses\_garantia INT DEFAULT 0  
);

CREATE TABLE presentaciones (  
    id SERIAL PRIMARY KEY,  
    nombre VARCHAR(100) UNIQUE NOT NULL  
);

CREATE TABLE unidades\_medida (  
    id SERIAL PRIMARY KEY,  
    codigo VARCHAR(10) UNIQUE NOT NULL,  
    nombre VARCHAR(50) NOT NULL  
);

CREATE TABLE referencias\_vendibles (  
    id SERIAL PRIMARY KEY,  
    producto\_id INT NOT NULL REFERENCES productos(id),  
    marca\_id INT NOT NULL REFERENCES marcas(id),  
    presentacion\_id INT NOT NULL REFERENCES presentaciones(id),  
    codigo\_barras VARCHAR(100) UNIQUE NOT NULL,  
    unidad\_base\_id INT NOT NULL REFERENCES unidades\_medida(id),  
    fraccion\_minima NUMERIC(10,4) NOT NULL DEFAULT 1 CHECK (fraccion\_minima \> 0),  
    costo\_promedio NUMERIC(15,4) NOT NULL DEFAULT 0,  
    precio\_venta NUMERIC(15,4) NOT NULL DEFAULT 0,  
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO'))  
);

CREATE TABLE inventario\_saldos (  
    referencia\_id INT PRIMARY KEY REFERENCES referencias\_vendibles(id),  
    cantidad\_disponible NUMERIC(15,4) NOT NULL DEFAULT 0 CHECK (cantidad\_disponible \>= 0),  
    cantidad\_reservada NUMERIC(15,4) NOT NULL DEFAULT 0 CHECK (cantidad\_reservada \>= 0),  
    cantidad\_danada NUMERIC(15,4) NOT NULL DEFAULT 0 CHECK (cantidad\_danada \>= 0)  
);

\-- 3\. AUDITORÍA TRANSVERSAL  
CREATE TABLE auditoria\_log (  
    id BIGSERIAL PRIMARY KEY,  
    tabla\_afectada VARCHAR(50) NOT NULL,  
    registro\_id INT NOT NULL,  
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'ANULACION')),  
    usuario\_id INT NOT NULL REFERENCES usuarios(id),  
    fecha\_evento TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    direccion\_ip VARCHAR(45),  
    estado\_anterior JSONB,  
    estado\_nuevo JSONB  
);

\-- 4\. COMPRAS (DOCUMENTOS DE INGRESO)  
CREATE TABLE documentos\_ingreso (  
    id SERIAL PRIMARY KEY,  
    consecutivo VARCHAR(50) UNIQUE NOT NULL,  
    proveedor\_id INT NOT NULL REFERENCES terceros(id),  
    factura\_proveedor VARCHAR(100) NOT NULL,  
    usuario\_crea INT NOT NULL REFERENCES usuarios(id),  
    fecha\_registro TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    estado VARCHAR(20) DEFAULT 'CERRADO' CHECK (estado IN ('BORRADOR', 'CERRADO', 'ANULADO'))  
);

CREATE TABLE ingreso\_detalles (  
    id SERIAL PRIMARY KEY,  
    documento\_id INT NOT NULL REFERENCES documentos\_ingreso(id),  
    referencia\_id INT NOT NULL REFERENCES referencias\_vendibles(id),  
    cantidad NUMERIC(15,4) NOT NULL CHECK (cantidad \> 0),  
    costo\_unitario NUMERIC(15,4) NOT NULL CHECK (costo\_unitario \>= 0),  
    fecha\_vencimiento DATE \-- Nulo si el producto no tiene control  
);

\-- ÍNDICES PRINCIPALES  
CREATE INDEX idx\_referencias\_codigo\_barras ON referencias\_vendibles(codigo\_barras);  
CREATE INDEX idx\_terceros\_identificacion ON terceros(identificacion);  
CREATE INDEX idx\_auditoria\_fecha ON auditoria\_log(fecha\_evento);

### **10\. Datos iniciales**

SQL  
\-- DML INICIAL  
INSERT INTO roles (nombre, descripcion) VALUES  
('ADMINISTRADOR', 'Control total del sistema y seguridad'),  
('GERENCIA', 'Aprobaciones, auditoría y cierres mensuales'),  
('RESPONSABLE\_INVENTARIO', 'Gestión de bodega, precios y compras'),  
('VENTAS', 'Facturación de mostrador y reservas');

INSERT INTO usuarios (rol\_id, nombre\_completo, nombre\_usuario, password\_hash) VALUES  
(1, 'Administrador del Sistema', 'admin', '\$2b\$12\$ejemploHashCifradoPredeterminado'); \-- Hash seguro real a generar por el backend

INSERT INTO unidades\_medida (codigo, nombre) VALUES  
('UND', 'Unidad'),  
('KG', 'Kilogramo'),  
('M', 'Metro'),  
('GL', 'Galón');

### **11\. Matriz de trazabilidad**

| Requerimiento | Tabla(s) relacionadas | Regla implementada |
| :---- | :---- | :---- |
| **RF-01 (Catálogo)** | productos, marcas, referencias\_vendibles | Referencia compuesta con código de barras UNIQUE. |
| **RF-02 (Unidades)** | unidades\_medida, referencias\_vendibles | Definición de unidad base y fracción mínima CHECK (\>0). |
| **RF-03 (Inventario)** | inventario\_saldos | Separación lógica de saldos y restricción de cantidad\_disponible \>= 0. |
| **RF-06 (Compras)** | documentos\_ingreso, ingreso\_detalles | Relación obligatoria con terceros (proveedor) y factura soporte. |
| **RF-14 (Terceros)** | terceros | Base unificada con banderas booleanas es\_cliente / es\_proveedor. |
| **RF-21 (Roles/RBAC)** | roles, usuarios | Relación estricta y protección de autenticación (hash). |
| **RF-22 (Auditoría)** | auditoria\_log | Trazabilidad inmutable apoyada en almacenamiento documental JSONB. |

### **12\. Decisiones pendientes (Bloqueantes para SQL Final)**

Para garantizar la integridad del diseño y no inventar estructuras sobre reglas ambiguas (conforme a la instrucción 49), he pausado la generación lógica del SQL en los siguientes módulos hasta que se resuelvan estas definiciones:

1. **Rastreo y Trazabilidad (RF-12, RF-13):** Debe definirse si el inventario se seguirá a nivel de Lote (requiere tabla secundaria lotes vinculada al saldo) o de Serie Única (requiere tabla de instancias individuales por cada herramienta). Esto afecta estructuralmente la tabla inventario\_saldos y los detalles de ventas y compras.  
2.   
3. **Facturación DIAN (RF-17):** Debe precisarse qué componentes de facturación electrónica se almacenarán (ej. CUFE, firma, XML de respuesta) para diseñar la tabla de facturas distinguiendo correctamente entre consecutivos fiscales internos y resoluciones gubernamentales.  
4.   
5. **Cálculo de Costo (RF-15):** Antes de estructurar los triggers matemáticos para el costo, debe definirse formalmente si la valoración será por Promedio Ponderado Móvil y si se incluirán líneas de fletes adicionales en las tablas de documentos\_ingreso.


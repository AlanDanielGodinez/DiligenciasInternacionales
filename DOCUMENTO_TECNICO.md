# DOCUMENTO TÉCNICO
## SISTEMA DE GESTIÓN DE DILIGENCIAS INTERNACIONALES

---

## CONTENIDO

1. [INTRODUCCIÓN](#introducción)
2. [OBJETIVO](#objetivo)
   - General
   - Específicos
3. [DEFINICIÓN Y ESPECIFICACIONES](#definición-y-especificaciones)
   - Descripción del proyecto de software
   - Especificación de procedimientos de software
   - Herramientas utilizadas
4. [ARQUITECTURA DEL SISTEMA](#arquitectura-del-sistema)
   - Diagrama de módulos
   - Descripción individual de los módulos
5. [DISEÑO DE MODELO DE DATOS](#diseño-de-modelo-de-datos)
   - Tipo de dato de cada modelo
6. [DESCRIPCIÓN DE PROCESOS Y SERVICIOS OFRECIDOS POR EL SISTEMA](#descripción-de-procesos-y-servicios-ofrecidos-por-el-sistema)
7. [DOCUMENTACIÓN TÉCNICA](#documentación-técnica)
   - Back-end
   - Front-end
   - Instalación y despliegue

---

## INTRODUCCIÓN

El presente documento técnico tiene como objetivo proporcionar una visión exhaustiva y detallada del Sistema de Gestión de Diligencias Internacionales Inc., incluyendo las definiciones y especificaciones clave, la arquitectura del sistema, el diseño del modelo de datos, así como una descripción completa de los procesos y servicios ofrecidos. Además, se incluye la documentación completa del código fuente del software.

En la sección de definiciones y especificaciones, se ofrece una descripción completa del proyecto de software, destacando sus objetivos y funcionalidades principales. Además, se presentan las herramientas utilizadas durante el desarrollo, tanto a nivel de programación como de gestión de proyectos, proporcioniendo una visión general de las tecnologías empleadas y su relevancia en el contexto del sistema.

La arquitectura del sistema se presenta de manera detallada mediante un diagrama de módulos, que muestra la estructura general del sistema y las interacciones entre sus componentes. Cada módulo se describe de forma individual, destacando su función, responsabilidades y relaciones con otros módulos.

Este enfoque permite comprender cómo se organiza el sistema y cómo se distribuyen las tareas y la lógica del software. El diseño del modelo de datos es un aspecto crucial del sistema, y en este documento se proporciona una descripción exhaustiva de su estructura y relaciones.

Se presentan las entidades principales y sus atributos, así como las relaciones y restricciones que definen la integridad y consistencia de la información almacenada. Esta sección es fundamental para comprender cómo se almacena y gestiona la información dentro del sistema.

En cuanto a los procesos y servicios ofrecidos por el sistema, se ofrece una descripción detallada de cada uno de ellos, destacando su funcionalidad y los datos involucrados, además de pequeñas interacciones con otros módulos. Esta sección proporciona una visión global de las capacidades del sistema y cómo se llevan a cabo las tareas y operaciones fundamentales.

Se presenta en detalle la estructura del proyecto para ofrecer una vista completa general acerca del contenido de las carpetas y sus respectivas responsabilidades dentro del front-end y el back-end. Por último, se incluye una serie de pasos para la instalación del proyecto y su respectivo despliegue.

---

## OBJETIVO

### General

Documentar de manera integral y detallada el Sistema de Gestión de Diligencias Internacionales, describiendo sus definiciones y especificaciones, arquitectura, modelo de datos, procesos, servicios y su estructura, con el fin de facilitar su comprensión, análisis, mantenimiento y futura evolución por parte de desarrolladores, analistas y demás partes interesadas.

### Específicos

- Describir las definiciones y especificaciones del sistema, detallando sus objetivos, funcionalidades principales y el alcance del proyecto de software.
- Identificar y documentar las herramientas y tecnologías utilizadas durante el desarrollo del sistema, tanto a nivel de programación como de gestión de proyectos, explicando su propósito y relevancia dentro del contexto del sistema.
- Presentar la arquitectura del sistema mediante diagramas de módulos, explicando la estructura general, la organización de sus componentes y las interacciones entre los distintos módulos.
- Describir de manera individual cada módulo del sistema, especificando sus funciones, responsabilidades y relaciones con otros módulos para una mejor comprensión de la distribución de la lógica del software.
- Documentar el diseño del modelo de datos, detallando las entidades, atributos, que garantizan la integridad y consistencia de la información almacenada.
- Explicar los procesos y servicios ofrecidos por el sistema, describiendo su funcionamiento, los datos involucrados y su interacción con otros módulos.
- Explicar la estructura completa del proyecto, separando su explicación en las capas de front-end y back-end, con el objetivo de facilitar el entendimiento de la estructura interna y el funcionamiento del software.
- Proporcionar guías de instalación y configuración del proyecto para facilitar su despliegue en diferentes entornos.

---

## DEFINICIÓN Y ESPECIFICACIONES

### 1. Descripción del proyecto de software

El Sistema de Gestión de Diligencias Internacionales Inc. es una solución tecnológica integral diseñada para optimizar y automatizar la gestión de trámites y diligencias internacionales. El sistema proporciona una plataforma web completa que permite a la empresa administrar eficientemente todos los aspectos relacionados con los servicios de asesoría legal, trámites de pasaportes, visas y otros servicios internacionales.

A través de este sistema, se busca mejorar la eficiencia operativa, centralizar la información de clientes y trámites, facilitar el seguimiento de procesos, agilizar la gestión de pagos y documentos, asegurar la organización y disponibilidad de los datos, y minimizar errores en la administración de trámites internacionales.

El sistema facilita todos los procesos relacionados con la gestión de diligencias, desde la creación de solicitudes hasta la entrega de documentos finales, haciendo el flujo de trabajo más rápido, seguro y preciso. Elimina la necesidad de llevar registros manuales dispersos, contribuyendo a agilizar los procesos operativos, minimizando posibles errores y ayudando a facilitar decisiones informadas sobre la gestión de trámites.

**Funcionalidades principales:**
- Gestión integral de clientes y sus datos personales
- Administración de trámites y diligencias internacionales
- Control de grupos AMA (Abrazos y Más Abrazos)
- Seguimiento de pagos y estados financieros
- Gestión de documentos y archivos
- Panel de control con métricas y estadísticas
- Sistema de roles y permisos (Administrador, Empleado, Cliente)
- Sincronización con Google Sheets para importación de datos
- Gestión de catálogos (países, ciudades, aerolíneas, métodos de pago)
- Control de itinerarios y seguimiento de trámites

### 2. Especificación de procedimientos de software

#### A. Herramientas utilizadas

##### a. Lenguaje de programación

**Back-end:**
- **Node.js v20.x**: Entorno de ejecución de JavaScript del lado del servidor, elegido por su rendimiento, amplio ecosistema de paquetes y capacidad para manejar operaciones asíncronas eficientemente.
- **Express.js v4.18.2**: Framework web minimalista para Node.js que facilita la creación de APIs RESTful y el manejo de peticiones HTTP.

**Front-end:**
- **React v19.0.0**: Biblioteca de JavaScript para construir interfaces de usuario interactivas y componentes reutilizables.
- **React Router DOM v7.3.0**: Librería para el manejo de rutas y navegación en aplicaciones React de una sola página (SPA).
- **JavaScript (ES6+)**: Lenguaje de programación principal para el desarrollo del front-end.

##### b. Librerías y frameworks complementarios

**Back-end:**
- **Mongoose v7.5.0**: ODM (Object Data Modeling) para MongoDB que proporciona una solución basada en esquemas para modelar los datos de la aplicación.
- **bcryptjs v2.4.3**: Librería para el hash seguro de contraseñas.
- **jsonwebtoken v9.0.2**: Implementación de JSON Web Tokens para autenticación y autorización.
- **Multer v1.4.5**: Middleware para el manejo de formularios multipart/form-data, utilizado para la carga de archivos.
- **CORS v2.8.5**: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
- **dotenv v16.3.1**: Carga variables de entorno desde archivos .env.
- **express-validator v7.0.1**: Validación y sanitización de datos de entrada.
- **googleapis v118.0.0**: Cliente oficial de Google para integración con servicios de Google (Sheets).
- **node-cron v3.0.2**: Programador de tareas cron para Node.js.

**Front-end:**
- **Material-UI (MUI) v6.5.0**: Framework de componentes React que implementa Material Design de Google.
- **Axios v1.10.0**: Cliente HTTP basado en promesas para realizar peticiones al back-end.
- **React Hook Form v7.54.2**: Librería para el manejo eficiente de formularios en React.
- **Yup v1.6.1**: Validación de esquemas de objetos JavaScript.
- **Chart.js v4.4.8 / Recharts v3.1.0**: Librerías para visualización de datos y gráficos.
- **Framer Motion v12.5.0**: Librería para animaciones en React.
- **AOS (Animate On Scroll) v2.3.4**: Librería para animaciones al hacer scroll.
- **React Icons v5.5.0**: Colección de iconos populares como componentes React.
- **Styled Components v6.1.16**: Librería para escribir CSS en JavaScript.
- **jwt-decode v4.0.0**: Decodificación de tokens JWT en el cliente.
- **date-fns v4.1.0**: Librería moderna para manipulación de fechas en JavaScript.

##### c. Gestor de base de datos

- **MongoDB v8.2.3**: Base de datos NoSQL orientada a documentos, seleccionada por su flexibilidad, escalabilidad y capacidad para manejar datos no estructurados o semi-estructurados. MongoDB Atlas se utiliza como servicio en la nube para el alojamiento de la base de datos.

##### d. Entorno de programación (IDE)

- **Visual Studio Code v1.104.3**: Editor de código fuente ligero pero potente, utilizado para el desarrollo tanto del front-end como del back-end.
- **Navegador web con DevTools**: Herramientas de desarrollo del navegador para depuración y pruebas del front-end.

##### e. Control de versiones

- **Git**: Sistema de control de versiones distribuido.
- **GitHub/GitLab**: Plataforma para alojamiento y colaboración de repositorios Git.

##### f. Herramientas de documentación

- **Markdown**: Lenguaje de marcado ligero para documentación.
- **Microsoft Word**: Herramienta para documentación formal y técnica.
- **Postman**: Herramienta para pruebas y documentación de APIs.

##### g. Gestión de paquetes

- **npm (Node Package Manager)**: Gestor de paquetes para JavaScript, utilizado tanto en el back-end como en el front-end.

---

## ARQUITECTURA DEL SISTEMA

### 1. Diagrama de módulos

El sistema está estructurado en una arquitectura cliente-servidor de tres capas:

```
┌─────────────────────────────────────────────────────────────────┐
│                       CAPA DE PRESENTACIÓN                       │
│                        (React Front-end)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Módulo     │  │   Módulo     │  │   Módulo     │          │
│  │ Autenticación│  │   Cliente    │  │  Empleado    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Módulo     │  │   Módulo     │  │   Módulo     │          │
│  │   Trámites   │  │  Documentos  │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Módulo     │  │   Módulo     │  │   Módulo     │          │
│  │    Pagos     │  │  Catálogos   │  │  Grupos AMA  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS (REST API)
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      CAPA DE LÓGICA DE NEGOCIO                   │
│                       (Express.js API)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Controladores│  │  Middleware  │  │    Rutas     │          │
│  │              │  │              │  │              │          │
│  │ - Auth       │  │ - Auth       │  │ - /api/auth  │          │
│  │ - Clientes   │  │ - Upload     │  │ - /api/      │          │
│  │ - Dashboard  │  │ - Validator  │  │   clientes   │          │
│  │              │  │              │  │ - /api/      │          │
│  │              │  │              │  │   dashboard  │          │
│  │              │  │              │  │ - /api/sync  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │   Servicios  │  │   Modelos    │                             │
│  │              │  │              │                             │
│  │ - Sync       │  │ - User       │                             │
│  │   Sheets     │  │ - Diligencia │                             │
│  │              │  │ - Documento  │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      CAPA DE DATOS                               │
│                     (MongoDB Atlas)                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐       │
│  │              Colecciones                              │       │
│  │                                                       │       │
│  │  • users           • contacto                        │       │
│  │  • diligencias     • historial_tramites              │       │
│  │  • documentos      • informes                        │       │
│  │  • catalogo_paises • telefonos_recepcion            │       │
│  │  • tramites        • y más...                        │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRACIONES EXTERNAS                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                             │
│  │    Google    │  │   Sistema    │                             │
│  │    Sheets    │  │   de Archivos│                             │
│  │     API      │  │   (uploads/) │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Descripción individual de los módulos

#### A. Módulo de Autenticación

**Propósito:** Gestionar el acceso seguro al sistema mediante autenticación y autorización de usuarios.

**Responsabilidades:**
- Registro de nuevos usuarios (administrador)
- Inicio de sesión con email y contraseña
- Generación y validación de tokens JWT
- Protección de rutas mediante middleware de autenticación
- Gestión de sesiones de usuario
- Cierre de sesión

**Tecnologías:**
- JWT (JSON Web Tokens) para autenticación stateless
- bcryptjs para hash de contraseñas
- Middleware de autenticación personalizado

**Endpoints principales:**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado

#### B. Módulo de Cliente

**Propósito:** Gestionar toda la información relacionada con los clientes de la empresa.

**Responsabilidades:**
- Crear nuevos registros de clientes
- Consultar información de clientes
- Actualizar datos de clientes existentes
- Eliminar (baja lógica) registros de clientes
- Búsqueda y filtrado de clientes
- Visualización de detalles completos del cliente
- Asociación de clientes con trámites

**Entidades relacionadas:**
- Cliente (contacto)
- País
- Ciudad
- Trámites asociados

**Endpoints principales:**
- `GET /api/clientes` - Listar todos los clientes
- `GET /api/clientes/:id` - Obtener detalles de un cliente
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

#### C. Módulo de Empleado

**Propósito:** Proporcionar interfaz y funcionalidades específicas para el personal de la empresa.

**Responsabilidades:**
- Dashboard con métricas y estadísticas
- Gestión de todos los trámites activos
- Asignación de responsables a trámites
- Control de grupos AMA
- Gestión de catálogos del sistema
- Administración de roles y permisos
- Visualización de reportes y análisis

**Componentes principales:**
- Home (Dashboard principal)
- Gestión de clientes
- Gestión de trámites
- Gestión de pagos
- Gestión de documentos
- Configuración de catálogos
- Asignación de roles

#### D. Módulo de Trámites

**Propósito:** Administrar el ciclo de vida completo de los trámites y diligencias internacionales.

**Responsabilidades:**
- Crear nuevas solicitudes de trámites
- Actualizar estado de trámites (pendiente, en proceso, completado, cancelado)
- Asociar clientes con trámites
- Registrar seguimiento y observaciones
- Gestión de fechas (inicio, vencimiento, entrega)
- Asignación de responsables
- Control de grupos de trámites (Grupos AMA)
- Gestión de itinerarios

**Estados de trámite:**
- Pendiente
- En proceso
- Completado
- Cancelado

**Entidades relacionadas:**
- Trámite (historial_tramites)
- Cliente
- Empleado (responsable)
- Documentos
- Pagos
- Seguimientos

#### E. Módulo de Documentos

**Propósito:** Gestionar la carga, almacenamiento y descarga de documentos relacionados con los trámites.

**Responsabilidades:**
- Carga de archivos mediante Multer
- Almacenamiento seguro en el servidor
- Asociación de documentos con trámites específicos
- Validación de tipos de archivo permitidos
- Control de tamaño máximo de archivos
- Descarga de documentos
- Eliminación de documentos

**Tecnologías:**
- Multer para manejo de multipart/form-data
- Sistema de archivos del servidor (uploads/)
- Validación de tipos MIME

**Metadatos almacenados:**
- Nombre original del archivo
- Nombre generado en el servidor
- Ruta de almacenamiento
- Tamaño del archivo
- Tipo MIME
- Fecha de carga
- Usuario que cargó el documento

#### F. Módulo de Dashboard

**Propósito:** Proporcionar visualización de métricas, estadísticas y KPIs del sistema.

**Responsabilidades:**
- Mostrar grupos AMA activos
- Estadísticas de trámites por tipo
- Distribución de clientes por país
- Gráficos y visualizaciones interactivas
- Reportes en tiempo real

**Endpoints principales:**
- `GET /api/dashboard/grupos-ama-activos` - Grupos AMA activos
- `GET /api/dashboard/tramites-activos` - Estadísticas de trámites
- `GET /api/dashboard/clientes-por-pais` - Distribución de clientes

**Visualizaciones:**
- Gráficos de barras para trámites activos
- Gráficos de barras horizontales para clientes por país
- Tarjetas de información para grupos AMA
- Métricas numéricas clave

#### G. Módulo de Pagos

**Propósito:** Gestionar los pagos relacionados con los trámites y servicios.

**Responsabilidades:**
- Registro de pagos recibidos
- Control de pagos pendientes
- Asociación de pagos con trámites
- Gestión de métodos de pago
- Seguimiento de cobros
- Generación de reportes de pagos

**Entidades relacionadas:**
- Pago
- Trámite
- Cliente
- Método de pago

#### H. Módulo de Catálogos

**Propósito:** Administrar los catálogos y datos maestros del sistema.

**Responsabilidades:**
- Gestión de países
- Gestión de ciudades
- Gestión de aerolíneas
- Gestión de métodos de pago
- Gestión de roles de usuario
- Gestión de áreas
- Gestión de tipos de trámite
- Configuración de antecedentes

**Catálogos principales:**
- Catálogo de países
- Catálogo de ciudades
- Catálogo de aerolíneas
- Catálogo de métodos de pago
- Catálogo de roles
- Catálogo de áreas
- Catálogo de tipos de trámite

#### I. Módulo de Grupos AMA (Abrazos y Más Abrazos)

**Propósito:** Gestionar grupos de clientes que realizan trámites colectivos.

**Responsabilidades:**
- Creación de grupos AMA
- Asignación de clientes a grupos
- Control de fechas de inicio y finalización
- Seguimiento de estado del grupo
- Gestión de información del grupo (ciudad destino, cantidad de participantes)
- Visualización de detalles del grupo

**Entidades relacionadas:**
- Grupo AMA (trámite de tipo AMA)
- Clientes del grupo
- Ciudad destino
- Fechas de viaje

#### J. Módulo de Sincronización

**Propósito:** Integrar datos desde fuentes externas hacia el sistema.

**Responsabilidades:**
- Conexión con Google Sheets API
- Importación de datos desde hojas de cálculo
- Sincronización de catálogos
- Actualización periódica mediante cron jobs
- Transformación y validación de datos importados

**Tecnologías:**
- googleapis (Google Sheets API)
- node-cron para tareas programadas

**Endpoints principales:**
- `POST /api/sync/sheets` - Sincronizar datos desde Google Sheets
- `GET /api/sync/status` - Estado de la última sincronización

---

## DISEÑO DE MODELO DE DATOS

El sistema utiliza MongoDB como base de datos NoSQL orientada a documentos. La base de datos se encuentra alojada en MongoDB Atlas y contiene múltiples colecciones que representan las diferentes entidades del sistema.

### Diagrama Entidad-Relación Conceptual

```
┌────────────────┐           ┌────────────────┐
│     User       │           │   Contacto     │
│                │           │   (Cliente)    │
├────────────────┤           ├────────────────┤
│ _id            │           │ id_contacto    │
│ email *        │           │ nombre_contacto│
│ password *     │           │ numero_contacto│
│ name *         │           │ email          │
│ role           │           │ numero_emerg   │
│ isActive       │           │ cobro          │
│ createdAt      │           │ ...            │
│ updatedAt      │           └────────────────┘
└────────────────┘                    │
                                      │
                                      │ 1:N
                                      ▼
┌────────────────┐           ┌────────────────┐
│  Diligencia    │───────────│   Documento    │
│                │    1:N    │                │
├────────────────┤           ├────────────────┤
│ _id            │           │ _id            │
│ userId *       │◄──────┐   │ diligenciaId * │
│ titulo *       │       │   │ nombre *       │
│ descripcion *  │       │   │ nombreArchivo *│
│ status         │       │   │ ruta *         │
│ fechaCreacion  │       │   │ tamaño *       │
│ fechaVencim    │       │   │ tipoMime *     │
│ documentos[]   │       │   │ createdAt      │
│ createdAt      │       │   │ updatedAt      │
│ updatedAt      │       │   └────────────────┘
└────────────────┘       │
                         │ referencia
                         │
                    ┌────┴───────┐
                    │            │

┌────────────────┐           ┌────────────────┐
│ Catalogo_Paises│           │Historial_Tramit│
│                │           │                │
├────────────────┤           ├────────────────┤
│ id_pais        │           │ idtramite      │
│ pais *         │           │ tipotramite    │
└────────────────┘           │ fecha_inicio   │
                             │ fecha_entrega  │
                             │ responsable    │
┌────────────────┐           │ status         │
│   Tramites     │           │ observaciones  │
│                │           │ ...            │
├────────────────┤           └────────────────┘
│ idtramite      │
│ tramite *      │
│ grupo          │           ┌────────────────┐
└────────────────┘           │   Informes     │
                             │                │
                             ├────────────────┤
┌────────────────┐           │ informe        │
│ Telefonos_Rec  │           │ tipo_informe   │
│                │           │ ...            │
├────────────────┤           └────────────────┘
│ telefono       │
│ area *         │
└────────────────┘
```

### Tipo de dato de cada modelo

#### A. Modelo User (Usuario)

Almacena la información de los usuarios del sistema con diferentes roles.

```javascript
{
  _id: ObjectId,              // ID único generado por MongoDB
  email: String,              // Correo electrónico único (requerido)
  password: String,           // Contraseña hasheada con bcrypt (requerido)
  name: String,               // Nombre completo del usuario (requerido)
  role: String,               // Rol: 'admin' | 'user' (default: 'user')
  isActive: Boolean,          // Estado activo/inactivo (default: true)
  createdAt: Date,            // Fecha de creación (automático)
  updatedAt: Date             // Fecha de última actualización (automático)
}
```

**Características especiales:**
- El campo `email` tiene índice único
- La contraseña se hashea automáticamente antes de guardar usando bcrypt
- Método `comparePassword()` para validación de contraseña
- Timestamps automáticos (createdAt, updatedAt)

**Índices:**
- `email`: único, obligatorio

#### B. Modelo Diligencia

Representa las diligencias o trámites gestionados en el sistema.

```javascript
{
  _id: ObjectId,              // ID único generado por MongoDB
  userId: ObjectId,           // Referencia al usuario (requerido)
  titulo: String,             // Título de la diligencia (requerido)
  descripcion: String,        // Descripción detallada (requerido)
  status: String,             // Estado: 'pendiente' | 'en_proceso' | 
                              //        'completada' | 'cancelada'
                              // (default: 'pendiente')
  fechaCreacion: Date,        // Fecha de creación (default: Date.now)
  fechaVencimiento: Date,     // Fecha límite de vencimiento
  documentos: [ObjectId],     // Array de referencias a documentos
  createdAt: Date,            // Timestamp de creación (automático)
  updatedAt: Date             // Timestamp de actualización (automático)
}
```

**Relaciones:**
- `userId`: Relación N:1 con User (muchas diligencias pertenecen a un usuario)
- `documentos`: Relación 1:N con Documento (una diligencia tiene muchos documentos)

**Estados posibles:**
1. **pendiente**: Diligencia creada pero no iniciada
2. **en_proceso**: Diligencia en desarrollo
3. **completada**: Diligencia finalizada exitosamente
4. **cancelada**: Diligencia cancelada

#### C. Modelo Documento

Almacena los metadatos de los archivos cargados al sistema.

```javascript
{
  _id: ObjectId,              // ID único generado por MongoDB
  diligenciaId: ObjectId,     // Referencia a la diligencia (requerido)
  nombre: String,             // Nombre descriptivo del documento (requerido)
  nombreArchivo: String,      // Nombre del archivo en el servidor (requerido)
  ruta: String,               // Ruta completa del archivo (requerido)
  tamaño: Number,             // Tamaño del archivo en bytes (requerido)
  tipoMime: String,           // Tipo MIME del archivo (requerido)
  createdAt: Date,            // Timestamp de creación (automático)
  updatedAt: Date             // Timestamp de actualización (automático)
}
```

**Relaciones:**
- `diligenciaId`: Relación N:1 con Diligencia (muchos documentos pertenecen a una diligencia)

**Tipos MIME permitidos comunes:**
- application/pdf
- image/jpeg
- image/png
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

#### D. Colección Contacto (Cliente)

Almacena información de los clientes de la empresa. Esta colección utiliza un esquema flexible sin strict mode.

```javascript
{
  _id: ObjectId,                    // ID único generado por MongoDB
  id_contacto: Number,              // ID del contacto (opcional)
  nombre_contacto: String,          // Nombre completo del cliente
  numero_contacto: String,          // Teléfono principal
  email: String,                    // Correo electrónico
  numero_emergencia: String,        // Teléfono de emergencia
  cobro: Mixed,                     // Información de cobro
  // Campos adicionales según necesidad
}
```

**Nota:** Esta colección tiene `strict: false`, permitiendo campos dinámicos no definidos en el esquema.

#### E. Colección Catalogo_Paises

Catálogo de países disponibles en el sistema.

```javascript
{
  _id: ObjectId,                    // ID único generado por MongoDB
  id_pais: Number,                  // Identificador del país
  pais: String                      // Nombre del país
}
```

#### F. Colección Historial_Tramites

Registra el historial completo de trámites realizados.

```javascript
{
  _id: ObjectId,                    // ID único generado por MongoDB
  idtramite: Number,                // ID del trámite
  tipotramite: String,              // Tipo de trámite
  fecha_inicio: Date,               // Fecha de inicio del trámite
  fecha_entrega: Date,              // Fecha de entrega estimada/real
  responsable: String,              // Empleado responsable
  status: String,                   // Estado del trámite
  observaciones: String,            // Observaciones y notas
  totalclientes: Number,            // Cantidad de clientes en el trámite
  // Campos adicionales dinámicos
}
```

**Tipos de trámite comunes:**
- Pasaporte
- Visa
- Asesoría Legal
- Grupo AMA (Abrazos y Más Abrazos)
- Otros servicios

#### G. Colección Tramites

Catálogo de tipos de trámites disponibles.

```javascript
{
  _id: ObjectId,                    // ID único generado por MongoDB
  idtramite: Number,                // ID del tipo de trámite
  tramite: String,                  // Nombre del trámite
  grupo: Boolean                    // Indica si es trámite grupal
}
```

#### H. Colección Informes

Almacena informes y reportes del sistema.

```javascript
{
  _id: ObjectId,                    // ID único generado por MongoDB
  informe: String,                  // Contenido del informe
  tipo_informe: String,             // Tipo/categoría del informe
  fecha: Date,                      // Fecha del informe
  // Campos adicionales según tipo de informe
}
```

#### I. Colección Telefonos_Recepcion

Catálogo de teléfonos de recepción por área.

```javascript
{
  _id: ObjectId,                    // ID único generado por MongoDB
  telefono: String,                 // Número telefónico
  area: String                      // Área o departamento
}
```

### Relaciones entre modelos

1. **User ↔ Diligencia (1:N)**
   - Un usuario puede tener múltiples diligencias
   - Una diligencia pertenece a un solo usuario
   - Campo relacional: `Diligencia.userId` → `User._id`

2. **Diligencia ↔ Documento (1:N)**
   - Una diligencia puede tener múltiples documentos
   - Un documento pertenece a una sola diligencia
   - Campo relacional: `Documento.diligenciaId` → `Diligencia._id`
   - Adicionalmente: `Diligencia.documentos[]` contiene array de referencias

3. **Contacto ↔ Historial_Tramites (1:N)**
   - Un cliente puede tener múltiples trámites
   - Un trámite puede involucrar múltiples clientes (especialmente en grupos AMA)

### Índices y optimización

**Índices recomendados:**
- `User.email`: Único, para autenticación rápida
- `Diligencia.userId`: Para consultas de diligencias por usuario
- `Diligencia.status`: Para filtros por estado
- `Documento.diligenciaId`: Para consultas de documentos por diligencia
- `Historial_Tramites.idtramite`: Para búsquedas rápidas
- `Historial_Tramites.status`: Para filtros de estado
- `Contacto.id_contacto`: Para búsquedas de clientes

---

## DESCRIPCIÓN DE PROCESOS Y SERVICIOS OFRECIDOS POR EL SISTEMA

El sistema está diseñado con una arquitectura RESTful donde el front-end React se comunica con el back-end Express.js mediante peticiones HTTP. Cada módulo ofrece servicios específicos que se exponen a través de endpoints de la API.

### Procesos del módulo de Autenticación

#### a. Registro de usuario

Este servicio permite crear nuevas cuentas de usuario en el sistema.

**Datos de entrada:**
- `email` (String): Correo electrónico único del usuario
- `password` (String): Contraseña (mínimo 6 caracteres)
- `name` (String): Nombre completo del usuario
- `role` (String, opcional): Rol del usuario ('admin' o 'user', default: 'user')

**Proceso:**
```
1. Usuario administrador accede al formulario de registro
2. Se valida el formato del email y longitud de contraseña en el front-end
3. Se envía petición POST a /api/auth/register
4. El back-end valida los datos con express-validator
5. Se verifica que el email no exista en la base de datos
6. Se hashea la contraseña con bcryptjs
7. Se crea el documento de usuario en MongoDB
8. Se retorna confirmación de creación
```

**Pseudocódigo:**
```
Función RegistrarUsuario(email, password, name, role)
Inicio
    Validar formato de email en front-end
    Validar longitud mínima de contraseña (6 caracteres)
    
    Enviar petición POST a /api/auth/register con datos
    
    En el servidor:
        Validar datos de entrada con express-validator
        Buscar si existe usuario con ese email
        Si existe:
            Retornar error "Email ya registrado"
        Si no existe:
            Generar salt con bcrypt
            Hashear contraseña con salt
            Crear documento User con datos
            Guardar en MongoDB
            Retornar éxito con datos del usuario (sin password)
    
    En el front-end:
        Si respuesta exitosa:
            Mostrar mensaje de confirmación
            Cerrar modal de registro
        Si error:
            Mostrar mensaje de error
Fin
```

**Respuesta exitosa:**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "user",
    "isActive": true
  }
}
```

#### b. Inicio de sesión

Este servicio autentica al usuario y genera un token JWT para acceso al sistema.

**Datos de entrada:**
- `email` (String): Correo electrónico del usuario
- `password` (String): Contraseña del usuario

**Proceso:**
```
1. Usuario ingresa credenciales en formulario de login
2. Se valida presencia de datos en el front-end
3. Se envía petición POST a /api/auth/login
4. El back-end busca el usuario por email
5. Se compara la contraseña con el hash almacenado
6. Si es correcta, se genera token JWT
7. Se retorna token y datos del usuario
8. El front-end almacena el token en localStorage
9. Se redirige al usuario según su rol
```

**Pseudocódigo:**
```
Función IniciarSesión(email, password)
Inicio
    Validar que email y password no estén vacíos
    
    Enviar petición POST a /api/auth/login con credenciales
    
    En el servidor:
        Buscar usuario por email en MongoDB
        Si no existe:
            Retornar error 401 "Credenciales inválidas"
        
        Comparar password con hash usando comparePassword()
        Si no coincide:
            Retornar error 401 "Credenciales inválidas"
        
        Si usuario no está activo:
            Retornar error 403 "Usuario inactivo"
        
        Crear payload JWT con { userId, email, role }
        Firmar token JWT con JWT_SECRET
        Configurar expiración del token (ej: 7 días)
        
        Retornar token y datos del usuario
    
    En el front-end:
        Guardar token en localStorage
        Guardar datos del usuario en contexto/estado
        Redirigir según rol:
            Si admin/user → Dashboard empleado
            Si cliente → Portal cliente
Fin
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

#### c. Validación de token

Middleware que valida el token JWT en cada petición protegida.

**Proceso:**
```
1. Front-end envía token en header Authorization: Bearer <token>
2. Middleware extrae el token del header
3. Se verifica y decodifica el token con JWT_SECRET
4. Si es válido, se adjunta el usuario a req.user
5. La petición continúa al controlador
6. Si es inválido o expiró, se retorna error 401
```

### Procesos del módulo de Clientes

#### a. Listar clientes

Este servicio recupera la lista de todos los clientes registrados.

**Datos de entrada:**
- Token JWT (en header Authorization)

**Proceso:**
```
1. Usuario accede a la sección de clientes
2. Componente React llama a cargarClientes()
3. Se envía petición GET a /api/clientes con token
4. Middleware valida el token
5. Back-end consulta colección contacto en MongoDB
6. Se limita a 200 registros para optimizar
7. Se formatea la respuesta
8. Front-end recibe y muestra los datos
```

**Pseudocódigo:**
```
Función ListarClientes()
Inicio
    Obtener token de localStorage
    Configurar headers con Authorization: Bearer <token>
    
    Enviar petición GET a /api/clientes
    
    En el servidor:
        Middleware authenticateToken valida el token
        Si token inválido:
            Retornar error 401 "No autorizado"
        
        Obtener modelo Contacto de MongoDB
        Consultar todos los documentos con find({})
        Limitar a 200 registros
        Convertir a objetos planos con lean()
        
        Formatear datos:
            Para cada cliente c:
                Mapear campos:
                    idCliente ← id_contacto
                    nombreCliente ← nombre_contacto
                    telefono ← numero_contacto
                    email ← email
                    numero_emergencia ← numero_emergencia
                    cobro ← cobro
        
        Retornar array de clientes formateados
    
    En el front-end:
        Recibir array de clientes
        Formatear teléfonos (###-###-####)
        Actualizar estado con clientes
        Actualizar clientesFiltrados con clientes
        Renderizar tabla/tarjetas de clientes
Fin
```

**Respuesta:**
```json
[
  {
    "idCliente": 1,
    "nombreCliente": "Juan Pérez García",
    "apellidoPaternoCliente": "",
    "apellidoMaternoCliente": "",
    "telefono": "5551234567",
    "identificacionunicanacional": "",
    "email": "juan@ejemplo.com",
    "numero_emergencia": "5559876543",
    "cobro": "Contado"
  },
  // ... más clientes
]
```

#### b. Buscar y filtrar clientes

Este servicio permite buscar clientes por diferentes criterios.

**Datos de entrada:**
- `terminoBusqueda` (String): Término a buscar

**Proceso:**
```
1. Usuario escribe en el campo de búsqueda
2. Se activa el hook useEffect al cambiar terminoBusqueda
3. Se ejecuta filtro local en el array de clientes
4. Se busca en: nombre, apellidos, identificación, teléfono
5. Se actualiza clientesFiltrados con resultados
6. Se re-renderiza la tabla con datos filtrados
```

**Pseudocódigo:**
```
Función FiltrarClientes(terminoBusqueda, clientes)
Inicio
    Si terminoBusqueda está vacío:
        Retornar todos los clientes
    
    Convertir terminoBusqueda a minúsculas
    
    Crear array filtrados vacío
    
    Para cada cliente en clientes:
        Crear array de campos a buscar:
            - nombreCliente
            - apellidoPaternoCliente
            - apellidoMaternoCliente
            - identificacionunicanacional
            - telefono
        
        Convertir cada campo a minúsculas
        
        Si algún campo incluye terminoBusqueda:
            Agregar cliente a filtrados
    
    Retornar array filtrados
    Actualizar estado clientesFiltrados
Fin
```

#### c. Ver detalles de cliente

Este servicio muestra toda la información de un cliente específico.

**Datos de entrada:**
- `idCliente` (Number): ID del cliente a consultar

**Proceso:**
```
1. Usuario hace clic en botón "Ver" de un cliente
2. Se abre modal VerClienteModal
3. Se busca el cliente en el estado local por idCliente
4. Se muestran todos los campos del cliente en el modal
5. Usuario puede cerrar el modal
```

### Procesos del módulo de Dashboard

#### a. Obtener grupos AMA activos

Este servicio recupera los grupos AMA (Abrazos y Más Abrazos) que están actualmente activos.

**Datos de entrada:**
- Token JWT (en header Authorization)

**Proceso:**
```
1. Usuario accede al dashboard de empleado
2. Se ejecuta useEffect al montar el componente
3. Se envía petición GET a /api/dashboard/grupos-ama-activos
4. Back-end consulta historial_tramites filtrando por tipotramite AMA
5. Se filtran solo los grupos activos
6. Se retornan los datos con información del grupo
7. Front-end renderiza tarjetas con la información
```

**Pseudocódigo:**
```
Función ObtenerGruposAMAActivos()
Inicio
    Obtener token de localStorage
    Configurar headers con Authorization
    
    Enviar petición GET a /api/dashboard/grupos-ama-activos
    
    En el servidor:
        Validar token con middleware
        Obtener modelo HistorialTramites
        
        Consultar documentos donde:
            tipotramite = "AMA" o similar
            status != "completado" y != "cancelado"
        
        Ordenar por fecha_inicio descendente
        Limitar a grupos recientes
        
        Para cada grupo, incluir:
            - idtramite
            - tipotramite
            - fecha_inicio
            - fecha_entrega
            - totalclientes
            - status
        
        Retornar array de grupos
    
    En el front-end:
        Actualizar estado gruposAMAData
        Renderizar tarjetas:
            Mostrar tipo de trámite
            Formatear fecha de inicio
            Mostrar total de clientes
            Configurar navegación al hacer clic
Fin
```

**Respuesta:**
```json
[
  {
    "idtramite": 1001,
    "tipotramite": "Grupo AMA - Cancún",
    "fecha_inicio": "2026-02-01T00:00:00.000Z",
    "fecha_entrega": "2026-02-15T00:00:00.000Z",
    "totalclientes": 25,
    "status": "en_proceso"
  },
  // ... más grupos
]
```

#### b. Obtener estadísticas de trámites activos

Este servicio genera estadísticas agregadas de trámites por tipo.

**Datos de entrada:**
- Token JWT (en header Authorization)

**Proceso:**
```
1. Se envía petición GET a /api/dashboard/tramites-activos
2. Back-end realiza agregación en MongoDB
3. Se agrupa por tipo de trámite
4. Se cuenta la cantidad de cada tipo activo
5. Se retornan datos formateados para gráficos
6. Front-end renderiza gráfico de barras con Recharts
```

**Pseudocódigo:**
```
Función ObtenerTramitesActivos()
Inicio
    En el servidor:
        Obtener modelo HistorialTramites
        
        Ejecutar agregación:
            $match: {
                status: { $in: ["pendiente", "en_proceso"] }
            }
            $group: {
                _id: "$tipotramite",
                total: { $sum: 1 }
            }
            $project: {
                tipotramite: "$_id",
                total: 1,
                _id: 0
            }
            $sort: { total: -1 }
        
        Retornar resultado de agregación
    
    En el front-end:
        Recibir datos agregados
        Actualizar estado tramitesActivosData
        Renderizar BarChart:
            XAxis: tipotramite
            YAxis: total (sin decimales)
            Bar: color #2c3e50
Fin
```

**Respuesta:**
```json
[
  {
    "tipotramite": "Pasaporte",
    "total": 45
  },
  {
    "tipotramite": "Visa",
    "total": 32
  },
  {
    "tipotramite": "Grupo AMA",
    "total": 15
  }
]
```

#### c. Obtener distribución de clientes por país

Este servicio muestra la cantidad de clientes agrupados por país.

**Datos de entrada:**
- Token JWT (en header Authorization)

**Proceso:**
```
1. Se envía petición GET a /api/dashboard/clientes-por-pais
2. Back-end realiza consulta con join o lookup
3. Se agrupa por país y se cuenta
4. Se ordenan por cantidad descendente
5. Front-end renderiza gráfico de barras horizontal
```

**Pseudocódigo:**
```
Función ObtenerClientesPorPais()
Inicio
    En el servidor:
        Obtener modelo Contacto o relación con países
        
        Ejecutar agregación o join:
            Agrupar por país
            Contar clientes por grupo
            Ordenar por cantidad descendente
        
        Formatear resultado:
            Para cada grupo:
                nombrepais: nombre del país
                total: cantidad de clientes
        
        Retornar array de países con totales
    
    En el front-end:
        Recibir datos
        Actualizar estado clientesPaisData
        Renderizar BarChart horizontal:
            Layout: "vertical"
            XAxis: tipo number (total)
            YAxis: tipo category (nombrepais)
            Bar: color #8884d8
Fin
```

### Procesos del módulo de Trámites

#### a. Crear nuevo trámite

Este servicio permite registrar un nuevo trámite en el sistema.

**Datos de entrada:**
- Información del trámite (tipo, cliente, fechas, etc.)

**Proceso:**
```
1. Usuario accede a formulario de nuevo trámite
2. Selecciona tipo de trámite del catálogo
3. Asocia uno o más clientes
4. Ingresa fechas estimadas
5. Añade observaciones
6. Se valida el formulario
7. Se envía petición POST a /api/tramites
8. Back-end crea el registro en historial_tramites
9. Se retorna confirmación
```

#### b. Actualizar estado de trámite

Este servicio permite cambiar el estado y añadir seguimiento a un trámite.

**Datos de entrada:**
- `idtramite` (Number): ID del trámite
- `nuevoEstado` (String): Estado actualizado
- `observaciones` (String): Notas del seguimiento

**Proceso:**
```
1. Usuario accede a detalles del trámite
2. Selecciona nuevo estado del dropdown
3. Ingresa observaciones en textarea
4. Confirma la actualización
5. Se envía petición PUT a /api/tramites/:id
6. Back-end actualiza el documento
7. Se registra el cambio con timestamp
8. Front-end actualiza la vista
```

### Procesos del módulo de Documentos

#### a. Cargar documento

Este servicio permite subir archivos asociados a un trámite.

**Datos de entrada:**
- `archivo` (File): Archivo a subir
- `diligenciaId` (ObjectId): ID de la diligencia asociada
- `nombre` (String): Nombre descriptivo del documento

**Proceso:**
```
1. Usuario selecciona archivo con input type="file"
2. Se valida tipo y tamaño del archivo
3. Se crea FormData con el archivo y datos
4. Se envía petición POST multipart/form-data
5. Multer procesa el archivo en el servidor
6. Se genera nombre único para el archivo
7. Se guarda en carpeta uploads/documentos/
8. Se crea documento en MongoDB con metadatos
9. Se asocia con la diligencia
10. Se retorna confirmación y datos del documento
```

**Pseudocódigo:**
```
Función SubirDocumento(archivo, diligenciaId, nombre)
Inicio
    Validar que archivo no esté vacío
    Validar tipo MIME permitido
    Validar tamaño máximo (ej: 10MB)
    
    Crear FormData:
        Agregar archivo
        Agregar diligenciaId
        Agregar nombre
    
    Enviar petición POST a /api/documentos con FormData
    
    En el servidor:
        Middleware multer.single('archivo') procesa el archivo
        
        Extraer información del archivo:
            - originalname
            - filename (generado)
            - path
            - size
            - mimetype
        
        Crear documento Documento:
            diligenciaId: diligenciaId del body
            nombre: nombre del body
            nombreArchivo: filename generado
            ruta: path completo
            tamaño: size en bytes
            tipoMime: mimetype
        
        Guardar documento en MongoDB
        
        Actualizar diligencia:
            Agregar _id del documento al array documentos[]
        
        Retornar éxito con datos del documento
    
    En el front-end:
        Mostrar mensaje de éxito
        Actualizar lista de documentos
        Limpiar formulario
Fin
```

### Procesos del módulo de Sincronización

#### a. Sincronizar datos desde Google Sheets

Este servicio importa datos desde hojas de cálculo de Google Sheets.

**Datos de entrada:**
- Credenciales de Google API (en variables de entorno)
- IDs de las hojas a sincronizar

**Proceso:**
```
1. Tarea cron se ejecuta automáticamente (ej: diario a las 2:00 AM)
2. Se conecta a Google Sheets API con credenciales
3. Se leen las hojas configuradas
4. Para cada hoja:
   a. Se obtienen los datos
   b. Se validan y transforman
   c. Se actualizan o insertan en MongoDB
5. Se registra el resultado de la sincronización
6. Se notifica si hay errores
```

**Pseudocódigo:**
```
Función SincronizarGoogleSheets()
Inicio
    Autenticar con Google Sheets API usando credenciales
    
    Para cada hoja configurada (países, trámites, etc.):
        Obtener spreadsheetId y range de la hoja
        
        Llamar a sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        })
        
        Extraer rows de la respuesta
        
        Si rows está vacío:
            Continuar con siguiente hoja
        
        Parsear headers de la primera fila
        
        Para cada fila de datos (desde índice 1):
            Crear objeto mapeando headers con valores
            
            Buscar si existe documento con ese ID
            
            Si existe:
                Actualizar documento con nuevos valores
            Si no existe:
                Crear nuevo documento
        
        Registrar cantidad de registros procesados
    
    Actualizar timestamp de última sincronización
    Guardar log de la sincronización
    
    Si hubo errores:
        Enviar notificación al administrador
Fin
```

---

## DOCUMENTACIÓN TÉCNICA

### Back-end

#### Estructura del proyecto

El back-end está organizado en una estructura modular que separa responsabilidades:

```
backend-mongo/
│
├── .env                                      # Variables de entorno (no versionado)
├── .env.example                              # Plantilla de variables de entorno
├── .gitignore                                # Archivos ignorados por Git
├── package.json                              # Dependencias y scripts del proyecto
├── package-lock.json                         # Lock de versiones de dependencias
├── README.md                                 # Documentación del backend
├── server.js                                 # Punto de entrada de la aplicación
├── create-admin.js                           # Script para crear usuario admin
├── import-csvs.js                            # Script para importar datos de CSVs
│
├───data/                                     # Datos de importación (CSVs de ejemplo)
│   ├── diligencias_ejemplo.csv
│   ├── usuarios_ejemplo.csv
│   ├── INFORMES Y PAGOS - CONTACTO.csv
│   ├── INFORMES Y PAGOS - HISTORIAL DE TRAMITES.csv
│   ├── INFORMES Y PAGOS - INFORMES (2).csv
│   ├── INFORMES Y PAGOS - PAISES.csv
│   ├── INFORMES Y PAGOS - TELEFONOS DE RECEPCION.csv
│   └── INFORMES Y PAGOS - TRAMITES.csv
│
├───scripts/                                  # Scripts auxiliares y utilidades
│
├───uploads/                                  # Archivos cargados por usuarios
│   └───documentos/                          # Documentos de trámites
│
└───src/                                      # Código fuente principal
    │
    ├───config/                              # Configuraciones del sistema
    │   ├── database.js                      # Configuración de conexión a MongoDB
    │   └── env.js                           # Variables de entorno validadas
    │
    ├───controllers/                         # Controladores (Lógica de negocio)
    │   └── authController.js               # Controlador de autenticación y usuarios
    │
    ├───middleware/                          # Middlewares personalizados
    │   └── auth.js                          # Middleware de autenticación JWT
    │
    ├───models/                              # Modelos de datos (Mongoose Schemas)
    │   ├── user.js                          # Modelo de Usuario
    │   ├── Diligencia.js                    # Modelo de Diligencia/Trámite
    │   └── documento.js                     # Modelo de Documento
    │
    ├───routes/                              # Definición de rutas de la API
    │   ├── auth.js                          # Rutas de autenticación
    │   ├── clientes.js                      # Rutas de gestión de clientes
    │   ├── dashboard.js                     # Rutas de métricas y dashboard
    │   └── sync.js                          # Rutas de sincronización con Sheets
    │
    ├───services/                            # Servicios auxiliares y lógica compartida
    │   └── syncSheets.js                    # Servicio de sincronización con Google Sheets
    │
    └───utils/                               # Utilidades y funciones auxiliares
```

**Estructura detallada de archivos clave:**

```
backend-mongo/
│
├── server.js                                # 58 líneas
│   ├── Configuración de Express
│   ├── Middlewares globales (CORS, JSON, Logger)
│   ├── Conexión a base de datos
│   ├── Registro de rutas
│   ├── Manejadores de error
│   └── Inicio del servidor
│
└───src/
    │
    ├───config/
    │   ├── database.js                      # Conexión a MongoDB
    │   │   ├── connectDB()
    │   │   └── Manejo de errores de conexión
    │   │
    │   └── env.js                           # Variables de entorno
    │       ├── PORT
    │       ├── MONGODB_URI
    │       ├── JWT_SECRET
    │       └── JWT_EXPIRES_IN
    │
    ├───controllers/
    │   └── authController.js
    │       ├── register()                   # Registro de usuarios
    │       ├── login()                      # Inicio de sesión
    │       └── getProfile()                 # Obtener perfil de usuario
    │
    ├───middleware/
    │   └── auth.js
    │       ├── authenticateToken()          # Validación de JWT
    │       └── authorizeRoles()             # Verificación de roles
    │
    ├───models/
    │   ├── user.js
    │   │   ├── Schema: email, password, name, role, isActive
    │   │   ├── Hooks: pre-save (hash password)
    │   │   └── Methods: comparePassword()
    │   │
    │   ├── Diligencia.js
    │   │   ├── Schema: userId, titulo, descripcion, status
    │   │   ├── fechaCreacion, fechaVencimiento, documentos[]
    │   │   └── Relaciones: User (N:1), Documento (1:N)
    │   │
    │   └── documento.js
    │       ├── Schema: diligenciaId, nombre, nombreArchivo
    │       ├── ruta, tamaño, tipoMime
    │       └── Relaciones: Diligencia (N:1)
    │
    ├───routes/
    │   ├── auth.js
    │   │   ├── POST   /api/auth/register
    │   │   ├── POST   /api/auth/login
    │   │   └── GET    /api/auth/profile
    │   │
    │   ├── clientes.js
    │   │   ├── GET    /api/clientes
    │   │   ├── GET    /api/clientes/:id
    │   │   ├── GET    /api/paises
    │   │   ├── POST   /api/clientes
    │   │   ├── PUT    /api/clientes/:id
    │   │   └── DELETE /api/clientes/:id
    │   │
    │   ├── dashboard.js
    │   │   ├── GET    /api/dashboard/grupos-ama-activos
    │   │   ├── GET    /api/dashboard/tramites-activos
    │   │   └── GET    /api/dashboard/clientes-por-pais
    │   │
    │   └── sync.js
    │       ├── POST   /api/sync/sheets
    │       └── GET    /api/sync/status
    │
    └───services/
        └── syncSheets.js
            ├── authenticateGoogleAPI()
            ├── syncFromSheet()
            ├── transformData()
            └── updateDatabase()
```

#### Descripción de carpetas y archivos principales

**Raíz del proyecto:**

- **`server.js`**: Archivo principal que inicia el servidor Express, configura middlewares globales, conecta a la base de datos y registra las rutas.
- **`package.json`**: Define las dependencias, scripts de npm y metadatos del proyecto.
- **`.env`**: Archivo de variables de entorno (sensible, no versionado).
- **`.env.example`**: Plantilla con las variables de entorno necesarias.

**`src/config/`**: Archivos de configuración

- **`database.js`**: Función para conectar a MongoDB usando Mongoose.
  ```javascript
  const mongoose = require('mongoose');
  
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB conectado exitosamente');
    } catch (error) {
      console.error('Error al conectar MongoDB:', error);
      process.exit(1);
    }
  };
  ```

- **`env.js`**: Carga y valida variables de entorno.
  ```javascript
  require('dotenv').config();
  
  module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  };
  ```

**`src/models/`**: Modelos de datos Mongoose

Cada archivo define un esquema Mongoose y exporta el modelo correspondiente. Los modelos incluyen:
- Definición de campos y tipos
- Validaciones
- Índices
- Métodos personalizados
- Hooks (pre/post save, etc.)

**`src/controllers/`**: Controladores

Contienen la lógica de negocio de la aplicación. Reciben las peticiones, procesan los datos, interactúan con los modelos y envían las respuestas.

Ejemplo de estructura:
```javascript
// authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // Lógica de registro
  } catch (error) {
    // Manejo de errores
  }
};

exports.login = async (req, res) => {
  try {
    // Lógica de login
  } catch (error) {
    // Manejo de errores
  }
};
```

**`src/middleware/`**: Middlewares personalizados

- **`auth.js`**: Middleware de autenticación JWT
  ```javascript
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../config/env');
  
  exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }
      req.user = user;
      next();
    });
  };
  ```

**`src/routes/`**: Definición de rutas

Cada archivo agrupa las rutas relacionadas con un módulo específico:

```javascript
// clientes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.get('/clientes', authenticateToken, async (req, res) => {
  // Lógica de la ruta
});

router.get('/paises', authenticateToken, async (req, res) => {
  // Lógica de la ruta
});

module.exports = router;
```

**`src/services/`**: Servicios auxiliares

- **`syncSheets.js`**: Servicio para sincronización con Google Sheets
  - Autenticación con Google API
  - Lectura de hojas de cálculo
  - Transformación de datos
  - Actualización de base de datos

**`uploads/documentos/`**: Almacenamiento de archivos

Directorio donde Multer guarda los archivos cargados por usuarios. Los nombres de archivo se generan de forma única para evitar conflictos.

#### Variables de entorno

El archivo `.env` contiene configuraciones sensibles y específicas del entorno:

```env
# Puerto del servidor
PORT=5000

# Conexión a MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>

# JWT
JWT_SECRET=<generar: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_EXPIRES_IN=7d

# Google Sheets API (opcional)
GOOGLE_SHEETS_CLIENT_EMAIL=cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# URLs permitidas (CORS)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Tamaño máximo de archivo (en bytes)
MAX_FILE_SIZE=10485760
```

**Descripción de variables:**

- **`PORT`**: Puerto en el que el servidor escuchará peticiones.
- **`MONGODB_URI`**: String de conexión a MongoDB Atlas (o instancia local).
- **`JWT_SECRET`**: Clave secreta para firmar tokens JWT (debe ser compleja y única).
- **`JWT_EXPIRES_IN`**: Tiempo de expiración de los tokens (ej: '7d', '24h', '1h').
- **`GOOGLE_SHEETS_CLIENT_EMAIL`**: Email de la cuenta de servicio de Google.
- **`GOOGLE_SHEETS_PRIVATE_KEY`**: Clave privada de la cuenta de servicio.
- **`ALLOWED_ORIGINS`**: Lista de orígenes permitidos para CORS (separados por coma).
- **`MAX_FILE_SIZE`**: Tamaño máximo de archivo permitido para uploads (en bytes).

#### Inicialización del servidor

El archivo `server.js` configura e inicia el servidor:

```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { PORT } = require('./src/config/env');

// Importar rutas
const authRoutes = require('./src/routes/auth');
const syncRoutes = require('./src/routes/sync');
const dashboardRoutes = require('./src/routes/dashboard');
const clientesRoutes = require('./src/routes/clientes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Conectar a la base de datos
connectDB();

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', clientesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend MongoDB funcionando correctamente',
    version: '1.0.0',
    database: 'MongoDB Atlas'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Server OK',
    mongodb: 'Conectado',
    timestamp: new Date().toISOString()
  });
});

// Manejador de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

#### Comandos de ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con nodemon para auto-reload)
npm run dev

# Modo producción
npm start

# Crear usuario administrador
node create-admin.js

# Importar datos desde CSVs
node import-csvs.js
```

### Front-end

#### Estructura del proyecto

El front-end está construido con React y organizado de la siguiente manera:

```
diligenciasinternacionalesinc/
│
├── .gitignore                               # Archivos ignorados por Git
├── package.json                             # Dependencias y scripts npm
├── package-lock.json                        # Lock de versiones
├── README.md                                # Documentación del proyecto
│
├───public/                                  # Archivos estáticos públicos
│   ├── index.html                          # Plantilla HTML principal
│   ├── manifest.json                       # Manifiesto PWA
│   ├── robots.txt                          # Configuración para crawlers
│   └───videos/                             # Videos institucionales
│
└───src/                                     # Código fuente de React
    │
    ├── index.js                            # Punto de entrada de React
    ├── index.css                           # Estilos globales base
    ├── App.js                              # Componente raíz y enrutamiento
    ├── App.css                             # Estilos globales de la app
    ├── App.test.js                         # Tests del componente App
    ├── setupTests.js                       # Configuración de tests
    ├── reportWebVitals.js                  # Métricas de rendimiento
    │
    ├───Components/                         # Componentes reutilizables
    │   ├── Card.js                         # Componente de tarjeta genérica
    │   ├── CustomCarousel.js               # Carrusel de imágenes personalizado
    │   ├── DataTable.js                    # Tabla de datos con paginación
    │   ├── Footer.js                       # Pie de página
    │   ├── heroBackgroundImage.js          # Imagen de fondo hero
    │   ├── InfiniteScroll.js               # Componente de scroll infinito
    │   ├── Modal.js                        # Modal genérico reutilizable
    │   ├── Navbar.js                       # Barra de navegación principal
    │   ├── Navbar1.js                      # Variante de navbar 1
    │   ├── Navbar2.js                      # Variante de navbar 2
    │   ├── Navbar3.js                      # Variante de navbar 3
    │   ├── ServiceActionButton.js          # Botón de acción de servicio
    │   ├── ServiceCard.js                  # Tarjeta de servicio
    │   ├── Sidebar.js                      # Menú lateral
    │   ├── TestimonialCard.js              # Tarjeta de testimonio
    │   ├── ThemeContext.js                 # Contexto para temas claro/oscuro
    │   │
    │   └───Layouts/                        # Plantillas de layout
    │       └── EmpleadoLayout.js           # Layout para módulo empleado
    │
    ├───config/                             # Configuraciones del front-end
    │   └── api.js                          # Configuración de Axios, interceptores
    │
    ├───Images/                             # Recursos de imágenes
    │   ├───Carrucel/                       # Imágenes para carruseles
    │   ├───Flags/                          # Banderas de países
    │   └───Services/                       # Iconos de servicios
    │
    ├───Pages/                              # Páginas principales de la aplicación
    │   │
    │   ├── AbrazosYMasAbrazos.js           # Página informativa grupos AMA
    │   ├── AsesoriaLegal.js                # Página informativa asesoría legal
    │   ├── CatalogoServicios.js            # Catálogo de servicios ofrecidos
    │   ├── Contacto.js                     # Formulario de contacto
    │   ├── Dashboard.js                    # Dashboard general
    │   ├── Login.js                        # Página de inicio de sesión
    │   ├── Tramites.js                     # Página general de trámites
    │   ├── TramitePasaporte.js             # Información trámite pasaporte
    │   ├── TramiteVisa.js                  # Información trámite visa
    │   │
    │   ├───Cliente/                        # Módulo de Cliente
    │   │   ├── InicioCliente.js            # Dashboard del cliente
    │   │   ├── ResumenEncuentroModal.js    # Modal resumen de reunión
    │   │   └── SubirDocumentoModal.js      # Modal para subir documentos
    │   │
    │   └───Empleado/                       # Módulo de Empleado
    │       │
    │       ├── Home.js                     # Dashboard principal empleado
    │       │   ├── Grupos AMA activos
    │       │   ├── Gráfico trámites activos
    │       │   └── Gráfico clientes por país
    │       │
    │       ├── Clientes.js                 # Lista y gestión de clientes
    │       ├── CrearCliente.js             # Formulario nuevo cliente
    │       ├── EditarCliente.js            # Formulario editar cliente
    │       ├── VerCliente.js               # Modal detalles de cliente
    │       │
    │       ├── AnadirCliente.js            # Añadir cliente existente
    │       ├── AnadirTramite.js            # Crear nuevo trámite
    │       ├── ActualizarTramite.js        # Actualizar estado de trámite
    │       ├── TramitesLista.js            # Lista de todos los trámites
    │       ├── NuevoTramite.js             # Formulario de nuevo trámite
    │       │
    │       ├── GrupoDetalle.js             # Detalles de grupo AMA
    │       ├── ItinerariosPendientes.js    # Lista de itinerarios pendientes
    │       │
    │       ├── AgregarPagoModal.js         # Modal para registrar pago
    │       ├── VerPagoModal.js             # Modal ver detalles de pago
    │       ├── PagosPendientes.js          # Lista de pagos pendientes
    │       ├── MetodosPago.js              # Gestión de métodos de pago
    │       │
    │       ├── EntregarDocumentos.js       # Entrega de documentos a cliente
    │       ├── AgregarSeguimientoModal.js  # Modal añadir seguimiento
    │       │
    │       ├── CrearSolicitud.js           # Crear solicitud de servicio
    │       ├── VerSolicitudes.js           # Ver todas las solicitudes
    │       ├── DetallesSolicitudModal.js   # Detalles de solicitud
    │       ├── SeleccionarTramiteModal.js  # Seleccionar tipo de trámite
    │       │
    │       ├── Empleados.js                # Gestión de empleados
    │       ├── Roles.js                    # Gestión de roles
    │       ├── AsigancionRoles.js          # Asignar roles a usuarios
    │       ├── Asignarempleado.js          # Asignar empleado a trámite
    │       ├── AsignarResponsable.js       # Asignar responsable
    │       │
    │       ├── Areas.js                    # Gestión de áreas/departamentos
    │       ├── EditarArea.js               # Editar área existente
    │       │
    │       ├── Antecedentes.js             # Catálogo de antecedentes
    │       ├── CrearAntecedente.js         # Crear nuevo antecedente
    │       ├── EditarAntecedente.js        # Editar antecedente
    │       │
    │       ├── PaisesCiudades.js           # Gestión de países y ciudades
    │       ├── Aerolineas.js               # Catálogo de aerolíneas
    │       │
    │       └── ... (34 archivos en total)
    │
    └───Styles/                             # Archivos CSS específicos
        ├── Login.css                       # Estilos página login
        ├── Dashboard.css                   # Estilos dashboard
        ├── Clientes.css                    # Estilos módulo clientes
        ├── Navbar.css                      # Estilos barra navegación
        ├── Navbar3.css                     # Estilos navbar variante 3
        ├── Sidebar.css                     # Estilos menú lateral
        ├── Sidebarempleado.css            # Estilos sidebar empleado
        ├── Footer.css                      # Estilos pie de página
        ├── Modal.css                       # Estilos modal genérico
        ├── ModalCliente.css                # Estilos modal de cliente
        ├── Tramites.css                    # Estilos módulo trámites
        ├── TramitesLista.css              # Estilos lista de trámites
        ├── Contacto.css                    # Estilos página contacto
        ├── CrearCliente.css                # Estilos formulario crear cliente
        ├── EditarCliente.css               # Estilos formulario editar cliente
        ├── VerCliente.css                  # Estilos vista de cliente
        ├── AñadirCliente.css               # Estilos añadir cliente
        ├── Anadirtramite.css              # Estilos añadir trámite
        ├── Nuevotramite.css                # Estilos nuevo trámite
        ├── CrearSolicitud.css              # Estilos crear solicitud
        ├── VerSolicitudes.css              # Estilos ver solicitudes
        ├── SolicitudForm.css               # Estilos formulario solicitud
        ├── DetallesSolicitudModal.css      # Estilos modal detalles
        ├── SeleccionarTramiteModal.css     # Estilos modal seleccionar
        ├── AgregarPagoModal.css            # Estilos modal agregar pago
        ├── VerPagoModal.css                # Estilos modal ver pago
        ├── PagosPendientes.css             # Estilos pagos pendientes
        ├── MetodosPago.css                 # Estilos métodos de pago
        ├── EntrregarDocumento.css          # Estilos entregar documento
        ├── AgregarSeguimientoModal.css     # Estilos modal seguimiento
        ├── SubirDocumentoModal.css         # Estilos modal subir doc
        ├── ResumenReencuentroModal.css     # Estilos modal resumen
        ├── Homempleado.css                 # Estilos home empleado
        ├── EmpleadoLayout.css              # Estilos layout empleado
        ├── GrupoDetalle.css                # Estilos detalle grupo
        ├── ServiciosDetalle.css            # Estilos detalles servicio
        ├── Empleados.css                   # Estilos módulo empleados
        ├── Roles.css                       # Estilos gestión roles
        ├── AsignarRoles.css                # Estilos asignar roles
        ├── AsignarResponsableModal.css     # Estilos modal responsable
        ├── Areas.css                       # Estilos áreas
        ├── Antecedentes.css                # Estilos antecedentes
        ├── CrearAntecedente.css            # Estilos crear antecedente
        ├── PaisesCiudades.css              # Estilos países y ciudades
        ├── InicioCliente.css               # Estilos inicio cliente
        ├── Carrucel.css                    # Estilos carrusel
        ├── InfiniteScroll.css              # Estilos scroll infinito
        ├── FullscreenMenu.css              # Estilos menú fullscreen
        ├── colors.css                      # Variables de colores
        │
        └── ... (46 archivos CSS en total)
```

**Estructura detallada con responsabilidades:**

```
src/
│
├── App.js                                   # 150+ líneas
│   ├── BrowserRouter                       # Enrutador principal
│   ├── Routes & Route                      # Definición de rutas
│   ├── PrivateRoute                        # Rutas protegidas por auth
│   ├── Rutas públicas (/, /login, /contacto)
│   ├── Rutas empleado (/empleado/*)
│   └── Rutas cliente (/cliente/*)
│
├───Components/
│   │
│   ├── Navbar.js                           # Navegación pública
│   │   ├── Links a servicios
│   │   ├── Botón de login
│   │   └── Responsive menu
│   │
│   ├── Sidebar.js                          # Menú lateral empleado
│   │   ├── Navegación por módulos
│   │   ├── Información de usuario
│   │   └── Botón cerrar sesión
│   │
│   ├── Modal.js                            # Modal genérico
│   │   ├── Props: isOpen, onClose, title, children
│   │   ├── Backdrop
│   │   └── Animaciones
│   │
│   ├── DataTable.js                        # Tabla de datos
│   │   ├── Paginación
│   │   ├── Búsqueda
│   │   ├── Ordenamiento
│   │   └── Acciones por fila
│   │
│   ├── ThemeContext.js                     # Context API para tema
│   │   ├── ThemeProvider
│   │   ├── useTheme hook
│   │   └── toggleTheme()
│   │
│   └───Layouts/
│       └── EmpleadoLayout.js               # Layout con sidebar
│           ├── <Sidebar />
│           ├── <Header />
│           ├── <Outlet />                  # Rutas anidadas
│           └── <Footer />
│
├───config/
│   └── api.js                              # Configuración Axios
│       ├── baseURL
│       ├── interceptors.request            # Añadir token JWT
│       ├── interceptors.response           # Manejo de errores
│       └── export default api
│
└───Pages/
    │
    ├── Login.js                            # Página de autenticación
    │   ├── useState: email, password
    │   ├── handleSubmit()
    │   ├── Validaciones
    │   ├── Petición POST /api/auth/login
    │   ├── Guardar token en localStorage
    │   └── Redirección según rol
    │
    ├───Empleado/
    │   │
    │   ├── Home.js                         # Dashboard con gráficos
    │   │   ├── useEffect: cargarDatosDashboard()
    │   │   ├── GET /api/dashboard/grupos-ama-activos
    │   │   ├── GET /api/dashboard/tramites-activos
    │   │   ├── GET /api/dashboard/clientes-por-pais
    │   │   ├── <BarChart /> - Recharts
    │   │   └── <PieChart /> - Recharts
    │   │
    │   ├── Clientes.js                     # Gestión de clientes
    │   │   ├── useState: clientes, clientesFiltrados
    │   │   ├── useEffect: cargarClientes()
    │   │   ├── filtrarClientes()
    │   │   ├── handleCrear()
    │   │   ├── handleEditar()
    │   │   ├── handleEliminar()
    │   │   ├── <DataTable />
    │   │   ├── <CrearCliente /> modal
    │   │   ├── <EditarCliente /> modal
    │   │   └── <VerCliente /> modal
    │   │
    │   ├── CrearCliente.js                 # Formulario nuevo cliente
    │   │   ├── useState: formData
    │   │   ├── handleChange()
    │   │   ├── handleSubmit()
    │   │   ├── POST /api/clientes
    │   │   └── Validaciones con Yup
    │   │
    │   ├── TramitesLista.js                # Lista de trámites
    │   │   ├── useEffect: cargarTramites()
    │   │   ├── filtrarPorEstado()
    │   │   ├── buscarPorCliente()
    │   │   └── navegarADetalle()
    │   │
    │   ├── AgregarPagoModal.js             # Registrar pago
    │   │   ├── Props: tramiteId, isOpen, onClose
    │   │   ├── useState: monto, metodo, fecha
    │   │   ├── POST /api/pagos
    │   │   └── onSuccess: actualizar lista
    │   │
    │   └── GrupoDetalle.js                 # Detalles grupo AMA
    │       ├── useParams: id del grupo
    │       ├── useEffect: cargarGrupo()
    │       ├── GET /api/grupos/:id
    │       ├── Lista de participantes
    │       ├── Información de itinerario
    │       └── Acciones del grupo
    │
    └───Cliente/
        └── InicioCliente.js                # Dashboard cliente
            ├── useEffect: cargarMisTramites()
            ├── GET /api/clientes/mis-tramites
            ├── Estado de trámites
            ├── Documentos pendientes
            └── Próximas citas
```

#### Descripción de carpetas principales

**`src/Components/`**: Componentes reutilizables

Contiene componentes que se utilizan en múltiples partes de la aplicación:

- **Navbar**: Barra de navegación principal
- **Sidebar**: Menú lateral
- **Footer**: Pie de página
- **Modal**: Componente modal genérico
- **DataTable**: Tabla de datos con funcionalidades
- **Card**: Tarjeta de información reutilizable
- **CustomCarousel**: Carrusel de imágenes
- **ThemeContext**: Contexto para manejo de temas (claro/oscuro)
- **Layouts**: Plantillas de layout (EmpleadoLayout, etc.)

**`src/Pages/`**: Componentes de página

Cada archivo representa una página o vista completa de la aplicación.

**Páginas públicas:**
- Login.js
- Contacto.js
- CatalogoServicios.js
- Tramites.js
- TramiteVisa.js
- TramitePasaporte.js
- AsesoriaLegal.js
- AbrazosYMasAbrazos.js

**Páginas del módulo Cliente:**
- InicioCliente.js: Dashboard del cliente
- ResumenEncuentroModal.js: Resumen de reunión con el cliente
- SubirDocumentoModal.js: Modal para carga de documentos

**Páginas del módulo Empleado:**
- Home.js: Dashboard con métricas
- Clientes.js: Lista y gestión de clientes
- CrearCliente.js: Formulario de nuevo cliente
- EditarCliente.js: Formulario de edición de cliente
- VerCliente.js: Detalles completos del cliente
- TramitesLista.js: Lista de trámites
- AnadirTramite.js: Crear nuevo trámite
- ActualizarTramite.js: Actualizar estado de trámite
- GrupoDetalle.js: Detalles de grupo AMA
- Y muchas más...

**`src/config/`**: Configuraciones

- **api.js**: Configuración de Axios para peticiones HTTP

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**`src/Styles/`**: Archivos CSS

Contiene archivos CSS específicos para cada página o componente, organizados para facilitar el mantenimiento.

#### Configuración de rutas

Las rutas de la aplicación se definen en `App.js` usando React Router:

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import EmpleadoLayout from './Components/Layouts/EmpleadoLayout';
import Home from './Pages/Empleado/Home';
import Clientes from './Pages/Empleado/Clientes';
// ... más importaciones

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/catalogo-servicios" element={<CatalogoServicios />} />
        
        {/* Rutas protegidas de empleado */}
        <Route path="/empleado" element={<PrivateRoute><EmpleadoLayout /></PrivateRoute>}>
          <Route path="home" element={<Home />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="tramites" element={<TramitesLista />} />
          <Route path="grupos/:id" element={<GrupoDetalle />} />
          {/* Más rutas anidadas */}
        </Route>
        
        {/* Rutas de cliente */}
        <Route path="/cliente" element={<PrivateRoute><InicioCliente /></PrivateRoute>} />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### Manejo de estado

La aplicación utiliza varios mecanismos para manejo de estado:

1. **useState**: Para estado local de componentes
2. **useEffect**: Para efectos secundarios y carga de datos
3. **Context API**: Para estado global (ThemeContext)
4. **localStorage**: Para persistencia de token y configuraciones

Ejemplo de estado en componente:

```javascript
const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [terminoBusqueda, clientes]);

  // ... funciones del componente
};
```

#### Variables de entorno

El front-end utiliza variables de entorno definidas en archivos `.env`:

```env
# URL de la API
REACT_APP_API_URL=http://localhost:5000/api

# Configuraciones de Google Maps (si se usa)
REACT_APP_GOOGLE_MAPS_API_KEY=clave_de_google_maps

# Modo de la aplicación
REACT_APP_ENV=development
```

#### Comandos de ejecución

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Expulsar configuración de Create React App (irreversible)
npm run eject
```

### Instalación y despliegue

#### Requisitos previos

**Software necesario:**
- Node.js v20.x o superior
- npm v9.x o superior
- MongoDB Atlas (cuenta gratuita) o MongoDB local v8.x
- Git para control de versiones

**Cuentas y servicios:**
- Cuenta de MongoDB Atlas (https://www.mongodb.com/atlas)
- Cuenta de Google Cloud (opcional, para Google Sheets API)

#### Instalación del back-end

1. **Clonar el repositorio** (si aplica):
   ```bash
   git clone <url-del-repositorio>
   cd DiligenciasInternacionales/backend-mongo
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`:
     ```bash
     copy .env.example .env
     ```
   - Editar `.env` con tus valores:
     ```env
     PORT=5000
     MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>
     JWT_SECRET=<generar: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
     JWT_EXPIRES_IN=7d
     ```

4. **Crear usuario administrador inicial**:
   ```bash
   node create-admin.js
   ```

5. **(Opcional) Importar datos de ejemplo**:
   ```bash
   node import-csvs.js
   ```

6. **Iniciar el servidor**:
   
   Modo desarrollo:
   ```bash
   npm run dev
   ```
   
   Modo producción:
   ```bash
   npm start
   ```

7. **Verificar funcionamiento**:
   - Abrir navegador en `http://localhost:5000`
   - Deberías ver un mensaje JSON de bienvenida
   - Health check en `http://localhost:5000/health`

#### Instalación del front-end

1. **Navegar a la carpeta del front-end**:
   ```bash
   cd ../diligenciasinternacionalesinc
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - Crear archivo `.env` en la raíz:
     ```env
     REACT_APP_API_URL=http://localhost:5000/api
     ```

4. **Iniciar la aplicación**:
   ```bash
   npm start
   ```

5. **Acceder a la aplicación**:
   - El navegador se abrirá automáticamente en `http://localhost:3000`
   - Si no, abre manualmente esa URL

#### Compilación para producción

**Back-end:**

El back-end no requiere compilación especial. Para producción:

1. Configurar variables de entorno de producción
2. Usar un gestor de procesos como PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name diligencias-backend
   pm2 save
   pm2 startup
   ```

**Front-end:**

1. **Compilar la aplicación**:
   ```bash
   npm run build
   ```

2. **Los archivos compilados estarán en la carpeta `build/`**

3. **Servir los archivos estáticos**:
   
   Opción 1 - Servidor Node.js simple:
   ```bash
   npm install -g serve
   serve -s build -l 3000
   ```
   
   Opción 2 - Nginx:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       
       root /ruta/a/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Despliegue en la nube

**Opciones de hosting:**

1. **Heroku** (PaaS):
   - Back-end: Crear app de Heroku, conectar repositorio
   - Agregar add-on de MongoDB (mLab/Atlas)
   - Configurar variables de entorno
   - Deploy automático desde Git

2. **Vercel** (Front-end):
   - Conectar repositorio de GitHub
   - Configurar comando de build: `npm run build`
   - Configurar variables de entorno
   - Deploy automático

3. **DigitalOcean** (VPS):
   - Crear droplet con Ubuntu
   - Instalar Node.js, MongoDB, Nginx
   - Clonar repositorio
   - Configurar PM2 para back-end
   - Configurar Nginx para servir front-end

4. **AWS** (EC2 + S3):
   - EC2 para back-end con PM2
   - S3 + CloudFront para front-end estático
   - RDS o MongoDB Atlas para base de datos

#### Mantenimiento y actualización

**Actualizar dependencias:**
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (con precaución)
npm update

# Actualizar una específica
npm install axios@latest
```

**Backup de base de datos:**
```bash
# Exportar colección
mongoexport --uri="<MONGODB_URI>" --collection=users --out=users_backup.json

# Importar colección
mongoimport --uri="<MONGODB_URI>" --collection=users --file=users_backup.json
```

**Logs y monitoreo:**
```bash
# Ver logs de PM2
pm2 logs

# Monitorear procesos
pm2 monit

# Ver estado
pm2 status
```

---

## CONCLUSIONES

El Sistema de Gestión de Diligencias Internacionales Inc. representa una solución integral y moderna para la administración de trámites internacionales. La arquitectura implementada, basada en tecnologías ampliamente adoptadas como React, Node.js, Express y MongoDB, proporciona una base sólida, escalable y mantenible.

La separación clara de responsabilidades entre el front-end y el back-end, junto con el uso de una API RESTful, facilita la evolución independiente de cada capa y permite futuras integraciones o extensiones del sistema.

El diseño del modelo de datos en MongoDB ofrece la flexibilidad necesaria para adaptarse a los cambios en los requisitos del negocio, mientras que el sistema de autenticación JWT garantiza la seguridad en el acceso a los recursos.

Este documento técnico proporciona la información necesaria para que desarrolladores actuales y futuros puedan comprender, mantener y evolucionar el sistema de manera eficiente.

---

## ANEXOS

### A. Glosario de términos

- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **REST**: Representational State Transfer
- **CRUD**: Create, Read, Update, Delete
- **ODM**: Object Data Modeling
- **SPA**: Single Page Application
- **CORS**: Cross-Origin Resource Sharing
- **AMA**: Abrazos y Más Abrazos (tipo de grupo de trámites)

### B. Referencias

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Fecha de elaboración:** Enero 2026  
**Versión del documento:** 1.0  
**Elaborado por:** Equipo de Desarrollo Diligencias Internacionales Inc.

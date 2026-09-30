# ESTRUCTURA DETALLADA DEL FRONT-END
## Sistema de Gestión de Diligencias Internacionales

---

## ÁRBOL COMPLETO DE ARCHIVOS

```
diligenciasinternacionalesinc/
│
├── .gitignore                                          # Archivos ignorados por Git
├── package.json                                        # Dependencias y scripts del proyecto
├── package-lock.json                                   # Lock de versiones exactas
├── README.md                                           # Documentación del proyecto
│
├───public/                                             # Recursos públicos estáticos
│   ├── index.html                                     # Template HTML principal
│   │   ├── <div id="root"></div>                     # Punto de montaje React
│   │   ├── Meta tags SEO
│   │   └── Links a fuentes y recursos
│   │
│   ├── manifest.json                                  # Manifiesto PWA
│   │   ├── name: "Diligencias Internacionales"
│   │   ├── short_name: "DII"
│   │   ├── icons: []
│   │   └── theme_color
│   │
│   ├── robots.txt                                     # Configuración para crawlers
│   │   ├── User-agent: *
│   │   └── Disallow: /api/
│   │
│   └───videos/                                        # Videos institucionales
│       └── (archivos de video .mp4, .webm)
│
└───src/                                                # Código fuente principal
    │
    ├── index.js                                       # Punto de entrada React
    │   ├── import React from 'react'
    │   ├── import ReactDOM from 'react-dom/client'
    │   ├── import App from './App'
    │   ├── import './index.css'
    │   ├── const root = ReactDOM.createRoot(...)
    │   └── root.render(<App />)
    │
    ├── index.css                                      # Estilos globales base
    │   ├── Reset CSS
    │   ├── Variables CSS globales
    │   ├── Estilos de body
    │   └── Clases de utilidad
    │
    ├── App.js                                         # Componente raíz (156 líneas)
    │   ├── import React
    │   ├── import { BrowserRouter, Routes, Route }
    │   ├── import { ThemeProvider }
    │   ├── 35+ imports de páginas y componentes
    │   ├── 45+ imports de estilos CSS
    │   │
    │   ├── Estructura de rutas:
    │   │   ├── / → Dashboard (público)
    │   │   ├── /login → Login
    │   │   ├── /contacto → Contacto
    │   │   ├── /tramites → Tramites
    │   │   ├── /catalogo-servicios → CatalogoServicios
    │   │   ├── /abrazos-mas-abrazos → AbrazosYMasAbrazos
    │   │   ├── /tramite-visa → TramiteVisa
    │   │   ├── /tramite-pasaporte → TramitePasaporte
    │   │   ├── /asesoria-legal → AsesoriaLegal
    │   │   │
    │   │   ├── /empleado → EmpleadoLayout (protegido)
    │   │   │   ├── /home → HomeEmpleado
    │   │   │   ├── /areas → Areas
    │   │   │   ├── /empleados → Empleados
    │   │   │   ├── /roles → Roles
    │   │   │   ├── /asignar-roles → AsignarRoles
    │   │   │   ├── /clientes → Clientes
    │   │   │   ├── /antecedentes → Antecendentes
    │   │   │   ├── /paises-ciudades → PaisesCiudades
    │   │   │   ├── /tramites → TramitesLista
    │   │   │   ├── /tramites/editar/:id → EditarTramite
    │   │   │   ├── /solicitudes/crear → CrearSolicitud
    │   │   │   ├── /solicitudes → VerSolicitudes
    │   │   │   ├── /metodos-pago → MetodosPago
    │   │   │   ├── /pagos-pendientes → PagosPendientes
    │   │   │   ├── /aerolineas → Aerolineas
    │   │   │   ├── /itinerarios-pendientes → ItinerariosPendientes
    │   │   │   ├── /entregar-documentos → EntregarDocumentos
    │   │   │   └── /grupos/:id → GrupoDetalle
    │   │   │
    │   │   └── /cliente → InicioCliente (protegido)
    │   │
    │   └── <ThemeProvider><Router><Routes>...</Routes></Router></ThemeProvider>
    │
    ├── App.css                                        # Estilos del componente App
    │   ├── Estilos del container principal
    │   ├── Animaciones
    │   └── Media queries
    │
    ├── App.test.js                                    # Tests unitarios del App
    ├── setupTests.js                                  # Configuración de Jest
    ├── reportWebVitals.js                             # Métricas de rendimiento Web Vitals
    │
    ├───Components/                                     # Componentes reutilizables (16 archivos)
    │   │
    │   ├── Card.js                                    # Componente de tarjeta genérica
    │   │   ├── Props: title, description, image, onClick
    │   │   ├── useState: hover
    │   │   ├── Animaciones al hover
    │   │   └── Estilos condicionales
    │   │
    │   ├── CustomCarousel.js                          # Carrusel de imágenes personalizado
    │   │   ├── import Swiper from 'swiper'
    │   │   ├── Props: images[], autoplay, loop
    │   │   ├── useEffect: inicializar Swiper
    │   │   ├── Controles: prev, next, pagination
    │   │   └── Responsive breakpoints
    │   │
    │   ├── DataTable.js                               # Tabla de datos con funcionalidades
    │   │   ├── Props: data, columns, onEdit, onDelete
    │   │   ├── useState: currentPage, pageSize, sortConfig
    │   │   ├── useState: searchTerm, filteredData
    │   │   ├── Funciones:
    │   │   │   ├── handleSort()
    │   │   │   ├── handleSearch()
    │   │   │   ├── handlePageChange()
    │   │   │   └── renderPagination()
    │   │   ├── <table> con thead y tbody
    │   │   ├── Búsqueda integrada
    │   │   └── Paginación con controles
    │   │
    │   ├── Footer.js                                  # Pie de página
    │   │   ├── Información de contacto
    │   │   ├── Links rápidos
    │   │   ├── Redes sociales
    │   │   └── Copyright © 2026
    │   │
    │   ├── heroBackgroundImage.js                     # Imagen de fondo hero section
    │   │   ├── Props: image, overlay, height
    │   │   ├── Parallax effect
    │   │   └── Gradient overlay
    │   │
    │   ├── InfiniteScroll.js                          # Componente de scroll infinito
    │   │   ├── import { useInView } from 'react-intersection-observer'
    │   │   ├── Props: loadMore, hasMore, loader
    │   │   ├── useEffect: detectar scroll
    │   │   └── Trigger al llegar al final
    │   │
    │   ├── Modal.js                                   # Modal genérico reutilizable
    │   │   ├── Props: isOpen, onClose, title, children, size
    │   │   ├── useEffect: bloquear scroll del body
    │   │   ├── useEffect: cerrar con tecla ESC
    │   │   ├── handleBackdropClick()
    │   │   ├── <div className="modal-backdrop">
    │   │   ├── <div className="modal-content">
    │   │   ├── Header con título y botón cerrar
    │   │   ├── Body con {children}
    │   │   └── Animaciones: fadeIn, slideDown
    │   │
    │   ├── Navbar.js                                  # Barra de navegación principal (pública)
    │   │   ├── useState: isOpen (menú móvil)
    │   │   ├── useState: scrolled (cambio al hacer scroll)
    │   │   ├── useNavigate()
    │   │   ├── Links:
    │   │   │   ├── Inicio
    │   │   │   ├── Servicios
    │   │   │   ├── Trámites
    │   │   │   ├── Contacto
    │   │   │   └── Iniciar Sesión
    │   │   ├── Logo de la empresa
    │   │   ├── Menú hamburguesa (móvil)
    │   │   └── Sticky navbar
    │   │
    │   ├── Navbar1.js                                 # Variante 1 de navbar
    │   ├── Navbar2.js                                 # Variante 2 de navbar
    │   │
    │   ├── Navbar3.js                                 # Variante 3 de navbar (empleado)
    │   │   ├── Props: user, onLogout
    │   │   ├── Avatar del usuario
    │   │   ├── Dropdown con opciones
    │   │   ├── Notificaciones
    │   │   └── Botón cerrar sesión
    │   │
    │   ├── ServiceActionButton.js                     # Botón de acción para servicios
    │   │   ├── Props: icon, text, onClick, variant
    │   │   ├── Iconos de React Icons
    │   │   └── Animación en hover
    │   │
    │   ├── ServiceCard.js                             # Tarjeta de servicio
    │   │   ├── Props: title, description, icon, link
    │   │   ├── Imagen o icono
    │   │   ├── Botón "Más información"
    │   │   └── Efecto hover con sombra
    │   │
    │   ├── Sidebar.js                                 # Menú lateral (genérico)
    │   │   ├── Props: isOpen, onClose, items
    │   │   ├── useState: activeItem
    │   │   ├── Overlay para cerrar
    │   │   ├── Lista de items navegables
    │   │   └── Animación slide-in
    │   │
    │   ├── TestimonialCard.js                         # Tarjeta de testimonio
    │   │   ├── Props: name, photo, text, rating
    │   │   ├── Estrellas de rating
    │   │   ├── Comillas decorativas
    │   │   └── Avatar circular
    │   │
    │   ├── ThemeContext.js                            # Context API para temas
    │   │   ├── import { createContext, useContext, useState, useEffect }
    │   │   ├── const ThemeContext = createContext()
    │   │   ├── export const ThemeProvider = ({ children }) => {
    │   │   │   ├── useState: theme ('light' | 'dark')
    │   │   │   ├── useEffect: cargar tema de localStorage
    │   │   │   ├── toggleTheme() → cambiar y guardar
    │   │   │   ├── useEffect: aplicar clase al body
    │   │   │   └── <ThemeContext.Provider value={{ theme, toggleTheme }}>
    │   │   │
    │   │   └── export const useTheme = () => useContext(ThemeContext)
    │   │
    │   └───Layouts/                                    # Plantillas de layout
    │       │
    │       └── EmpleadoLayout.js                      # Layout para módulo empleado
    │           ├── import { Outlet, useNavigate }
    │           ├── import Navbar3, Sidebar
    │           ├── useState: isSidebarOpen
    │           ├── useState: user (datos del localStorage)
    │           ├── useEffect: verificar autenticación
    │           ├── handleLogout()
    │           │   ├── localStorage.removeItem('authToken')
    │           │   ├── localStorage.removeItem('user')
    │           │   └── navigate('/login')
    │           │
    │           ├── Estructura:
    │           │   ├── <div className="empleado-layout">
    │           │   │   ├── <Navbar3 user={user} onLogout={handleLogout} />
    │           │   │   ├── <div className="layout-container">
    │           │   │   │   ├── <Sidebar isOpen={isSidebarOpen} items={menuItems} />
    │           │   │   │   └── <main className="content-area">
    │           │   │   │       └── <Outlet /> ← Rutas anidadas
    │           │   │   └── <Footer />
    │           │
    │           └── menuItems: [
    │               { icon, label, path, roles: [] }
    │               ]
    │
    ├───config/                                         # Configuraciones
    │   │
    │   └── api.js                                     # Configuración de API y endpoints
    │       ├── const API_BASE_URL = 'http://localhost:5000'
    │       │
    │       ├── export const API_ENDPOINTS = {
    │       │   // Autenticación
    │       │   ├── LOGIN: `${API_BASE_URL}/api/auth/login`
    │       │   ├── REGISTER: `${API_BASE_URL}/api/auth/register`
    │       │   ├── VERIFY: `${API_BASE_URL}/api/auth/verify`
    │       │   └── CLIENTE_LOGIN: `${API_BASE_URL}/api/auth/cliente-login`
    │       │   
    │       │   // Utilidad
    │       │   └── HEALTH: `${API_BASE_URL}/health`
    │       │   }
    │       │
    │       └── export default API_ENDPOINTS
    │
    ├───Images/                                         # Recursos de imágenes
    │   ├───Carrucel/                                  # Imágenes para carruseles
    │   │   ├── banner1.jpg
    │   │   ├── banner2.jpg
    │   │   ├── banner3.jpg
    │   │   └── ... (más imágenes)
    │   │
    │   ├───Flags/                                     # Banderas de países
    │   │   ├── mexico.png
    │   │   ├── usa.png
    │   │   ├── canada.png
    │   │   ├── spain.png
    │   │   └── ... (más banderas)
    │   │
    │   └───Services/                                  # Iconos de servicios
    │       ├── pasaporte-icon.svg
    │       ├── visa-icon.svg
    │       ├── asesoria-icon.svg
    │       └── ... (más iconos)
    │
    ├───Pages/                                          # Páginas de la aplicación
    │   │
    │   ├── Dashboard.js                               # Dashboard público/landing
    │   │   ├── import HeroBackgroundImage, CustomCarousel
    │   │   ├── import ServiceCard, TestimonialCard
    │   │   ├── Secciones:
    │   │   │   ├── Hero section con video/imagen
    │   │   │   ├── Servicios destacados
    │   │   │   ├── Testimonios de clientes
    │   │   │   ├── Estadísticas
    │   │   │   └── Call to action
    │   │   ├── Animaciones con AOS
    │   │   └── InfiniteScroll para testimonios
    │   │
    │   ├── Login.js                                   # Página de inicio de sesión
    │   │   ├── import { useNavigate }
    │   │   ├── import axios
    │   │   ├── import API_ENDPOINTS
    │   │   ├── useState: email, password, error, loading
    │   │   ├── useState: showPassword
    │   │   │
    │   │   ├── handleSubmit = async (e) => {
    │   │   │   ├── e.preventDefault()
    │   │   │   ├── setLoading(true)
    │   │   │   ├── try {
    │   │   │   │   ├── const response = await axios.post(API_ENDPOINTS.LOGIN, { email, password })
    │   │   │   │   ├── localStorage.setItem('authToken', response.data.token)
    │   │   │   │   ├── localStorage.setItem('user', JSON.stringify(response.data.user))
    │   │   │   │   ├── if (role === 'admin' || role === 'user') navigate('/empleado/home')
    │   │   │   │   └── else navigate('/cliente')
    │   │   │   └── catch (error) { setError('Credenciales inválidas') }
    │   │   │
    │   │   ├── Formulario:
    │   │   │   ├── Input email con validación
    │   │   │   ├── Input password con toggle show/hide
    │   │   │   ├── Checkbox "Recordarme"
    │   │   │   ├── Link "¿Olvidaste tu contraseña?"
    │   │   │   └── Botón "Iniciar Sesión"
    │   │   │
    │   │   └── Diseño: dos columnas (imagen + formulario)
    │   │
    │   ├── Contacto.js                                # Página de contacto
    │   │   ├── import { useState }
    │   │   ├── import emailjs
    │   │   ├── useState: formData { nombre, email, telefono, mensaje }
    │   │   ├── useState: enviado, error
    │   │   ├── handleChange()
    │   │   ├── handleSubmit()
    │   │   │   ├── Validar campos
    │   │   │   ├── emailjs.send(...)
    │   │   │   └── Mostrar confirmación
    │   │   ├── Formulario de contacto
    │   │   ├── Información de contacto
    │   │   ├── Mapa de ubicación (Google Maps)
    │   │   └── Horarios de atención
    │   │
    │   ├── Tramites.js                                # Página general de trámites
    │   │   ├── Lista de tipos de trámites
    │   │   ├── Cards con información
    │   │   ├── Links a páginas específicas
    │   │   └── Proceso general
    │   │
    │   ├── TramiteVisa.js                             # Información sobre trámite de visa
    │   │   ├── Requisitos
    │   │   ├── Proceso paso a paso
    │   │   ├── Costos
    │   │   ├── Tiempos estimados
    │   │   └── Botón "Solicitar trámite"
    │   │
    │   ├── TramitePasaporte.js                        # Información sobre pasaporte
    │   │   ├── Tipos de pasaporte
    │   │   ├── Requisitos
    │   │   ├── Proceso
    │   │   └── Costos
    │   │
    │   ├── AsesoriaLegal.js                           # Información de asesoría legal
    │   │   ├── Servicios legales
    │   │   ├── Áreas de especialización
    │   │   ├── Equipo de abogados
    │   │   └── Consulta
    │   │
    │   ├── AbrazosYMasAbrazos.js                      # Información grupos AMA
    │   │   ├── ¿Qué es un grupo AMA?
    │   │   ├── Destinos disponibles
    │   │   ├── Próximos grupos
    │   │   ├── Galería de fotos
    │   │   └── Registro de interés
    │   │
    │   ├── CatalogoServicios.js                       # Catálogo completo de servicios
    │   │   ├── Grid de ServiceCards
    │   │   ├── Filtros por categoría
    │   │   ├── Búsqueda de servicios
    │   │   └── Comparador de servicios
    │   │
    │   ├───Cliente/                                    # Módulo de Cliente (3 archivos)
    │   │   │
    │   │   ├── InicioCliente.js                       # Dashboard del cliente
    │   │   │   ├── import { useState, useEffect }
    │   │   │   ├── import axios
    │   │   │   ├── useState: tramites, documentos, citas
    │   │   │   ├── useState: user (del localStorage)
    │   │   │   │
    │   │   │   ├── useEffect: cargarDatosCliente()
    │   │   │   │   ├── GET /api/clientes/mis-tramites
    │   │   │   │   ├── GET /api/clientes/mis-documentos
    │   │   │   │   └── GET /api/clientes/mis-citas
    │   │   │   │
    │   │   │   ├── Secciones:
    │   │   │   │   ├── Header con bienvenida personalizada
    │   │   │   │   ├── Resumen de trámites activos
    │   │   │   │   ├── Estado de cada trámite (timeline)
    │   │   │   │   ├── Documentos pendientes de subir
    │   │   │   │   ├── Próximas citas/reuniones
    │   │   │   │   ├── Pagos pendientes
    │   │   │   │   └── Historial de trámites completados
    │   │   │   │
    │   │   │   ├── Modales:
    │   │   │   │   ├── <SubirDocumentoModal />
    │   │   │   │   └── <ResumenEncuentroModal />
    │   │   │   │
    │   │   │   └── Notificaciones en tiempo real
    │   │   │
    │   │   ├── SubirDocumentoModal.js                 # Modal para subir documentos
    │   │   │   ├── Props: isOpen, onClose, tramiteId, tipoDocumento
    │   │   │   ├── useState: archivo, nombreDocumento, descripcion
    │   │   │   ├── useState: uploading, progress
    │   │   │   │
    │   │   │   ├── handleFileChange(e)
    │   │   │   │   ├── Validar tipo de archivo
    │   │   │   │   ├── Validar tamaño máximo (10MB)
    │   │   │   │   └── Vista previa si es imagen
    │   │   │   │
    │   │   │   ├── handleSubmit = async () => {
    │   │   │   │   ├── const formData = new FormData()
    │   │   │   │   ├── formData.append('archivo', archivo)
    │   │   │   │   ├── formData.append('tramiteId', tramiteId)
    │   │   │   │   ├── formData.append('nombre', nombreDocumento)
    │   │   │   │   ├── const config = { onUploadProgress: (p) => setProgress(...) }
    │   │   │   │   ├── await axios.post('/api/documentos', formData, config)
    │   │   │   │   └── onClose()
    │   │   │   │
    │   │   │   ├── Componentes:
    │   │   │   │   ├── Input file con drag & drop
    │   │   │   │   ├── Vista previa del archivo
    │   │   │   │   ├── Barra de progreso
    │   │   │   │   └── Botones: Cancelar, Subir
    │   │   │   │
    │   │   │   └── Formatos aceptados: PDF, JPG, PNG, DOCX
    │   │   │
    │   │   └── ResumenEncuentroModal.js               # Modal resumen de reunión
    │   │       ├── Props: isOpen, onClose, encuentro
    │   │       ├── Fecha y hora de la reunión
    │   │       ├── Asistentes
    │   │       ├── Temas tratados
    │   │       ├── Acuerdos y compromisos
    │   │       ├── Próximos pasos
    │   │       └── Botón "Descargar resumen"
    │   │
    │   └───Empleado/                                   # Módulo de Empleado (34 archivos)
    │       │
    │       ├── Home.js                                # Dashboard principal empleado
    │       │   ├── import { useState, useEffect }
    │       │   ├── import axios
    │       │   ├── import { BarChart, PieChart } from 'recharts'
    │       │   │
    │       │   ├── useState: gruposAMAData, tramitesActivosData, clientesPaisData
    │       │   ├── useState: loading, error
    │       │   │
    │       │   ├── useEffect: cargarDatosDashboard()
    │       │   │   ├── const token = localStorage.getItem('authToken')
    │       │   │   ├── const headers = { Authorization: `Bearer ${token}` }
    │       │   │   ├── Promise.all([
    │       │   │   │   ├── axios.get('/api/dashboard/grupos-ama-activos', { headers })
    │       │   │   │   ├── axios.get('/api/dashboard/tramites-activos', { headers })
    │       │   │   │   └── axios.get('/api/dashboard/clientes-por-pais', { headers })
    │       │   │   └── ])
    │       │   │
    │       │   ├── Grid de 3 columnas:
    │       │   │   │
    │       │   │   ├── Sección 1: Grupos AMA activos
    │       │   │   │   ├── Título y contador
    │       │   │   │   └── Cards de grupos:
    │       │   │   │       ├── Tipo de trámite
    │       │   │   │       ├── Fecha de inicio
    │       │   │   │       ├── Total de clientes
    │       │   │   │       └── onClick: navigate(`/grupos/${id}`)
    │       │   │   │
    │       │   │   ├── Sección 2: Trámites activos
    │       │   │   │   ├── <BarChart>
    │       │   │   │   │   ├── data={tramitesActivosData}
    │       │   │   │   │   ├── <XAxis dataKey="tipotramite" />
    │       │   │   │   │   ├── <YAxis allowDecimals={false} />
    │       │   │   │   │   ├── <Tooltip />
    │       │   │   │   │   └── <Bar dataKey="total" fill="#2c3e50" />
    │       │   │   │   └── </BarChart>
    │       │   │   │
    │       │   │   └── Sección 3: Clientes por país
    │       │   │       └── <BarChart layout="vertical">
    │       │   │           ├── <XAxis type="number" />
    │       │   │           ├── <YAxis dataKey="nombrepais" type="category" />
    │       │   │           └── <Bar dataKey="total" fill="#8884d8" />
    │       │   │
    │       │   ├── Métricas rápidas:
    │       │   │   ├── Total de clientes activos
    │       │   │   ├── Trámites en proceso
    │       │   │   ├── Pagos pendientes
    │       │   │   └── Documentos por revisar
    │       │   │
    │       │   └── Accesos rápidos a módulos
    │       │
    │       ├── Clientes.js                            # Gestión de clientes
    │       │   ├── import { useState, useEffect }
    │       │   ├── import axios, { useNavigate }
    │       │   ├── import CrearCliente, EditarCliente, VerCliente
    │       │   │
    │       │   ├── useState: clientes, clientesFiltrados
    │       │   ├── useState: terminoBusqueda, cargando, error
    │       │   ├── useState: mostrarModalCrear, mostrarModalEditar, mostrarModalVer
    │       │   ├── useState: clienteSeleccionado, clienteDetalles
    │       │   │
    │       │   ├── useEffect: cargarClientes()
    │       │   │   ├── const token = localStorage.getItem('authToken')
    │       │   │   ├── const response = await axios.get('/api/clientes', { headers })
    │       │   │   ├── const clientesFormateados = formatearClientes(response.data)
    │       │   │   └── setClientes(clientesFormateados)
    │       │   │
    │       │   ├── useEffect: filtrarClientes()
    │       │   │   ├── Si terminoBusqueda vacío: mostrar todos
    │       │   │   ├── Sino: filtrar por nombre, apellido, teléfono, identificación
    │       │   │   └── setClientesFiltrados(filtrados)
    │       │   │
    │       │   ├── formatearClientes(clientes)
    │       │   │   └── Mapear campos: idCliente, nombreCliente, telefono, etc.
    │       │   │
    │       │   ├── formatearTelefono(telefono)
    │       │   │   └── Formato: ###-###-####
    │       │   │
    │       │   ├── handleCrear() → setMostrarModalCrear(true)
    │       │   ├── handleEditar(cliente) → setClienteSeleccionado, setMostrarModalEditar
    │       │   ├── handleVer(cliente) → setClienteDetalles, setMostrarModalVer
    │       │   ├── handleEliminar(id) → confirmar y DELETE /api/clientes/:id
    │       │   │
    │       │   ├── Componentes:
    │       │   │   ├── <input> búsqueda con <FaSearch />
    │       │   │   ├── <button> "Nuevo Cliente" con <FaPlus />
    │       │   │   ├── <table> o <div> con cards de clientes
    │       │   │   │   └── Para cada cliente:
    │       │   │   │       ├── Nombre completo
    │       │   │   │       ├── Teléfono formateado
    │       │   │   │       ├── Email
    │       │   │   │       └── Acciones:
    │       │   │   │           ├── <FaEye /> Ver
    │       │   │   │           ├── <FaEdit /> Editar
    │       │   │   │           └── <FaTrash /> Eliminar
    │       │   │   │
    │       │   │   ├── {mostrarModalCrear && <CrearCliente ... />}
    │       │   │   ├── {mostrarModalEditar && <EditarCliente ... />}
    │       │   │   └── {mostrarModalVer && <VerCliente ... />}
    │       │   │
    │       │   └── {cargando && <FaSpinner className="spinner" />}
    │       │
    │       ├── CrearCliente.js                        # Formulario nuevo cliente
    │       │   ├── Props: isOpen, onClose, onClienteCreado
    │       │   ├── useState: formData {
    │       │   │   nombreCliente, apellidoPaternoCliente,
    │       │   │   apellidoMaternoCliente, telefono,
    │       │   │   email, identificacionunicanacional
    │       │   │   }
    │       │   ├── useState: errors, submitting
    │       │   │
    │       │   ├── handleChange(e)
    │       │   │   └── setFormData({ ...formData, [name]: value })
    │       │   │
    │       │   ├── validarFormulario()
    │       │   │   ├── Validar campos requeridos
    │       │   │   ├── Validar formato email
    │       │   │   ├── Validar formato teléfono
    │       │   │   └── return { valido, errores }
    │       │   │
    │       │   ├── handleSubmit = async (e) => {
    │       │   │   ├── e.preventDefault()
    │       │   │   ├── const { valido, errores } = validarFormulario()
    │       │   │   ├── if (!valido) { setErrors(errores); return }
    │       │   │   ├── setSubmitting(true)
    │       │   │   ├── try {
    │       │   │   │   ├── const response = await axios.post('/api/clientes', formData)
    │       │   │   │   ├── onClienteCreado(response.data)
    │       │   │   │   └── onClose()
    │       │   │   └── } catch { mostrar error }
    │       │   │
    │       │   └── <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Cliente">
    │       │       └── <form onSubmit={handleSubmit}>
    │       │           ├── <input> Nombre *
    │       │           ├── <input> Apellido Paterno *
    │       │           ├── <input> Apellido Materno
    │       │           ├── <input> Teléfono *
    │       │           ├── <input> Email *
    │       │           ├── <input> Identificación (CURP/RFC)
    │       │           └── <button type="submit">Crear Cliente</button>
    │       │
    │       ├── EditarCliente.js                       # Formulario editar cliente
    │       │   ├── Props: isOpen, onClose, cliente, onClienteActualizado
    │       │   ├── useState: formData (inicializado con datos del cliente)
    │       │   ├── useState: errors, submitting
    │       │   │
    │       │   ├── useEffect: cargar datos del cliente en formData
    │       │   │
    │       │   ├── handleChange(e)
    │       │   ├── validarFormulario()
    │       │   │
    │       │   ├── handleSubmit = async (e) => {
    │       │   │   ├── Validar
    │       │   │   ├── PUT /api/clientes/${cliente.idCliente}
    │       │   │   ├── onClienteActualizado(response.data)
    │       │   │   └── onClose()
    │       │   │
    │       │   └── Formulario similar a CrearCliente
    │       │
    │       ├── VerCliente.js                          # Modal ver detalles de cliente
    │       │   ├── Props: isOpen, onClose, cliente
    │       │   │
    │       │   └── <Modal title="Detalles del Cliente">
    │       │       ├── Información personal completa
    │       │       ├── Historial de trámites
    │       │       ├── Documentos asociados
    │       │       ├── Pagos realizados
    │       │       └── Botones:
    │       │           ├── Editar
    │       │           ├── Ver trámites
    │       │           └── Cerrar
    │       │
    │       ├── AnadirCliente.js                       # Añadir cliente a trámite
    │       ├── AnadirTramite.js                       # Crear nuevo trámite
    │       │
    │       ├── TramitesLista.js                       # Lista de todos los trámites
    │       │   ├── useState: tramites, filtrados
    │       │   ├── useState: filtroEstado, filtroBusqueda
    │       │   ├── useEffect: cargarTramites()
    │       │   ├── filtrarPorEstado(estado)
    │       │   ├── buscarPorCliente(termino)
    │       │   │
    │       │   ├── Filtros:
    │       │   │   ├── Dropdown estado (todos, pendiente, en_proceso, completado)
    │       │   │   └── Input búsqueda por cliente
    │       │   │
    │       │   └── Lista de trámites:
    │       │       └── Para cada trámite:
    │       │           ├── ID y tipo
    │       │           ├── Cliente(s)
    │       │           ├── Fecha inicio
    │       │           ├── Estado con badge de color
    │       │           └── Acciones: Ver, Editar, Seguimiento
    │       │
    │       ├── ActualizarTramite.js                   # Actualizar estado de trámite
    │       │   ├── Props: tramiteId
    │       │   ├── useState: tramite, nuevoEstado, observaciones
    │       │   ├── useEffect: cargarTramite()
    │       │   │
    │       │   ├── handleActualizar()
    │       │   │   ├── PUT /api/tramites/:id
    │       │   │   └── { estado: nuevoEstado, observaciones }
    │       │   │
    │       │   └── Formulario:
    │       │       ├── Información actual del trámite
    │       │       ├── Select nuevo estado
    │       │       ├── Textarea observaciones
    │       │       └── Botón "Actualizar"
    │       │
    │       ├── NuevoTramite.js                        # Formulario nuevo trámite
    │       │
    │       ├── GrupoDetalle.js                        # Detalles de grupo AMA
    │       │   ├── import { useParams, useNavigate }
    │       │   ├── const { id } = useParams()
    │       │   ├── useState: grupo, participantes, itinerario
    │       │   │
    │       │   ├── useEffect: cargarGrupo()
    │       │   │   ├── GET /api/grupos/${id}
    │       │   │   └── Cargar participantes e itinerario
    │       │   │
    │       │   ├── Secciones:
    │       │   │   ├── Header: Nombre del grupo, destino, fechas
    │       │   │   ├── Lista de participantes (con fotos)
    │       │   │   ├── Itinerario día por día
    │       │   │   ├── Documentos del grupo
    │       │   │   ├── Pagos del grupo (resumen)
    │       │   │   └── Estado general
    │       │   │
    │       │   └── Acciones:
    │       │       ├── Agregar participante
    │       │       ├── Editar itinerario
    │       │       ├── Ver pagos individuales
    │       │       └── Finalizar grupo
    │       │
    │       ├── ItinerariosPendientes.js               # Lista de itinerarios pendientes
    │       │
    │       ├── AgregarPagoModal.js                    # Modal registrar pago
    │       │   ├── Props: isOpen, onClose, tramiteId, clienteId
    │       │   ├── useState: formData {
    │       │   │   monto, metodoPago, fechaPago,
    │       │   │   referencia, comprobante
    │       │   │   }
    │       │   │
    │       │   ├── handleSubmit()
    │       │   │   ├── POST /api/pagos
    │       │   │   └── { tramiteId, clienteId, ...formData }
    │       │   │
    │       │   └── Formulario:
    │       │       ├── Input monto (tipo number)
    │       │       ├── Select método de pago
    │       │       ├── Input fecha
    │       │       ├── Input referencia/folio
    │       │       ├── Upload comprobante (opcional)
    │       │       └── Botones: Cancelar, Registrar
    │       │
    │       ├── VerPagoModal.js                        # Modal ver detalles de pago
    │       ├── PagosPendientes.js                     # Lista de pagos pendientes
    │       ├── MetodosPago.js                         # Gestión catálogo métodos de pago
    │       │
    │       ├── EntregarDocumentos.js                  # Entrega de documentos
    │       │   ├── useState: tramites, seleccionados
    │       │   ├── handleMarcarEntregado(tramiteId, documentoId)
    │       │   │   ├── PUT /api/documentos/:id/entregar
    │       │   │   └── { fechaEntrega, entregadoA }
    │       │   │
    │       │   └── Lista de documentos listos para entregar
    │       │
    │       ├── AgregarSeguimientoModal.js             # Modal añadir seguimiento
    │       │   ├── Props: tramiteId
    │       │   ├── useState: comentario, tipo
    │       │   │
    │       │   ├── handleAgregar()
    │       │   │   └── POST /api/tramites/:id/seguimiento
    │       │   │
    │       │   └── Formulario:
    │       │       ├── Select tipo (llamada, email, reunión, etc.)
    │       │       ├── Textarea comentario
    │       │       └── Input fecha/hora
    │       │
    │       ├── CrearSolicitud.js                      # Crear solicitud de servicio
    │       │   ├── useState: formData, pasoActual
    │       │   ├── Multi-step form (wizard)
    │       │   │
    │       │   ├── Pasos:
    │       │   │   ├── 1. Seleccionar cliente
    │       │   │   ├── 2. Seleccionar tipo de trámite
    │       │   │   ├── 3. Detalles del trámite
    │       │   │   ├── 4. Documentos requeridos
    │       │   │   └── 5. Resumen y confirmación
    │       │   │
    │       │   ├── handleSiguiente()
    │       │   ├── handleAnterior()
    │       │   │
    │       │   └── handleSubmit()
    │       │       └── POST /api/solicitudes
    │       │
    │       ├── VerSolicitudes.js                      # Ver todas las solicitudes
    │       ├── DetallesSolicitudModal.js              # Modal detalles de solicitud
    │       ├── SeleccionarTramiteModal.js             # Modal seleccionar tipo
    │       │
    │       ├── Empleados.js                           # Gestión de empleados
    │       │   ├── CRUD de empleados
    │       │   ├── Asignación de roles
    │       │   └── Estados activo/inactivo
    │       │
    │       ├── Roles.js                               # Gestión de roles
    │       ├── AsigancionRoles.js                     # Asignar roles a usuarios
    │       ├── Asignarempleado.js                     # Asignar empleado a trámite
    │       ├── AsignarResponsable.js                  # Asignar responsable
    │       │
    │       ├── Areas.js                               # Gestión de áreas
    │       │   ├── Lista de áreas/departamentos
    │       │   ├── CRUD áreas
    │       │   └── Asignación de empleados a áreas
    │       │
    │       ├── EditarArea.js                          # Editar área
    │       │
    │       ├── Antecedentes.js                        # Catálogo de antecedentes
    │       ├── CrearAntecedente.js                    # Crear antecedente
    │       ├── EditarAntecedente.js                   # Editar antecedente
    │       │
    │       ├── PaisesCiudades.js                      # Gestión países y ciudades
    │       │   ├── Tabs: Países | Ciudades
    │       │   ├── CRUD países
    │       │   ├── CRUD ciudades
    │       │   └── Asociación ciudad-país
    │       │
    │       └── Aerolineas.js                          # Catálogo de aerolíneas
    │           ├── Lista de aerolíneas
    │           ├── CRUD aerolíneas
    │           └── Información: código, nombre, país
    │
    └───Styles/                                         # Archivos CSS (46 archivos)
        │
        ├── colors.css                                 # Variables de colores del sistema
        │   ├── :root {
        │   │   --primary-color: #007bff
        │   │   --secondary-color: #6c757d
        │   │   --success-color: #28a745
        │   │   --danger-color: #dc3545
        │   │   --warning-color: #ffc107
        │   │   --info-color: #17a2b8
        │   │   --light-color: #f8f9fa
        │   │   --dark-color: #343a40
        │   │   }
        │   │
        │   └── [dark-theme] { ... colores oscuros ... }
        │
        ├── Login.css                                  # Estilos página login
        ├── Dashboard.css                              # Estilos dashboard público
        ├── Contacto.css                               # Estilos página contacto
        ├── Tramites.css                               # Estilos página trámites
        │
        ├── Navbar.css                                 # Estilos navbar principal
        ├── Navbar3.css                                # Estilos navbar empleado
        ├── Sidebar.css                                # Estilos sidebar genérico
        ├── Sidebarempleado.css                        # Estilos sidebar empleado
        ├── Footer.css                                 # Estilos footer
        ├── Modal.css                                  # Estilos modal genérico
        ├── ModalCliente.css                           # Estilos modal específico cliente
        │
        ├── EmpleadoLayout.css                         # Estilos layout empleado
        ├── Homempleado.css                            # Estilos dashboard empleado
        │
        ├── Clientes.css                               # Estilos módulo clientes
        ├── CrearCliente.css                           # Estilos form crear cliente
        ├── EditarCliente.css                          # Estilos form editar cliente
        ├── VerCliente.css                             # Estilos modal ver cliente
        ├── AñadirCliente.css                          # Estilos añadir cliente
        │
        ├── TramitesLista.css                          # Estilos lista trámites
        ├── Anadirtramite.css                          # Estilos añadir trámite
        ├── Nuevotramite.css                           # Estilos nuevo trámite
        │
        ├── CrearSolicitud.css                         # Estilos crear solicitud
        ├── VerSolicitudes.css                         # Estilos ver solicitudes
        ├── SolicitudForm.css                          # Estilos formulario solicitud
        ├── DetallesSolicitudModal.css                 # Estilos modal detalles
        ├── SeleccionarTramiteModal.css                # Estilos modal seleccionar
        │
        ├── AgregarPagoModal.css                       # Estilos modal agregar pago
        ├── VerPagoModal.css                           # Estilos modal ver pago  
        ├── PagosPendientes.css                        # Estilos pagos pendientes
        ├── MetodosPago.css                            # Estilos métodos pago
        │
        ├── EntrregarDocumento.css                     # Estilos entregar documento
        ├── AgregarSeguimientoModal.css                # Estilos modal seguimiento
        ├── SubirDocumentoModal.css                    # Estilos modal subir doc
        ├── ResumenReencuentroModal.css                # Estilos modal resumen
        │
        ├── GrupoDetalle.css                           # Estilos detalle grupo AMA
        ├── ServiciosDetalle.css                       # Estilos detalles servicio
        │
        ├── Empleados.css                              # Estilos módulo empleados
        ├── Roles.css                                  # Estilos gestión roles
        ├── AsignarRoles.css                           # Estilos asignar roles
        ├── AsignarResponsableModal.css                # Estilos modal responsable
        │
        ├── Areas.css                                  # Estilos gestión áreas
        ├── Antecedentes.css                           # Estilos antecedentes
        ├── CrearAntecedente.css                       # Estilos crear antecedente
        ├── PaisesCiudades.css                         # Estilos países y ciudades
        │
        ├── InicioCliente.css                          # Estilos inicio cliente
        ├── Carrucel.css                               # Estilos carrusel
        ├── InfiniteScroll.css                         # Estilos scroll infinito
        └── FullscreenMenu.css                         # Estilos menú fullscreen
```

---

## RESUMEN DE ESTADÍSTICAS

### Conteo de archivos por categoría

```
├── Archivos de configuración raíz:         4 archivos
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── public/                                 4+ archivos
│   ├── HTML, JSON, TXT
│   └── Videos multimedia
│
├── src/ (Principal)
│   ├── Archivos raíz:                      7 archivos
│   │   ├── index.js, App.js, App.css
│   │   └── index.css, setupTests.js, etc.
│   │
│   ├── Components/                         17 archivos
│   │   ├── 16 componentes reutilizables
│   │   └── 1 layout (EmpleadoLayout)
│   │
│   ├── config/                             1 archivo
│   │   └── api.js
│   │
│   ├── Images/                             50+ archivos
│   │   ├── Carrucel/
│   │   ├── Flags/
│   │   └── Services/
│   │
│   ├── Pages/                              46 archivos
│   │   ├── Raíz:                           9 páginas públicas
│   │   ├── Cliente/                        3 archivos
│   │   └── Empleado/                       34 archivos
│   │
│   └── Styles/                             46 archivos CSS
│       └── Uno por cada componente/página
│
└── TOTAL APROXIMADO:                       175+ archivos
```

---

## TECNOLOGÍAS Y LIBRERÍAS UTILIZADAS

```
FRAMEWORK PRINCIPAL
└── React 19.0.0

ENRUTAMIENTO
└── React Router DOM 7.3.0

UI/COMPONENTES
├── Material-UI (@mui/material) 6.5.0
├── @mui/x-date-pickers 8.7.0
├── React Icons 5.5.0
└── Styled Components 6.1.16

FORMULARIOS Y VALIDACIÓN
├── React Hook Form 7.54.2
├── @hookform/resolvers 5.1.1
└── Yup 1.6.1

PETICIONES HTTP
└── Axios 1.10.0

GRÁFICOS Y VISUALIZACIÓN
├── Chart.js 4.4.8
└── Recharts 3.1.0

ANIMACIONES
├── Framer Motion 12.5.0
├── AOS (Animate On Scroll) 2.3.4
└── GSAP 3.12.7

CARRUSELES E IMÁGENES
├── Swiper 11.2.6
└── React Lazy Load Image Component 1.6.3

MAPAS
├── @react-google-maps/api 2.20.6
├── Leaflet 1.9.4
└── React Leaflet 5.0.0

UTILIDADES
├── date-fns 4.1.0
├── jwt-decode 4.0.0
└── bcrypt 5.1.1

ESTILOS
└── Bootstrap 5.3.3

TESTING
├── @testing-library/react 16.2.0
├── @testing-library/jest-dom 6.6.3
└── @testing-library/user-event 13.5.0
```

---

## FLUJO DE DATOS PRINCIPAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React Application (SPA)                        │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  App.js (Router)                                      │  │ │
│  │  │  ├── ThemeProvider (Context)                         │  │ │
│  │  │  └── BrowserRouter                                    │  │ │
│  │  │      ├── Rutas públicas                              │  │ │
│  │  │      ├── Rutas protegidas (empleado)                 │  │ │
│  │  │      └── Rutas protegidas (cliente)                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                            │                                 │ │
│  │                            ▼                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Componentes de Página                               │  │ │
│  │  │  ├── Login → autenticación                           │  │ │
│  │  │  ├── Dashboard → vista pública                       │  │ │
│  │  │  ├── HomeEmpleado → dashboard empleado               │  │ │
│  │  │  ├── Clientes → gestión clientes                     │  │ │
│  │  │  └── ... otros módulos                               │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                            │                                 │ │
│  │                            ▼                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Hooks y Estado Local                                │  │ │
│  │  │  ├── useState (estado del componente)                │  │ │
│  │  │  ├── useEffect (efectos secundarios)                 │  │ │
│  │  │  ├── useContext (tema, auth)                         │  │ │
│  │  │  └── useNavigate (navegación)                        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                            │                                 │ │
│  │                            ▼                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  API Client (Axios)                                  │  │ │
│  │  │  ├── config/api.js                                   │  │ │
│  │  │  ├── API_BASE_URL: http://localhost:5000             │  │ │
│  │  │  ├── Interceptor: añadir token JWT                   │  │ │
│  │  │  └── Interceptor: manejar errores                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                            │                                 │ │
│  └────────────────────────────┼─────────────────────────────────┘ │
│                                │                                   │
│  ┌────────────────────────────┼─────────────────────────────────┐ │
│  │  localStorage                                                 │ │
│  │  ├── authToken (JWT)                                         │ │
│  │  ├── user (datos del usuario)                                │ │
│  │  └── theme (preferencia tema)                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬────────────────────────────────────────┘
                           │ HTTP/HTTPS
                           │ (peticiones AJAX)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express.js)                       │
│                   http://localhost:5000/api                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Endpoints principales:                                   │  │
│  │  ├── POST   /api/auth/login                              │  │
│  │  ├── POST   /api/auth/register                           │  │
│  │  ├── GET    /api/clientes                                │  │
│  │  ├── POST   /api/clientes                                │  │
│  │  ├── GET    /api/dashboard/grupos-ama-activos            │  │
│  │  ├── GET    /api/dashboard/tramites-activos              │  │
│  │  ├── GET    /api/dashboard/clientes-por-pais             │  │
│  │  ├── POST   /api/tramites                                │  │
│  │  ├── POST   /api/pagos                                   │  │
│  │  └── ... más endpoints                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas (Base de Datos)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PATRONES DE DISEÑO UTILIZADOS

### 1. Component Pattern (Patrón de Componentes)
```javascript
// Componentes reutilizables y composición
<Modal>
  <CrearCliente />
</Modal>

<DataTable 
  data={clientes}
  columns={columns}
  onEdit={handleEditar}
/>
```

### 2. Container/Presentational Pattern
```javascript
// Container: lógica y estado
const Clientes = () => {
  const [clientes, setClientes] = useState([])
  // ... lógica
  return <ClientesView clientes={clientes} />
}

// Presentational: solo UI
const ClientesView = ({ clientes }) => (
  <div>{clientes.map(...)}</div>
)
```

### 3. Higher-Order Component (HOC)
```javascript
// ProtectedRoute para rutas autenticadas
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('authToken')
  if (!token) return <Navigate to="/login" />
  return children
}
```

### 4. Context API Pattern
```javascript
// ThemeContext para manejo global del tema
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### 5. Custom Hooks Pattern
```javascript
// Hook personalizado para autenticación
const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      // verificar token
    }
    setLoading(false)
  }, [])
  
  return { user, loading }
}
```

---

## CONVENCIONES DE CÓDIGO

### Nomenclatura
```
- Componentes: PascalCase (CrearCliente.js)
- Archivos CSS: camelCase o kebab-case (CrearCliente.css)
- Funciones: camelCase (handleSubmit, cargarClientes)
- Constantes: UPPER_SNAKE_CASE (API_BASE_URL)
- Variables de estado: camelCase (clientes, isLoading)
```

### Estructura de Componente Típica
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// 2. Componente
const MiComponente = () => {
  // 3. Hooks de React Router
  const navigate = useNavigate()
  
  // 4. Estado
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // 5. Effects
  useEffect(() => {
    cargarDatos()
  }, [])
  
  // 6. Funciones
  const cargarDatos = async () => {
    // ...
  }
  
  const handleSubmit = (e) => {
    // ...
  }
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

// 8. Export
export default MiComponente
```

---

**Fecha de elaboración:** Enero 2026  
**Versión del documento:** 1.0  
**Proyecto:** Sistema de Gestión de Diligencias Internacionales Inc.

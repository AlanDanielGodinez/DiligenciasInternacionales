import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../src/Components/ThemeContext";
import Dashboard from "./Pages/Dashboard";
import Contacto from "./Pages/Contacto";
import Login from "./Pages/Login";
import CambiarPassword from "./Pages/CambiarPassword";
import Tramites from "./Pages/Tramites";
import DashboardPostgres from "./features/dashboard/pages/DashboardPage";
import ClientesPostgresPage from "./features/clientes/pages/ClientesPostgresPage";
import SolicitudesPostgresPage from "./features/solicitudes/pages/SolicitudesPostgresPage";
import SolicitudesNuevoPage from "./features/solicitudes/pages/SolicitudesNuevoPage";
import CalendarioAmaPostgresPage from "./features/calendarioAma/pages/CalendarioAmaPostgresPage";
import EmpleadoLayout from "./Components/Layouts/EmpleadoLayout";
import HomeEmpleado from "./Pages/Empleado/Home";
import ContactosPage from "./Pages/Empleado/ContactosPage";
import Areas from "./Pages/Empleado/Areas";
import Empleados from "./Pages/Empleado/Empleados";
import Roles from "./Pages/Empleado/Roles";
import AsignarRoles from "./Pages/Empleado/AsigancionRoles";
import Clientes from "./Pages/Empleado/Clientes";
import ClienteFichaPage from "./Pages/Empleado/ClienteFichaPage";
import Antecendentes from "./Pages/Empleado/Antecedentes";
import PaisesCiudades from "./Pages/Empleado/PaisesCiudades";
import TramitesLista from "./Pages/Empleado/TramitesLista";
import EditarTramite from "./Pages/Empleado/ActualizarTramite";
import CrearSolicitud from "./Pages/Empleado/CrearSolicitud";
import VerSolicitudes from "./Pages/Empleado/VerSolicitudes";
import SeleccionarTramiteModal from "./Pages/Empleado/SeleccionarTramiteModal";
import AgregarSeguimientoModal from "./Pages/Empleado/AgregarSeguimientoModal";
import DetallesSolicitudModal from "./Pages/Empleado/DetallesSolicitudModal";
import MetodosPago from "./Pages/Empleado/MetodosPago";
import PagosPendientes from "./Pages/Empleado/PagosPendientes";
import PagosRegistroPage from "./Pages/Empleado/PagosRegistroPage";
import IndividualesPage from "./Pages/Empleado/IndividualesPage";
import IndividualCalendarioPage from "./Pages/Empleado/IndividualCalendarioPage";
import AmaPage from "./Pages/Empleado/AmaPage";
import LegalesPage from "./Pages/Empleado/LegalesPage";
import VuelosWorkspacePage from "./Pages/Empleado/VuelosWorkspacePage";
import LogisticaHubPage from "./Pages/Empleado/LogisticaHubPage";
import ToursPage from "./Pages/Empleado/ToursPage";
import GruposViajePage from "./Pages/Empleado/GruposViajePage";
import AmaAplicantesPage from "./Pages/Empleado/AmaAplicantesPage";
import ViajesOperacionPage from "./Pages/Empleado/ViajesOperacionPage";
import MisExpedientesPage from "./Pages/Empleado/MisExpedientesPage";
import GruposAmaPage from "./Pages/Empleado/GruposAmaPage";
import GruposAmaCalendarioPage from "./Pages/Empleado/GruposAmaCalendarioPage";
import ViajesCalendarioPage from "./Pages/Empleado/ViajesCalendarioPage";
import InicioCliente from "./Pages/Cliente/InicioCliente";
import Aerolineas from "./Pages/Empleado/Aerolineas";
import EntregarDocumentos from "./Pages/Empleado/EntregarDocumentos";
import GrupoDetalle from "./Pages/Empleado/GrupoDetalle";
import AbrazosYMasAbrazos from "./Pages/AbrazosYMasAbrazos";
import TramiteVisa from "./Pages/TramiteVisa";
import TramitePasaporte from "./Pages/TramitePasaporte";
import AsesoriaLegal from "./Pages/AsesoriaLegal";
import CatalogoServicios from "./Pages/CatalogoServicios";
import EditarArea from "./Pages/Empleado/EditarArea";
import VerPagoModal from "./Pages/Empleado/VerPagoModal";
import QuickBooksIntegracionPage from "./Pages/Empleado/QuickBooksIntegracionPage";
import NegadosPage from "./Pages/Empleado/NegadosPage";

import "./App.css";

import "../src/Styles/Navbar.css";
import "../src/Styles/ModalCliente.css";
import "../src/Styles/Sidebar.css";
import "../src/Styles/Sidebarempleado.css";
import "../src/Styles/Dashboard.css";
import "../src/Styles/Footer.css";
import "../src/Styles/Homempleado.css";
import "../src/Styles/Carrucel.css";
import "../src/Styles/InfiniteScroll.css";
import "../src/Styles/Tramites.css";
import "../src/Styles/Contacto.css";
import "../src/Styles/Login.css";
import "../src/Styles/EmpleadoLayout.css";
import "../src/Styles/SolicitudForm.css";
import "../src/Styles/AñadirCliente.css";
import "../src/Styles/Anadirtramite.css";
import "../src/Styles/Areas.css";
import "../src/Styles/Empleados.css";
import "../src/Styles/Roles.css";
import "../src/Styles/AsignarRoles.css";
import "../src/Styles/AsignarResponsableModal.css";
import "../src/Styles/Clientes.css";
import "../src/Styles/PaisesCiudades.css";
import "../src/Styles/CrearCliente.css";
import "../src/Styles/EditarCliente.css";
import "../src/Styles/VerCliente.css";
import "../src/Styles/Antecedentes.css";
import "../src/Styles/CrearAntecedente.css";
import "../src/Styles/TramitesLista.css";
import "../src/Styles/CrearSolicitud.css";
import "../src/Styles/Nuevotramite.css";
import "../src/Styles/VerSolicitudes.css";
import "../src/Styles/SeleccionarTramiteModal.css";
import "../src/Styles/DetallesSolicitudModal.css";
import "../src/Styles/MetodosPago.css";
import "../src/Styles/ConfiguracionMinima.css";
import "../src/Styles/PagosPendientes.css";
import "../src/Components/AreaBandeja/AreaBandejaPage.css";
import "../src/Styles/InicioCliente.css";
import "../src/Styles/SubirDocumentoModal.css";
import "../src/Styles/AgregarPagoModal.css";
import "../src/Styles/ResumenReencuentroModal.css";
import "../src/Styles/EntrregarDocumento.css";
import "../src/Styles/ServiciosDetalle.css";
import "../src/Styles/QuickBooksIntegracion.css";
import "../src/Styles/AdminStandard.css";

const ModuloPendiente = ({ nombre }) => (
  <div className="home-empleado">
    <h1>{nombre}</h1>
    <p>Vista pendiente de conectar durante la reorganizaciÃ³n por mÃ³dulos.</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tramites" element={<Tramites />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cambiar-password" element={<CambiarPassword />} />
            <Route path="/login/register" element={<Login initialMode="register" />} />
            <Route path="/cliente/inicio" element={<InicioCliente />} />
            <Route path="/dashboard-postgres" element={<DashboardPostgres />} />

            <Route path="/servicios/abrazos" element={<AbrazosYMasAbrazos />} />
            <Route path="/servicios/visa" element={<TramiteVisa />} />
            <Route path="/servicios/pasaporte" element={<TramitePasaporte />} />
            <Route path="/servicios/asesoria-legal" element={<AsesoriaLegal />} />
            <Route path="/servicios/catalogo" element={<CatalogoServicios />} />

            <Route element={<EmpleadoLayout />}>
              <Route path="/home" element={<HomeEmpleado />} />
              <Route path="/empleado/estadisticas" element={<ModuloPendiente nombre="EstadÃ­sticas" />} />

              <Route path="/empleado/contactos" element={<ContactosPage />} />
              <Route path="/empleado/llamadas" element={<ModuloPendiente nombre="Llamadas" />} />

              <Route path="/empleado/clientes" element={<Clientes />} />
              <Route path="/empleado/clientes/:idCliente" element={<ClienteFichaPage />} />
              <Route path="/empleado/clientes-postgres" element={<ClientesPostgresPage />} />
              <Route path="/empleado/clientes/nuevo" element={<Clientes />} />
              <Route path="/empleado/clientes/expediente" element={<Clientes />} />
              <Route path="/empleado/negados" element={<NegadosPage />} />

              <Route path="/empleado/crear-solicitud" element={<CrearSolicitud />} />
              <Route path="/empleado/crearSolicitud" element={<CrearSolicitud />} />
              <Route path="/empleado/solicitudes/nueva" element={<CrearSolicitud />} />
              <Route path="/empleado/versolicitudes" element={<VerSolicitudes />} />
              <Route path="/empleado/solicitudes" element={<VerSolicitudes />} />
              <Route path="/empleado/solicitudes-postgres" element={<SolicitudesPostgresPage />} />
              <Route path="/empleado/solicitudes-nuevo" element={<SolicitudesNuevoPage />} />
              <Route path="/empleado/solicitudes/seguimientos" element={<ModuloPendiente nombre="Seguimientos" />} />
              <Route path="/empleado/solicitudes/citas" element={<ModuloPendiente nombre="Citas" />} />
              <Route path="/empleado/entregar-documentos" element={<EntregarDocumentos />} />
              <Route path="/empleado/solicitudes/documentos" element={<EntregarDocumentos />} />

              <Route path="/empleado/tramiteslista" element={<TramitesLista />} />
              <Route path="/empleado/mis-expedientes" element={<MisExpedientesPage />} />
              <Route path="/empleado/individuales" element={<IndividualesPage />} />
              <Route path="/empleado/individuales/calendario" element={<IndividualCalendarioPage />} />
              <Route path="/empleado/legales" element={<LegalesPage />} />
              <Route path="/empleado/tramites/tipos" element={<TramitesLista />} />
              <Route path="/empleado/tramites/editar/:id" element={<EditarTramite />} />
              <Route path="/empleado/perfiles/visa" element={<ModuloPendiente nombre="Perfil visa" />} />
              <Route path="/empleado/perfiles/pasaporte" element={<ModuloPendiente nombre="Perfil pasaporte" />} />
              <Route path="/antecedentes" element={<Antecendentes />} />
              <Route path="/empleado/casos-legales" element={<Antecendentes />} />

              <Route path="/empleado/ama" element={<AmaPage />} />
              <Route path="/empleado/ama/grupos" element={<GruposAmaPage />} />
              <Route path="/empleado/ama/calendario" element={<GruposAmaCalendarioPage />} />
              <Route path="/grupos/:idGrupo" element={<GrupoDetalle />} />
              <Route path="/empleado/calendario-ama-postgres" element={<CalendarioAmaPostgresPage />} />
              <Route path="/empleado/ama/participantes" element={<AmaAplicantesPage />} />
              <Route path="/empleado/ama/familiares-usa" element={<ModuloPendiente nombre="Familiares en USA" />} />

              <Route path="/empleado/viajes/cotizaciones" element={<ViajesOperacionPage initialTab="cotizaciones" />} />
              <Route path="/empleado/viajes/calendario" element={<ViajesCalendarioPage />} />
              <Route path="/empleado/viajes" element={<LogisticaHubPage />} />
              <Route path="/empleado/viajes/vuelos" element={<VuelosWorkspacePage />} />
              <Route path="/empleado/itinerarios" element={<ViajesOperacionPage initialTab="itinerarios" />} />
              <Route path="/empleado/viajes/itinerarios" element={<ViajesOperacionPage initialTab="itinerarios" />} />
              <Route path="/empleado/viajes/tours" element={<ToursPage />} />
              <Route path="/empleado/viajes/grupos" element={<GruposViajePage />} />
              <Route path="/empleado/viajes/hoteles" element={<ModuloPendiente nombre="Hoteles" />} />
              <Route path="/empleado/viajes/vehiculos" element={<ModuloPendiente nombre="VehÃ­culos" />} />
              <Route path="/empleado/aerolineas" element={<Aerolineas />} />

              <Route path="/empleado/pagos/registro" element={<PagosRegistroPage />} />
              <Route path="/empleado/pagos-pendientes" element={<PagosPendientes />} />
              <Route path="/empleado/metodospago" element={<MetodosPago />} />

              <Route path="/empleado/empleados" element={<Empleados />} />
              <Route path="/empleado/areas" element={<Areas />} />
              <Route path="/empleado/areas/editar/:id" element={<EditarArea />} />
              <Route path="/empleado/asignarroles" element={<AsignarRoles />} />
              <Route path="/empleado/roles" element={<Roles />} />
              <Route path="/empleado/catalogos" element={<ModuloPendiente nombre="CatÃ¡logos" />} />
              <Route path="/empleado/paisesciudades" element={<PaisesCiudades />} />
              <Route path="/empleado/configuracion/quickbooks" element={<QuickBooksIntegracionPage />} />

              <Route path="/empleado/staging/registros-importados" element={<ModuloPendiente nombre="Registros importados" />} />
              <Route path="/empleado/staging/errores-importacion" element={<ModuloPendiente nombre="Errores de importaciÃ³n" />} />

              <Route path="/empleado/seleccionartramite" element={<SeleccionarTramiteModal />} />
              <Route path="/empleado/agregarseguimiento" element={<AgregarSeguimientoModal />} />
              <Route path="/empleado/detallesolicitud" element={<DetallesSolicitudModal />} />
              <Route path="/empleado/ver-pago" element={<VerPagoModal />} />
            </Route>

            <Route path="*" element={<h1>404 - PÃ¡gina no encontrada</h1>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

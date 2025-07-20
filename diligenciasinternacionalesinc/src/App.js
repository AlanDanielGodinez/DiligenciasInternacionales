import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../src/Components/ThemeContext";
import Dashboard from "./Pages/Dashboard"; 
import Contacto from "./Pages/Contacto";
import Login from "./Pages/Login";
import Tramites from "./Pages/Tramites";
import EmpleadoLayout from "./Components/Layouts/EmpleadoLayout"; // Nuevo layout
import HomeEmpleado from "./Pages/Empleado/Home";
import Areas from "./Pages/Empleado/Areas";
import Empleados from "./Pages/Empleado/Empleados";
import Roles from "./Pages/Empleado/Roles";
import AsignarRoles from "./Pages/Empleado/AsigancionRoles";
import Clientes from "./Pages/Empleado/Clientes";
import Antecendentes from "./Pages/Empleado/Antecedentes";
import PaisesCiudades from "./Pages/Empleado/PaisesCiudades";
import TramitesLista from "./Pages/Empleado/TramitesLista";
import EditarTramite from "./Pages/Empleado/ActualizarTramite"; // Asegúrate de que esta ruta sea correcta
import CrearSolicitud from "./Pages/Empleado/CrearSolicitud";
import VerSolicitudes from "./Pages/Empleado/VerSolicitudes";
import SeleccionarTramiteModal from "./Pages/Empleado/SeleccionarTramiteModal"; // Asegúrate de que esta ruta sea correcta
import AgregarSeguimientoModal from "./Pages/Empleado/AgregarSeguimientoModal"; // Asegúrate de que esta ruta sea correcta
import DetallesSolicitudModal from "./Pages/Empleado/DetallesSolicitudModal"; // Asegúrate de que esta ruta sea correcta
import MetodosPago from "./Pages/Empleado/MetodosPago"; // Asegúrate de que esta ruta sea correcta
import PagosPendientes from "./Pages/Empleado/PagosPendientes"; // Asegúrate de que esta ruta sea correcta
import "./App.css";

// Importaciones de estilos
import "../src/Styles/Navbar.css";
import "../src/Styles/ModalCliente.css";
import "../src/Styles/Sidebar.css";
import "../src/Styles/Sidebarempleado.css";
import "../src/Styles/Dashboard.css";
import "../src/Styles/Footer.css";
import "../src/Styles/Carrucel.css";
import "../src/Styles/InfiniteScroll.css";
import "../src/Styles/Tramites.css";
import "../src/Styles/Contacto.css";
import "../src/Styles/Login.css";
import "../src/Styles/EmpleadoLayout.css";
import '../src/Styles/SolicitudForm.css';
import '../src/Styles/AñadirCliente.css';
import '../src/Styles/Anadirtramite.css';
import '../src/Styles/Areas.css';
import '../src/Styles/Empleados.css';
import '../src/Styles/Roles.css';
import '../src/Styles/AsignarRoles.css';
import '../src/Styles/AsignarResponsableModal.css';
import '../src/Styles/Clientes.css';
import '../src/Styles/PaisesCiudades.css';
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
//import "../src/Styles/AgregarSeguimientoModal.css";
import "../src/Styles/DetallesSolicitudModal.css";
import "../src/Styles/MetodosPago.css";
import "../src/Styles/PagosPendientes.css";

import EditarArea from "./Pages/Empleado/EditarArea";


function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/tramites" element={<Tramites />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/register" element={<Login initialMode="register" />} />
            
            {/* Rutas protegidas con layout de empleado */}
            <Route element={<EmpleadoLayout />}>
              <Route path="/home" element={<HomeEmpleado />} />
      
              <Route path="/empleado/areas" element={<Areas />} />
              <Route path="/empleado/areas/editar/:id" element={<EditarArea />} />
              <Route path="/empleado/empleados" element={<Empleados />} />
              <Route path="/empleado/asignarroles" element={<AsignarRoles />} />
              <Route path="/empleado/roles" element={<Roles />} />
              <Route path="/antecedentes" element={<Antecendentes />} />
              <Route path="/empleado/clientes" element={<Clientes />} />
              <Route path="/empleado/tramiteslista" element={<TramitesLista />} />
              <Route path="/empleado/paisesciudades" element={<PaisesCiudades />} />
              <Route path="/empleado/tramites/editar/:id" element={<EditarTramite />} />
              <Route path="/empleado/crear-solicitud" element={<CrearSolicitud />} />
              <Route path="/empleado/crearSolicitud" element={<CrearSolicitud />} />
              <Route path="/empleado/versolicitudes" element={<VerSolicitudes />} />
              <Route path="/empleado/seleccionartramite" element={<SeleccionarTramiteModal />} />
              <Route path="/empleado/agregarseguimiento" element={<AgregarSeguimientoModal />} />
              <Route path="/empleado/detallesolicitud" element={<DetallesSolicitudModal />} />
              <Route path="/empleado/metodospago" element={<MetodosPago />} />
              <Route path="/empleado/pagos-pendientes" element={<PagosPendientes />} />
              {/* Aquí puedes agregar más rutas protegidas */}
            </Route>
            
            <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
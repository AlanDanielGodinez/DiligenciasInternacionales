import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../src/Components/ThemeContext";
import Dashboard from "./Pages/Dashboard"; 
import Contacto from "./Pages/Contacto";
import Login from "./Pages/Login";
import Tramites from "./Pages/Tramites";
import EmpleadoLayout from "./Components/Layouts/EmpleadoLayout"; // Nuevo layout
import HomeEmpleado from "./Pages/Empleado/Home";
import SolicitudForm from "./Pages/Empleado/SolicitudForm";

import "./App.css";

// Importaciones de estilos
import "../src/Styles/Navbar.css";
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
              {/* Agrega aquí más rutas protegidas */}
              <Route path="/SolicitudForm" element={<SolicitudForm />} />
              <Route path="/empleado/*" element={<HomeEmpleado />} />
            </Route>
            
            <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
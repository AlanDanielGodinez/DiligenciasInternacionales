import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../src/Components/ThemeContext";
import Dashboard from "./Pages/Dashboard"; 
import Contacto from "./Pages/Contacto";
import Login from "./Pages/Login";
import Tramites from "./Pages/Tramites";
import HomeEmpleado from "./Pages/Empleado/Home";
import "./App.css";

// Importaciones de estilos
import "../src/Styles/Navbar.css";
import "../src/Styles/Sidebar.css";
import "../src/Styles/Dashboard.css";
import "../src/Styles/Footer.css";
import "../src/Styles/Carrucel.css";
import "../src/Styles/InfiniteScroll.css";
import "../src/Styles/Tramites.css";
import "../src/Styles/Contacto.css";
import "../src/Styles/Login.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
         
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tramites" element={<Tramites />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Login/register" element={<Login initialMode="register" />} />
              <Route path="/Home" element={<HomeEmpleado />} />
              <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
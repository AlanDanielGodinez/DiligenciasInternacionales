import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importar react-router-dom
import { ThemeProvider } from "../src/Components/ThemeContext"; // Importar el proveedor del tema
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Pages/Dashboard"; // Importar la página Dashboard
import OtraPagina from "./Pages/OtraPagina"; // Importar otras páginas
import MasOpciones from "./Pages/MasOpciones"; // Importar más páginas
import "./App.css";

// Enlaces de estilos:
import "../src/Styles/Navbar.css"; // Importamos el archivo CSS
import "../src/Styles/Sidebar.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          {/* Sidebar presente en todas las páginas */}
          <Sidebar />

          {/* Contenido principal que cambia según la ruta */}
          <div className="content">
            <Routes>
              {/* Ruta por defecto que muestra el Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Otras rutas */}
              <Route path="/otra-pagina" element={<OtraPagina />} />
              <Route path="/mas-opciones" element={<MasOpciones />} />

              {/* Ruta para manejar páginas no encontradas (opcional) */}
              <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
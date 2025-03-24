import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importar react-router-dom
import { ThemeProvider } from "../src/Components/ThemeContext"; // Importar el proveedor del tema
import Navbar from "./Components/Navbar";
import Dashboard from "./Pages/Dashboard"; 
import Tramites from "./Pages/Tramites";// Importar la página Dashboard
import "./App.css";

// Enlaces de estilos:
import "../src/Styles/Navbar.css"; // Importamos el archivo CSS
import "../src/Styles/Sidebar.css";
import "../src/Styles/Dashboard.css"
import "../src/Styles/Footer.css";
import "../src/Styles/Carrucel.css";
import "../src/Styles/InfiniteScroll.css";
import "../src/Styles/Tramites.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          {/* NavBar presente en todas las páginas */}
          <Navbar />
          {/* Contenido principal que cambia según la ruta */}
          <div className="content">
            <Routes>
              {/* Ruta por defecto que muestra el Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Otras rutas */}
              <Route path="/Tramites" element={<Tramites />} />
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
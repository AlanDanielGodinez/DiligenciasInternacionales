import React from "react";
import { ThemeProvider } from "../src/Components/ThemeContext"; // Importar el proveedor del tema
import Sidebar from "./Components/Sidebar";
import NavBar from "../src/Components/Navbar";
import "./App.css";


//enlaces de estilos:
import "../src/Styles/Navbar.css"; // Importamos el archivo CSS
import "../src/Styles/Sidebar.css";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        
        <Sidebar />
        <div className="content">
          <h1>Contenido principal</h1>
          <p>Este es el contenido de la página.</p>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
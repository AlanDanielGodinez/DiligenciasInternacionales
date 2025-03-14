import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext"; // Importar el contexto


const Sidebar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Usar el contexto

  return (
    <div className={`sidebar ${theme}`}>
      {/* Logo y botón para colapsar/expandir */}
      <div className="sidebar-header">
        <div className="logo">LOGO</div>
      </div>

      {/* Opciones del menú */}
      <ul className="menu">
        <li className="menu-item">
          <a href="/" className="menu-link">
            🏠 Home
          </a>
        </li>
        <li className="menu-item">
          <a href="/about" className="menu-link">
            ℹ️ About Us
          </a>
        </li>
        <li className="menu-item">
          <a href="/contact" className="menu-link">
            ✉️ Contact
          </a>
        </li>
      </ul>

      {/* Botón para cambiar el tema */}
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="theme-button">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
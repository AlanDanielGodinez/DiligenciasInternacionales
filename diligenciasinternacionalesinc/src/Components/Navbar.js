import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../Images/1.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo a la izquierda */}
      <div className="navbar-logo">
        <Link to="/">
          <img src={logoImage} alt="Logo" className="logo-image" />
        </Link>
      </div>

      {/* Opciones de navegación al centro */}
      <ul className="navbar-menu">
        <li>
          <Link to="/">HOME</Link>
        </li>
        <li>
          <Link to="/tramites">TRAMITES Y SERVICIOS</Link>
        </li>
        <li>
          <Link to="/contacto">CONTACTO</Link>
        </li>
      </ul>

      {/* Opciones de inicio de sesión y registro a la derecha */}
      <div className="navbar-auth">
        <Link to="/login" className="auth-link">
          Iniciar sesión
        </Link>
        
      </div>
    </nav>
  );
};

export default Navbar;
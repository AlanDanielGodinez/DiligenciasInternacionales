import React from "react";


const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo a la izquierda */}
      <div className="navbar-logo">
        <a href="/">LOGO</a>
      </div>

      {/* Opciones de navegación al centro */}
      <ul className="navbar-menu">
        <li>
          <a href="/">HOME</a>
        </li>
        <li>
          <a href="/about">ABOUT US</a>
        </li>
        <li>
          <a href="/contact">CONTACT</a>
        </li>
      </ul>

      {/* Opciones de inicio de sesión y registro a la derecha */}
      <div className="navbar-auth">
        <a href="/login" className="auth-link">
          Iniciar sesión
        </a>
        <a href="/register" className="auth-link">
          Registrarte
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
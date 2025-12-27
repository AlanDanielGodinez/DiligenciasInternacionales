import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoImage from "../Images/1.png";

import usaFlag from "../Images/Flags/usa.png";
import mexicoFlag from "../Images/Flags/mexico.webp";
import hondurasFlag from "../Images/Flags/honduras.png";
import elSalvadorFlag from "../Images/Flags/salvador.png";
import guatemalaFlag from "../Images/Flags/guatemala.png";


const Navbar = () => {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };
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
         {/* Menú desplegable de TRAMITES Y SERVICIOS */}
        <li 
          className="navbar-dropdown"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={closeDropdown}
        >
          <div className="dropdown-trigger" onClick={toggleDropdown}>
            TRAMITES Y SERVICIOS
            <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
          </div>
          
          {/* Menú desplegable */}
          <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
            <Link to="/tramites/reencuentros" className="dropdown-item" onClick={closeDropdown}>
              Reencuentros Familiares
            </Link>
            <Link to="/tramites/visas" className="dropdown-item" onClick={closeDropdown}>
              Trámite de Visa
            </Link>
            <Link to="/tramites/pasaportes" className="dropdown-item" onClick={closeDropdown}>
              Trámite de Pasaporte
            </Link>
            <Link to="/tramites/apostillas" className="dropdown-item" onClick={closeDropdown}>
              Apostillas
            </Link>
            <Link to="/tramites/documentos" className="dropdown-item" onClick={closeDropdown}>
              Gestión de Documentos
            </Link>
            <Link to="/tramites/todos" className="dropdown-item" onClick={closeDropdown}>
              Ver Todos los Servicios
            </Link>
          </div>
        </li>
        <li>
          <Link to="/contacto">CONTACTO</Link>
        </li>
      </ul>
      

      {/* Opciones de inicio de sesión y registro a la derecha */}
      <div className="navbar-auth">
          {/* Banderas decorativas */}
        <div className="navbar-flags">
          <img src={usaFlag} alt="" className="flag-decoration" />
          <img src={mexicoFlag} alt="" className="flag-decoration" />
          <img src={hondurasFlag} alt="" className="flag-decoration" />
          <img src={elSalvadorFlag} alt="" className="flag-decoration" />
          <img src={guatemalaFlag} alt="" className="flag-decoration" />
        </div>
        <Link to="/login" className="auth-link">
          Iniciar sesión
        </Link>
        
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../Images/2.png";
import { FaChevronDown } from "react-icons/fa";
import '../Styles/Navbar3.css';
// Importar las banderas
import usaFlag from "../Images/Flags/usa.png";
import mexicoFlag from "../Images/Flags/mexico.webp";
import hondurasFlag from "../Images/Flags/honduras.png";
import elSalvadorFlag from "../Images/Flags/salvador.png";
import guatemalaFlag from "../Images/Flags/guatemala.png";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hoverTimeout = useRef(null);

  const toggleDropdown = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    // pequeño delay para evitar parpadeo al pasar del trigger al menú
    hoverTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
      hoverTimeout.current = null;
    }, 250);
  };

  const openDropdown = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setIsDropdownOpen(true);
  };

  return (
    <>
      <nav className="navbar3">
        {/* Logo a la izquierda */}
        <div className="navbar3-logo">
          <Link to="/">
            <img src={logoImage} alt="Logo" className="logo-image3" />
          </Link>
        </div>

        {/* Opciones de navegación al centro */}
        <ul className="navbar3-menu">
          <li>
            <Link to="/">HOME</Link>
          </li>
          
          {/* Menú desplegable de TRAMITES Y SERVICIOS */}
          <li 
            className="navbar3-dropdown"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            <div className={`dropdown3-trigger ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
              TRAMITES Y SERVICIOS
              <FaChevronDown className={`dropdown3-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </div>
            
            {/* Menú desplegable GRANDE */}
            <div 
              className={`dropdown3-menu-large ${isDropdownOpen ? 'show' : ''}`}
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdown}
            >
              <div className="dropdown3-content-large">
                
                {/* Columna 1: Servicios Familiares */}
                <div className="dropdown3-column-large">
                  <h4 className="column3-title-large">Servicios Familiares</h4>
                  <div className="column3-subtitle-large">Reunificación</div>
                  
                  <Link to="/abrazos" className="dropdown3-item-large" onClick={closeDropdown}>
                    Programa Abrazos y Más Abrazos
                  </Link>
                  <Link to="/reencuentros-familiares" className="dropdown3-item-large" onClick={closeDropdown}>
                    Reencuentros Familiares
                  </Link>
                  <Link to="/peticiones-familia" className="dropdown3-item-large" onClick={closeDropdown}>
                    Peticiones Familiares
                  </Link>
                  <Link to="/adopciones" className="dropdown3-item-large" onClick={closeDropdown}>
                    Adopciones Internacionales
                  </Link>
                  <Link to="/casos-especiales" className="dropdown3-item-large" onClick={closeDropdown}>
                    Casos Especiales
                  </Link>
                </div>

                {/* Columna 2: Documentación */}
                <div className="dropdown3-column-large">
                  <h4 className="column3-title-large">Documentación</h4>
                  <div className="column3-subtitle-large">Trámites Oficiales</div>
                  
                  <Link to="/tramites/visas" className="dropdown3-item-large" onClick={closeDropdown}>
                    Trámite de Visa
                  </Link>
                  <Link to="/tramites/pasaportes" className="dropdown3-item-large" onClick={closeDropdown}>
                    Trámite de Pasaporte
                  </Link>
                  <Link to="/tramites/apostillas" className="dropdown3-item-large" onClick={closeDropdown}>
                    Apostillas y Legalizaciones
                  </Link>
                  <Link to="/tramites/traducciones" className="dropdown3-item-large" onClick={closeDropdown}>
                    Traducciones Certificadas
                  </Link>
                  <Link to="/gestion-documentos" className="dropdown3-item-large" onClick={closeDropdown}>
                    Gestión de Documentos
                  </Link>
                </div>

                {/* Columna 3: Servicios Legales */}
                <div className="dropdown3-column-large">
                  <h4 className="column3-title-large">Servicios Legales</h4>
                  <div className="column3-subtitle-large">Asesoría Especializada</div>
                  
                  <Link to="/asesoria-legal" className="dropdown3-item-large" onClick={closeDropdown}>
                    Asesoría Legal Migratoria
                  </Link>
                  <Link to="/representacion-legal" className="dropdown3-item-large" onClick={closeDropdown}>
                    Representación Legal
                  </Link>
                  <Link to="/consulta-gratuita" className="dropdown3-item-large" onClick={closeDropdown}>
                    Consulta Gratuita (30 min)
                  </Link>
                  <Link to="/casos-complejos" className="dropdown3-item-large" onClick={closeDropdown}>
                    Casos Complejos
                  </Link>
                  <Link to="/servicios" className="dropdown3-item-large" onClick={closeDropdown}>
                    Ver Todos los Servicios
                  </Link>
                </div>

              </div>
            </div>
          </li>
          
          <li>
            <Link to="/contacto">CONTACTO</Link>
          </li>
        </ul>

        {/* Banderas decorativas y opciones de inicio de sesión a la derecha */}
        <div className="navbar3-auth">
          {/* Banderas decorativas */}
          <div className="navbar3-flags">
            <img src={usaFlag} alt="USA" className="flag3-decoration" />
            <img src={mexicoFlag} alt="México" className="flag3-decoration" />
            <img src={hondurasFlag} alt="Honduras" className="flag3-decoration" />
            <img src={elSalvadorFlag} alt="El Salvador" className="flag3-decoration" />
            <img src={guatemalaFlag} alt="Guatemala" className="flag3-decoration" />
          </div>
          
          <Link to="/login" className="auth3-link">
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Overlay para cerrar el dropdown */}
      {isDropdownOpen && <div className="dropdown3-overlay" onClick={closeDropdown}></div>}
    </>
  );
};

export default Navbar;
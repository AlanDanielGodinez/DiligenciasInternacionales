import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../Images/1.png";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import '../Styles/FullscreenMenu.css';
// Iconos como imágenes
import abrazosIcon from "../Images/Services/abrazos.svg";
import visaIcon from "../Images/Services/visa.svg";
import pasaporteIcon from "../Images/Services/pasaporte.svg";
import legalIcon from "../Images/Services/legal.svg";
import catalogoIcon from "../Images/Services/catalogo.svg";
import catFamiliaIcon from "../Images/Services/categoria-familia.svg";
import catDocsIcon from "../Images/Services/categoria-docs.svg";
import catLegalIcon from "../Images/Services/categoria-legal.svg";
import catViajeIcon from "../Images/Services/categoria-viaje.svg";
// Importar las banderas
import usaFlag from "../Images/Flags/usa.png";
import mexicoFlag from "../Images/Flags/mexico.webp";
import hondurasFlag from "../Images/Flags/honduras.png";
import elSalvadorFlag from "../Images/Flags/salvador.png";
import guatemalaFlag from "../Images/Flags/guatemala.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
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
          
          {/* Botón para abrir menú fullscreen */}
          <li>
            <div className="dropdown-trigger" onClick={toggleMenu}>
              TRAMITES Y SERVICIOS
              <FaChevronDown className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`} />
            </div>
          </li>
          
          <li>
            <Link to="/contacto">CONTACTO</Link>
          </li>
        </ul>

        {/* Banderas decorativas y opciones de inicio de sesión a la derecha */}
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

      {/* Menú Fullscreen */}
      <div className={`fullscreen-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="fullscreen-menu-header">
          <div className="menu-logo">
            <img src={logoImage} alt="Logo" className="menu-logo-image" />
          </div>
          <button className="close-menu-btn" onClick={closeMenu}>
            <FaTimes />
          </button>
        </div>

        <div className="fullscreen-menu-content">
          <div className="services-grid-fullscreen">
            
            {/* Servicio 1: Abrazos y Más Abrazos */}
            <div className="service-card-fullscreen" onClick={closeMenu}>
              <img className="service-icon-large" src={abrazosIcon} alt="Abrazos y Más Abrazos" />
              <h3>ABRAZOS Y MAS ABRAZOS</h3>
              <p>Programa especializado para reunir familias separadas por la migración</p>
              <ul className="service-features">
                <li>✅ Asesoría legal personalizada</li>
                <li>✅ Gestión completa de documentos</li>
                <li>✅ Acompañamiento emocional</li>
                <li>✅ Coordinación de viajes</li>
              </ul>
              <div className="service-details">
                <span className="duration">Duración: 3-6 meses</span>
                <span className="price">Consulta personalizada</span>
              </div>
              <button className="service-cta-btn">Solicitar Información</button>
            </div>

            {/* Servicio 2: Trámite de Visa */}
            <div className="service-card-fullscreen" onClick={closeMenu}>
              <img className="service-icon-large" src={visaIcon} alt="Trámite de Visa" />
              <h3>Trámite de Visa</h3>
              <p>Todos los tipos de visa para Estados Unidos y otros países</p>
              <ul className="service-features">
                <li>🛂 Visa de Turista (B1/B2)</li>
                <li>👨‍👩‍👧‍👦 Visa Familiar (IR1, IR2, F1, F2)</li>
                <li>💼 Visa de Trabajo (H1B, L1)</li>
                <li>🎓 Visa de Estudiante (F1, M1)</li>
              </ul>
              <div className="service-details">
                <span className="duration">Tiempo: 2-12 meses</span>
                <span className="price">Desde $300 USD</span>
              </div>
              <button className="service-cta-btn">Iniciar Trámite</button>
            </div>

            {/* Servicio 3: Trámite de Pasaporte */}
            <div className="service-card-fullscreen" onClick={closeMenu}>
              <img className="service-icon-large" src={pasaporteIcon} alt="Trámite de Pasaporte" />
              <h3>Trámite de Pasaporte</h3>
              <p>Renovación y obtención de pasaportes de manera rápida y segura</p>
              <ul className="service-features">
                <li>📋 Llenado de formularios</li>
                <li>📸 Fotografías oficiales</li>
                <li>🚀 Trámite express disponible</li>
                <li>📦 Entrega a domicilio</li>
              </ul>
              <div className="service-details">
                <span className="duration">15-20 días hábiles</span>
                <span className="price">Express: 3-5 días</span>
              </div>
              <button className="service-cta-btn">Solicitar Cita</button>
            </div>

            {/* Servicio 4: Asesoría Legal */}
            <div className="service-card-fullscreen" onClick={closeMenu}>
              <img className="service-icon-large" src={legalIcon} alt="Asesoría Legal" />
              <h3>ASESORÍA LEGAL</h3>
              <p>Consultoría especializada en derecho migratorio y procesos legales</p>
              <ul className="service-features">
                <li>⚖️ Consulta migratoria</li>
                <li>📜 Preparación de peticiones</li>
                <li>🏛️ Representación legal</li>
                <li>📋 Revisión de casos</li>
              </ul>
              <div className="service-details">
                <span className="duration">Consulta inicial gratuita</span>
                <span className="price">Desde $200 USD</span>
              </div>
              <button className="service-cta-btn">Agendar Consulta</button>
            </div>

            {/* Servicio 5: Todos los Servicios */}
            <div className="service-card-fullscreen large-card" onClick={closeMenu}>
              <img className="service-icon-large" src={catalogoIcon} alt="Catálogo de Servicios" />
              <h3>Ver Todos Nuestros Servicios</h3>
              <p>Explora nuestro catálogo completo de servicios migratorios</p>
              <div className="all-services-preview">
                <div className="service-category-preview">
                  <img className="category-icon" src={catFamiliaIcon} alt="Servicios familiares" />
                  <span>Servicios Familiares</span>
                </div>
                <div className="service-category-preview">
                  <img className="category-icon" src={catDocsIcon} alt="Documentación" />
                  <span>Documentación</span>
                </div>
                <div className="service-category-preview">
                  <img className="category-icon" src={catLegalIcon} alt="Servicios legales" />
                  <span>Servicios Legales</span>
                </div>
                <div className="service-category-preview">
                  <img className="category-icon" src={catViajeIcon} alt="Servicios de viaje" />
                  <span>Servicios de Viaje</span>
                </div>
              </div>
              <button className="service-cta-btn">Ver Catálogo Completo</button>
            </div>

          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default Navbar;
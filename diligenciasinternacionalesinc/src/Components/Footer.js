import React from 'react';

import { FaFacebook, FaTiktok, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'; // Importa los iconos de redes sociales

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Sobre Nosotros</h3>
          <p className="footer-text">
          Somos un corporativo que nace en el 2017 con el objetivo de lograr que más familias se puedan volver a encontrar.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/servicios">Precios</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Contacto</h3>
          <p className="footer-text">
            Email: contacto@diligenciascorp.org<br />
            Teléfono: +1 213 649 6378
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Síguenos</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/share/1KY2xd3dRk/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="icon" />
            </a>
            <a href="https://www.tiktok.com/@diligencias_inc?_t=ZM-8uxDbA5y8b0&_r=1" target="_blank" rel="noopener noreferrer">
              <FaTiktok className="icon" />
            </a>
            <a href="https://www.instagram.com/diligencias_internacionales" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
            <a href="https://www.linkedin.com/posts/diligencias-internacionales-inc_tramita-con-nosotros-tu-visa-activity-7308255433322872832-7eTT?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEiEyckB9fgxtabUs7ijSH6NcJABlsisjwY" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="icon" />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-bottom-text">
          &copy; {new Date().getFullYear()} Diligencias Internacionales Inc.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
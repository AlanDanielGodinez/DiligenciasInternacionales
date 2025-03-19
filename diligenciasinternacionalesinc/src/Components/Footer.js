import React from 'react';

import { FaFacebook, FaTiktok, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'; // Importa los iconos de redes sociales

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Sobre Nosotros</h3>
          <p className="footer-text">
            Somos una empresa dedicada a ofrecer soluciones innovadoras para nuestros clientes.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul className="footer-links">
            <li><a href="/">Inicio</a></li>
            <li><a href="/servicios">Servicios</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Contacto</h3>
          <p className="footer-text">
            Email: info@empresa.com<br />
            Teléfono: +123 456 789
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Síguenos</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTiktok className="icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="icon" />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-bottom-text">
          &copy; {new Date().getFullYear()} Empresa. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
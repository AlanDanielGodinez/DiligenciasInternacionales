import React from 'react';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Sobre Nosotros</h3>
          <p className="footer-text">
          Somos un corporativo que nace en el 2017 con el objetivo de lograr que más familias se puedan <br></br> volver a encontrar.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul className="footer-links">
            <li><a href="/">Inicio</a></li>
            <li><a href="/servicios">Sobre nosotros</a></li>
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
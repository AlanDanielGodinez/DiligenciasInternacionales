import React from 'react';
import Navbar from '../Components/Navbar2';
import Footer from '../Components/Footer';
import ServiceActionButton from '../Components/ServiceActionButton';
import abrazosIcon from '../Images/AMA.png';
import '../Styles/ServiciosDetalle.css';

const AbrazosYMasAbrazos = () => {
  return (
    <>
      <Navbar />
      <div className="servicio-detalle-container">
        <div className="servicio-hero">
          <img src={abrazosIcon} alt="Abrazos y Más Abrazos" className="servicio-hero-icon abrazos-hero-icon" />
          <h1>ABRAZOS Y MÁS ABRAZOS</h1>
          <p className="servicio-hero-subtitle">Programa especializado para reunir familias separadas por la migración</p>
        </div>

        <div className="servicio-contenido">
          <section className="servicio-section">
            <h2>¿Qué es Abrazos y Más Abrazos?</h2>
            <p>
              Nuestro programa "Abrazos y Más Abrazos" está diseñado específicamente para familias que han sido separadas 
              debido a la migración. Entendemos el dolor de la separación y trabajamos incansablemente para reunir a las 
              familias lo más rápido posible.
            </p>
          </section>

          <section className="servicio-section">
            <h2>Servicios Incluidos</h2>
            <div className="caracteristicas-grid">
              <div className="caracteristica-card">
                
                <h3>Asesoría Legal Personalizada</h3>
                <p>Evaluamos cada caso individualmente y diseñamos una estrategia legal específica para su situación.</p>
              </div>
              <div className="caracteristica-card">
                
                <h3>Gestión Completa de Documentos</h3>
                <p>Nos encargamos de todos los trámites y documentación necesaria para el proceso de reunificación.</p>
              </div>
              <div className="caracteristica-card">
                
                <h3>Acompañamiento Emocional</h3>
                <p>Brindamos apoyo emocional durante todo el proceso, entendiendo que es un momento delicado.</p>
              </div>
              <div className="caracteristica-card">
                
                <h3>Coordinación de Viajes</h3>
                <p>Organizamos y coordinamos todos los aspectos del viaje de reunificación.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>Proceso</h2>
            <div className="proceso-timeline">
              <div className="proceso-paso">
                <div className="paso-numero">1</div>
                <h3>Consulta Inicial</h3>
                <p>Evaluación gratuita de su caso y determinación de elegibilidad.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">2</div>
                <h3>Preparación de Documentos</h3>
                <p>Recopilación y preparación de toda la documentación necesaria.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">3</div>
                <h3>Presentación de Petición</h3>
                <p>Envío de la petición a las autoridades correspondientes.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">4</div>
                <h3>Seguimiento y Coordinación</h3>
                <p>Monitoreo constante del proceso y coordinación del reencuentro.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section servicio-cta-section">
            <h2>¿Listo para reunir a tu familia?</h2>
            <p>Contáctanos hoy y comencemos el proceso de reunificación familiar.</p>
            <div className="servicio-info">
             
              <div className="info-item">
                <strong>Consulta inicial:</strong> 50 DLS
              </div>
            </div>
            <ServiceActionButton serviceName="Abrazos y Más Abrazos">
              Solicitar Información
            </ServiceActionButton>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AbrazosYMasAbrazos;

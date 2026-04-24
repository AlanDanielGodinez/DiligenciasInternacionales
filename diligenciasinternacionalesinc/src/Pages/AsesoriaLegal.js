import React from 'react';
import Navbar from '../Components/Navbar2';
import Footer from '../Components/Footer';
import ServiceActionButton from '../Components/ServiceActionButton';
import legalIcon from '../Images/Services/legal.svg';
import '../Styles/ServiciosDetalle.css';

const AsesoriaLegal = () => {
  return (
    <>
      <Navbar />
      <div className="servicio-detalle-container">
        <div className="servicio-hero">
          <img src={legalIcon} alt="Asesoría Legal" className="servicio-hero-icon" />
          <h1>ASESORÍA LEGAL</h1>
          <p className="servicio-hero-subtitle">Consultoría especializada en derecho migratorio y procesos legales</p>
        </div>

        <div className="servicio-contenido">
          <section className="servicio-section">
            <h2>Nuestros Servicios Legales</h2>
            <div className="caracteristicas-grid">
              <div className="caracteristica-card">
                <div className="caracteristica-icono">⚖️</div>
                <h3>Consulta Migratoria</h3>
                <p>Evaluación completa de su situación migratoria y opciones disponibles.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">📜</div>
                <h3>Preparación de Peticiones</h3>
                <p>Elaboración profesional de todo tipo de peticiones migratorias.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">🏛️</div>
                <h3>Representación Legal</h3>
                <p>Representación ante autoridades migratorias y consulados.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">📋</div>
                <h3>Revisión de Casos</h3>
                <p>Análisis detallado de casos rechazados o complejos.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>Áreas de Especialización</h2>
            <div className="areas-especializacion">
              <div className="area-card">
                <h3>Derecho Migratorio Familiar</h3>
                <ul>
                  <li>Peticiones de esposos/as</li>
                  <li>Peticiones de hijos</li>
                  <li>Peticiones de padres</li>
                  <li>Ajuste de estatus</li>
                </ul>
              </div>
              <div className="area-card">
                <h3>Visas de Trabajo</h3>
                <ul>
                  <li>H1B - Trabajadores especializados</li>
                  <li>L1 - Transferencias intracompañía</li>
                  <li>O1 - Personas con habilidades extraordinarias</li>
                  <li>TN - NAFTA</li>
                </ul>
              </div>
              <div className="area-card">
                <h3>Casos Complejos</h3>
                <ul>
                  <li>Apelaciones de denegaciones</li>
                  <li>Waivers de inadmisibilidad</li>
                  <li>Casos de deportación</li>
                  <li>Asilo político</li>
                </ul>
              </div>
              <div className="area-card">
                <h3>Ciudadanía y Naturalización</h3>
                <ul>
                  <li>Solicitud de ciudadanía</li>
                  <li>Preparación para examen</li>
                  <li>Certificados de ciudadanía</li>
                  <li>Pasaportes estadounidenses</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>¿Por Qué Elegir Nuestra Asesoría?</h2>
            <div className="ventajas-lista">
              <div className="ventaja-item">
                <span className="ventaja-icono">✓</span>
                <div>
                  <h4>Experiencia Comprobada</h4>
                  <p>Años de experiencia en derecho migratorio con casos exitosos.</p>
                </div>
              </div>
              <div className="ventaja-item">
                <span className="ventaja-icono">✓</span>
                <div>
                  <h4>Atención Personalizada</h4>
                  <p>Cada caso recibe atención individual y estrategia personalizada.</p>
                </div>
              </div>
              <div className="ventaja-item">
                <span className="ventaja-icono">✓</span>
                <div>
                  <h4>Comunicación Constante</h4>
                  <p>Mantenemos informado al cliente en cada etapa del proceso.</p>
                </div>
              </div>
              <div className="ventaja-item">
                <span className="ventaja-icono">✓</span>
                <div>
                  <h4>Tarifas Transparentes</h4>
                  <p>Sin costos ocultos, presupuesto claro desde el inicio.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="servicio-section servicio-cta-section">
            <h2>¿Necesita asesoría legal migratoria?</h2>
            <p>Agenda tu consulta inicial gratuita y resuelve todas tus dudas.</p>
            <div className="servicio-info">
              
              <div className="info-item">
                <strong>Servicio inical desde:</strong> $50 USD
              </div>
              <div className="info-item">
                <strong>Modalidad:</strong> Presencial o virtual
              </div>
            </div>
            <ServiceActionButton serviceName="Asesoría Legal">
              Agendar Consulta
            </ServiceActionButton>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AsesoriaLegal;

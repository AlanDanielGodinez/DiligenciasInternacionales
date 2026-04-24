import React from 'react';
import Navbar from '../Components/Navbar2';
import Footer from '../Components/Footer';
import ServiceActionButton from '../Components/ServiceActionButton';
import visaIcon from '../Images/Services/visa-stamp.svg';
import '../Styles/ServiciosDetalle.css';

const TramiteVisa = () => {
  return (
    <>
      <Navbar />
      <div className="servicio-detalle-container">
        <div className="servicio-hero">
          <img src={visaIcon} alt="Trámite de Visa" className="servicio-hero-icon" />
          <h1>TRÁMITE DE VISA</h1>
          <p className="servicio-hero-subtitle">Todos los tipos de visa para Estados Unidos y otros países</p>
        </div>

        <div className="servicio-contenido">
          <section className="servicio-section">
            <h2>Tipos de Visa que Tramitamos</h2>
            <div className="caracteristicas-grid">
              <div className="caracteristica-card">
                <div className="caracteristica-icono">🛂</div>
                <h3>Visa de Turista (B1/B2)</h3>
                <p>Para viajes de turismo, negocios o tratamiento médico en Estados Unidos.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">👨‍👩‍👧‍👦</div>
                <h3>Visa Familiar (IR1, IR2, F1, F2)</h3>
                <p>Visas basadas en relaciones familiares para reunificación familiar.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">💼</div>
                <h3>Visa de Trabajo (H1B, L1)</h3>
                <p>Para profesionales que han sido contratados por empresas estadounidenses.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">🎓</div>
                <h3>Visa de Estudiante (F1, M1)</h3>
                <p>Para estudiantes aceptados en instituciones educativas de Estados Unidos.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>Nuestro Proceso</h2>
            <div className="proceso-timeline">
              <div className="proceso-paso">
                <div className="paso-numero">1</div>
                <h3>Evaluación de Elegibilidad</h3>
                <p>Determinamos el tipo de visa más apropiado para su situación.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">2</div>
                <h3>Preparación de Documentación</h3>
                <p>Recopilamos y organizamos todos los documentos requeridos.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">3</div>
                <h3>Llenado de Formularios</h3>
                <p>Completamos todos los formularios oficiales con precisión.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">4</div>
                <h3>Agendación de Entrevista</h3>
                <p>Programamos su cita en el consulado y le preparamos para la entrevista.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">5</div>
                <h3>Seguimiento Post-Entrevista</h3>
                <p>Monitoreamos el estatus de su visa hasta la aprobación.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>Requisitos Generales</h2>
            <ul className="requisitos-lista">
              <li>Pasaporte vigente con al menos 6 meses de validez</li>
              <li>Fotografía reciente tamaño pasaporte</li>
              <li>Comprobantes de solvencia económica</li>
              <li>Documentos que demuestren vínculos con su país de origen</li>
              <li>Formulario DS-160 completado (nosotros lo hacemos por usted)</li>
              <li>Pago de las tasas consulares correspondientes</li>
            </ul>
          </section>

          <section className="servicio-section servicio-cta-section">
            <h2>¿Necesita tramitar su visa?</h2>
            <p>Contáctenos y le ayudaremos a obtener su visa de manera rápida y segura.</p>
            <div className="servicio-info">
              <div className="info-item">
                <strong>Costo:</strong> Desde $300 USD (más tasas consulares)
              </div>
            </div>
            <ServiceActionButton serviceName="Trámite de Visa">
              Iniciar Trámite
            </ServiceActionButton>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TramiteVisa;

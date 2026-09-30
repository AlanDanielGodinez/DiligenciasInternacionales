import React from 'react';
import Navbar from '../Components/Navbar2';
import Footer from '../Components/Footer';
import ServiceActionButton from '../Components/ServiceActionButton';
import pasaporteIcon from '../Images/Services/pasaporte-globe.svg';
import '../Styles/ServiciosDetalle.css';

const TramitePasaporte = () => {
  return (
    <>
      <Navbar />
      <div className="servicio-detalle-container">
        <div className="servicio-hero">
          <img src={pasaporteIcon} alt="Trámite de Pasaporte" className="servicio-hero-icon" />
          <h1>TRÁMITE DE PASAPORTE</h1>
          <p className="servicio-hero-subtitle">Renovación y obtención de pasaportes de manera rápida y segura</p>
        </div>

        <div className="servicio-contenido">
          <section className="servicio-section">
            <h2>Servicios de Pasaporte</h2>
            <div className="caracteristicas-grid">
              <div className="caracteristica-card">
                <div className="caracteristica-icono">📋</div>
                <h3>Llenado de Formularios</h3>
                <p>Completamos todos los formularios oficiales sin errores para evitar rechazos.</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">📸</div>
                <h3>Fotografías Oficiales</h3>
                <p>Tomamos las fotografías con las especificaciones exactas requeridas.</p>
              </div>
              <div className="caracteristica-card">
                <h3>Trámite Express</h3>
                <p>Servicio acelerado disponible para urgencias (3-5 días hábiles).</p>
              </div>
              <div className="caracteristica-card">
                <div className="caracteristica-icono">📦</div>
                <h3>Entrega a Domicilio</h3>
                <p>Reciba su pasaporte de manera segura en la comodidad de su hogar.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>Tipos de Trámite</h2>
            <div className="tipos-tramite">
              <div className="tramite-opcion">
                <h3>Primera Vez</h3>
                <p>Para quienes solicitan su pasaporte por primera vez.</p>
                <ul>
                  <li>Acta de nacimiento original</li>
                  <li>Identificación oficial</li>
                  <li>CURP</li>
                  <li>Comprobante de domicilio</li>
                </ul>
              </div>
              <div className="tramite-opcion">
                <h3>Renovación</h3>
                <p>Para renovar un pasaporte vencido o por vencer.</p>
                <ul>
                  <li>Pasaporte anterior</li>
                  <li>Identificación oficial vigente</li>
                  <li>Comprobante de domicilio</li>
                </ul>
              </div>
              <div className="tramite-opcion">
                <h3>Menores de Edad</h3>
                <p>Trámite especial para niños y adolescentes.</p>
                <ul>
                  <li>Acta de nacimiento</li>
                  <li>CURP</li>
                  <li>Presencia de ambos padres o tutores</li>
                  <li>Identificaciones de los padres</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="servicio-section">
            <h2>Proceso de Trámite</h2>
            <div className="proceso-timeline">
              <div className="proceso-paso">
                <div className="paso-numero">1</div>
                <h3>Recopilación de Documentos</h3>
                <p>Verificamos que tenga todos los documentos necesarios.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">2</div>
                <h3>Llenado de Solicitud</h3>
                <p>Completamos el formato oficial sin errores.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">3</div>
                <h3>Toma de Fotografía</h3>
                <p>Realizamos la fotografía con especificaciones oficiales.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">4</div>
                <h3>Entrega en Consulado</h3>
                <p>Enviamos su solicitud al consulado correspondiente.</p>
              </div>
              <div className="proceso-paso">
                <div className="paso-numero">5</div>
                <h3>Recepción de Pasaporte</h3>
                <p>Le entregamos su pasaporte listo para usar.</p>
              </div>
            </div>
          </section>

          <section className="servicio-section servicio-cta-section">
            <h2>¿Necesita su pasaporte?</h2>
            <p>Tramítelo con nosotros de forma rápida y sin complicaciones.</p>
            <div className="servicio-info">
              <div className="info-item">
                <strong>Vigencia:</strong> 3, 6 o 10 años (según edad)
              </div>
            </div>
            <ServiceActionButton serviceName="Trámite de Pasaporte">
              Solicitar Cita
            </ServiceActionButton>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TramitePasaporte;

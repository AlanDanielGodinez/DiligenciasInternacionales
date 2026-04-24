import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar2';
import Footer from '../Components/Footer';
import abrazosIcon from '../Images/Services/abrazos.svg';
import visaIcon from '../Images/Services/visa-stamp.svg';
import pasaporteIcon from '../Images/Services/pasaporte-globe.svg';
import legalIcon from '../Images/Services/legal.svg';
import '../Styles/ServiciosDetalle.css';

const CatalogoServicios = () => {
  const servicios = [
    {
      id: 1,
      nombre: 'Abrazos y Más Abrazos',
      descripcion: 'Programa especializado para reunir familias separadas por la migración',
      icono: abrazosIcon,
      link: '/servicios/abrazos',
      caracteristicas: ['Reunificación familiar', 'Asesoría legal', 'Gestión completa', 'Acompañamiento emocional']
    },
    {
      id: 2,
      nombre: 'Trámite de Visa',
      descripcion: 'Todos los tipos de visa para Estados Unidos y otros países',
      icono: visaIcon,
      link: '/servicios/visa',
      caracteristicas: ['Visa de turista', 'Visa familiar', 'Visa de trabajo', 'Visa de estudiante']
    },
    {
      id: 3,
      nombre: 'Trámite de Pasaporte',
      descripcion: 'Renovación y obtención de pasaportes de manera rápida y segura',
      icono: pasaporteIcon,
      link: '/servicios/pasaporte',
      caracteristicas: ['Primera vez', 'Renovación', 'Trámite express', 'Entrega a domicilio']
    },
    {
      id: 4,
      nombre: 'Asesoría Legal',
      descripcion: 'Consultoría especializada en derecho migratorio y procesos legales',
      icono: legalIcon,
      link: '/servicios/asesoria-legal',
      caracteristicas: ['Consulta migratoria', 'Representación legal', 'Casos complejos', 'Naturalización']
    }
  ];

  return (
    <>
      <Navbar />
      <div className="catalogo-container">
        <div className="catalogo-hero">
          <h1>CATÁLOGO DE SERVICIOS</h1>
          <p>Explora todos nuestros servicios migratorios especializados</p>
        </div>

        <div className="catalogo-contenido">
          <section className="catalogo-intro">
            <h2>Servicios Migratorios Integrales</h2>
            <p>
              En Diligencias Internacionales ofrecemos una amplia gama de servicios migratorios diseñados 
              para ayudarte en cada etapa de tu proceso. Nuestro equipo de expertos está comprometido en 
              brindarte la mejor asesoría y acompañamiento.
            </p>
          </section>

          <div className="servicios-catalogo-grid">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="servicio-catalogo-card">
                <img src={servicio.icono} alt={servicio.nombre} className="servicio-catalogo-icon" />
                <h3>{servicio.nombre}</h3>
                <p className="servicio-descripcion">{servicio.descripcion}</p>
                <ul className="servicio-caracteristicas-lista">
                  {servicio.caracteristicas.map((caracteristica, index) => (
                    <li key={index}>✓ {caracteristica}</li>
                  ))}
                </ul>
                <Link to={servicio.link} className="ver-mas-button">
                  Ver Detalles
                </Link>
              </div>
            ))}
          </div>

          <section className="catalogo-garantias">
            <h2>¿Por Qué Elegirnos?</h2>
            <div className="garantias-grid">
              <div className="garantia-item">
                <div className="garantia-numero">01</div>
                <h3>Experiencia Comprobada</h3>
                <p>Años de experiencia ayudando a familias a cumplir sus sueños migratorios.</p>
              </div>
              <div className="garantia-item">
                <div className="garantia-numero">02</div>
                <h3>Atención Personalizada</h3>
                <p>Cada cliente recibe atención individual adaptada a sus necesidades específicas.</p>
              </div>
              <div className="garantia-item">
                <div className="garantia-numero">03</div>
                <h3>Procesos Transparentes</h3>
                <p>Claridad en cada paso del proceso y costos transparentes desde el inicio.</p>
              </div>
              <div className="garantia-item">
                <div className="garantia-numero">04</div>
                <h3>Resultados Exitosos</h3>
                <p>Alto índice de aprobación en trámites gracias a nuestra experiencia y dedicación.</p>
              </div>
            </div>
          </section>

          <section className="catalogo-cta">
            <h2>¿No encuentras lo que buscas?</h2>
            <p>Contáctanos y con gusto te asesoraremos sobre el servicio que necesitas.</p>
            <Link to="/contacto" className="contacto-button">
              Contactar Ahora
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CatalogoServicios;

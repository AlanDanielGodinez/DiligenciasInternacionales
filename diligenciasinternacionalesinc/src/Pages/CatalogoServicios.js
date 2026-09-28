import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar2';
import Footer from '../Components/Footer';
import abrazosIcon from '../Images/Services/abrazos.svg';
import visaIcon from '../Images/Services/visa-stamp.svg';
import pasaporteIcon from '../Images/Services/pasaporte-globe.svg';
import legalIcon from '../Images/Services/legal.svg';
import '../Styles/ServiciosDetalle.css';

const servicios = [
  {
    id: 1,
    nombre: 'Abrazos y Más Abrazos',
    descripcion: 'Programa especializado para reunir familias separadas por la migración.',
    icono: abrazosIcon,
    link: '/servicios/abrazos',
    categoria: 'Reunificación familiar',
    caracteristicas: ['Reunificación familiar', 'Asesoría legal', 'Gestión completa', 'Acompañamiento personalizado']
  },
  {
    id: 2,
    nombre: 'Trámite de Visa',
    descripcion: 'Acompañamiento para distintos tipos de visa para Estados Unidos y otros países.',
    icono: visaIcon,
    link: '/servicios/visa',
    categoria: 'Documentación migratoria',
    caracteristicas: ['Visa de turista', 'Visa familiar', 'Visa de trabajo', 'Visa de estudiante']
  },
  {
    id: 3,
    nombre: 'Trámite de Pasaporte',
    descripcion: 'Orientación para la renovación y obtención de pasaportes de forma ordenada y segura.',
    icono: pasaporteIcon,
    link: '/servicios/pasaporte',
    categoria: 'Documentación migratoria',
    caracteristicas: ['Primera vez', 'Renovación', 'Revisión de requisitos', 'Seguimiento del trámite']
  },
  {
    id: 4,
    nombre: 'Asesoría Legal',
    descripcion: 'Consultoría especializada en derecho migratorio y procesos legales.',
    icono: legalIcon,
    link: '/servicios/asesoria-legal',
    categoria: 'Asesoría especializada',
    caracteristicas: ['Consulta migratoria', 'Representación legal', 'Casos complejos', 'Naturalización']
  }
];

const categorias = [...new Set(servicios.map((servicio) => servicio.categoria))];

const CatalogoServicios = () => (
  <>
    <Navbar />
    <main className="catalogo-container">
      <header className="catalogo-hero">
        <p className="catalogo-hero-etiqueta">Diligencias Internacionales</p>
        <h1>CATÁLOGO DE SERVICIOS</h1>
        <p>Encuentra el acompañamiento adecuado para tu proceso migratorio.</p>
      </header>

      <div className="catalogo-contenido">
        <section className="catalogo-intro">
          <h2>Servicios migratorios integrales</h2>
          <p>
            Conoce todos nuestros servicios y revisa el detalle de cada proceso. Nuestro equipo brinda
            orientación personalizada, seguimiento y claridad durante cada etapa.
          </p>
        </section>

        <div className="catalogo-categorias">
          {categorias.map((categoria) => (
            <section key={categoria} className="catalogo-categoria">
              <div className="catalogo-categoria-encabezado">
                <span>Servicios</span>
                <h2>{categoria}</h2>
              </div>

              <div className="servicios-catalogo-grid">
                {servicios
                  .filter((servicio) => servicio.categoria === categoria)
                  .map((servicio) => (
                    <article key={servicio.id} className="servicio-catalogo-card">
                      <img
                        src={servicio.icono}
                        alt=""
                        aria-hidden="true"
                        className="servicio-catalogo-icon"
                      />
                      <div className="servicio-catalogo-contenido">
                        <h3>{servicio.nombre}</h3>
                        <p className="servicio-descripcion">{servicio.descripcion}</p>
                        <ul className="servicio-caracteristicas-lista">
                          {servicio.caracteristicas.map((caracteristica) => (
                            <li key={caracteristica}>{caracteristica}</li>
                          ))}
                        </ul>
                        <Link to={servicio.link} className="ver-mas-button">
                          Ver detalles
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <section className="catalogo-garantias">
          <h2>¿Por qué elegirnos?</h2>
          <div className="garantias-grid">
            {[
              ['01', 'Experiencia comprobada', 'Experiencia ayudando a familias a avanzar en sus procesos migratorios.'],
              ['02', 'Atención personalizada', 'Cada cliente recibe orientación adaptada a las necesidades de su caso.'],
              ['03', 'Procesos transparentes', 'Claridad en cada etapa del proceso y en los requisitos necesarios.'],
              ['04', 'Acompañamiento continuo', 'Seguimiento cercano para que conozcas el avance de tu trámite.']
            ].map(([numero, titulo, descripcion]) => (
              <article key={numero} className="garantia-item">
                <div className="garantia-numero">{numero}</div>
                <h3>{titulo}</h3>
                <p>{descripcion}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="catalogo-cta">
          <h2>¿Necesitas orientación?</h2>
          <p>Cuéntanos sobre tu caso y te ayudaremos a identificar el servicio adecuado.</p>
          <Link to="/contacto" className="contacto-button">
            Contactar ahora
          </Link>
        </section>
      </div>
    </main>
    <Footer />
  </>
);

export default CatalogoServicios;

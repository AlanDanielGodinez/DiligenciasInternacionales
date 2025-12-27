import React, { useEffect } from "react";
import { MdFamilyRestroom } from "react-icons/md";
import { FaPlane, FaPassport, FaHandsHelping, FaUsers, FaGlobeAmericas } from "react-icons/fa";
import backgroundImage from "../Images/PI.jpg";
import fixedImage from "../Images/Carrucel/carrucel5.jpg";
import LogoAMA from "../Images/4.png";
import backgroundImage4 from "../Images/Carrucel/carrucel4.jpg";
import imageD from "../Images/Carrucel/carrucel6.jpg";
import Footer from "../Components/Footer";
import ServiceCard from "../Components/ServiceCard";
import TestimonialCard from "../Components/TestimonialCard";
import Navbar from "../Components/Navbar2";

// Importa las imágenes para las cards
import imageA from "../Images/Carrucel/carrucel1.jpg";
import imageB from "../Images/Carrucel/carrucel2.jpg";
import imageC from "../Images/Carrucel/carrucel3.jpg";

const Dashboard = () => {
  
  const servicios = [
    {
      title: "Reencuentros familiares",
      description: "Te ayudamos con todo el proceso legal para reunir familias separadas por la migración",
      icon: <MdFamilyRestroom className="service-icon" />,
      color: "var(--color-accent)"
    },
    {
      title: "Tramite de visa",
      description: "Aprobación segura y sin estrés con nuestro soporte prioritario",
      icon: <FaPassport className="service-icon" />,
      color: "var(--color-secondary)"
    },
    {
      title: "Tramite de pasaporte",
      description: "Guiamos paso a paso para que no pierdas tiempo en citas",
      icon: <FaGlobeAmericas className="service-icon" />,
      color: "var(--color-primary)"
    }
  ];

  // Testimonios con videos y imágenes como fallback
  const testimonios = [
    {
      type: 'video',
      video: '/videos/IMG_3467.MOV',
      image: imageA,
      quote: "Gracias a su ayuda pude reencontrarme con mi hijo después de 8 años",
      name: "María G."
    },
    {
      type: 'video',
      video: '/videos/testimonio-carlos.mp4',
      image: imageB,
      quote: "El proceso de visa fue mucho más fácil con su asesoría experta",
      name: "Carlos M."
    },
    {
      type: 'video',
      video: '/videos/testimonio-laura.mp4',
      image: imageC,
      quote: "Nunca imaginé que podría resolver todo tan rápido y sin complicaciones",
      name: "Laura T."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar/>
      
      {/* Hero Section */}
      <section 
        className="hero-section animate-on-scroll" 
        style={{ backgroundImage: `linear-gradient(rgba(66, 70, 88, 0.7), rgba(32, 36, 51, 0.7)), url(${backgroundImage})` }}
      >
        <div className="hero-content">
          <h1>ÚNETE AL PROGRAMA </h1>
          <p className="hero-subtitle">ABRAZOS Y MAS ABRAZOS</p>
          <button className="cta-button">Conoce más</button>
          <img src={LogoAMA} alt="Logo AMA" className="LogoAMA" />
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="split-container animate-on-scroll">
          <div className="image-container">
            <img src={fixedImage} alt="Familia reunida" className="about-image" />
          </div>
          <div className="text-container">
            <h2>Cada día nos esforzamos por reunir familias</h2>
            <p>
              En Diligencias Internacionales, trabajamos con pasión y compromiso para 
              ayudar a las familias separadas por la migración a volverse a encontrar. 
              Nuestro equipo de expertos guía cada caso con empatía y profesionalismo.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section animate-on-scroll">
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Soluciones personalizadas para tus necesidades migratorias</p>
        </div>
        
        <div className="services-grid">
          {servicios.map((service, index) => (
            <ServiceCard 
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              color={service.color}
            />
          ))}
        </div>
      </section>

      {/* EXPERIENCIA AMA Section - OPCIÓN 1: TEXTO PLANO */}
      <section className="countries-section animate-on-scroll">
        <div className="section-header">
          <h2>EXPERIENCIA AMA</h2>
        </div>
        
        {/* Contenedor para mision, video y vision lado a lado */}
        <div className="video-mission-container">
          
          {/* Misión a la izquierda */}
          <div className="mission-text">
            <h3>MISIÓN</h3>
            <p>
              Facilitar los procesos a nuestros solicitantes por medio del asesoramiento 
              y gestión en trámites consulares, turísticos y migratorios, otorgando 
              confianza, seguridad y profesionalismo durante la ejecución.
            </p>
          </div>
          
          {/* Video en el centro */}
          <div className="video-container">
            <video 
              className="experience-video" 
              controls
              poster={LogoAMA}
              preload="metadata"
              playsInline
              controlsList="nodownload"
              disablePictureInPicture
            >
              <source src="/videos/MVI_5659.mp4" type="video/mp4" />
              <source src="/videos/MVI_5659.MOV" type="video/quicktime" />
              
              Tu navegador no soporta videos HTML5. 
              <a href="/videos/MVI_5659.mp4">Descargar el video</a>
            </video>
          </div>
          
          {/* Visión a la derecha */}
          <div className="vision-text">
            <h3>VISIÓN</h3>
            <p>
              Ser la empresa con más aprobaciones en México y todo Centroamérica, 
              con la finalidad de romper las barreras que se han presentado a países 
              latinoamericanos, fomentando la migración segura y legal.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section animate-on-scroll">
        <div className="split-container reverse">
          <div className="text-container">
            <h2>Ofrecemos servicios personalizados</h2>
            <p>
              Cada familia es única, por eso creamos soluciones a medida para 
              que tu experiencia sea sin complicaciones. Nuestros asesores están 
              disponibles para guiarte en cada paso del proceso.
            </p>
            <ul className="features-list">
              <li><FaHandsHelping /> Asesoría legal especializada</li>
              <li><FaUsers /> Atención personalizada</li>
              <li><FaPlane /> Gestión de viajes y documentos</li>
            </ul>
          </div>
          <div className="image-container">
            <img src={imageD} alt="Servicios personalizados" className="feature-image" />
          </div>
        </div>
      </section>

      {/* Testimonials Section con Videos */}
      <section 
        className="testimonials-section animate-on-scroll"
        style={{ backgroundImage: `linear-gradient(rgba(13, 26, 78, 0.8), rgba(13, 26, 78, 0.8)), url(${backgroundImage4})` }}
      >
        <div className="section-header">
          <h2>Testimonios de la gente</h2>
        </div>
        
        <div className="testimonials-grid">
          {testimonios.map((testimonio, index) => (
            <TestimonialCard 
              key={index}
              type={testimonio.type}
              video={testimonio.video}
              image={testimonio.image}
              quote={testimonio.quote}
              name={testimonio.name}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <h2>¿Listo para reunirte con tu familia?</h2>
        <p>Nuestros asesores pueden crear un plan a medida para tu caso</p>
        <button className="cta-button">Iniciar sesión</button>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
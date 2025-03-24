import React, { useEffect } from "react";
import { FaPlane, FaPassport, FaHeart, FaHandsHelping, FaUsers, FaGlobeAmericas } from "react-icons/fa";
import backgroundImage from "../Images/PI.jpg";
import fixedImage from "../Images/Carrucel/carrucel5.jpg";
import backgroundImage4 from "../Images/Carrucel/carrucel4.jpg";
import imageD from "../Images/Carrucel/carrucel6.jpg";
import Footer from "../Components/Footer";
import ServiceCard from "../Components/ServiceCard";
import TestimonialCard from "../Components/TestimonialCard";
import InfiniteScroll from "../Components/InfiniteScroll";

// Importa las imágenes para las cards
import imageA from "../Images/Carrucel/carrucel1.jpg";
import imageB from "../Images/Carrucel/carrucel2.jpg";
import imageC from "../Images/Carrucel/carrucel3.jpg";

// Importa las banderas de los países
import usaFlag from "../Images/Flags/usa.png";
import mexicoFlag from "../Images/Flags/mexico.webp";
import hondurasFlag from "../Images/Flags/honduras.png";
import elSalvadorFlag from "../Images/Flags/salvador.png";
import guatemalaFlag from "../Images/Flags/guatemala.png";

const Dashboard = () => {
  const banderas = [
    { content: <img src={usaFlag} alt="Estados Unidos" className="bandera-carrusel" /> },
    { content: <img src={mexicoFlag} alt="México" className="bandera-carrusel" /> },
    { content: <img src={hondurasFlag} alt="Honduras" className="bandera-carrusel" /> },
    { content: <img src={elSalvadorFlag} alt="El Salvador" className="bandera-carrusel" /> },
    { content: <img src={guatemalaFlag} alt="Guatemala" className="bandera-carrusel" /> },
  ];

  const servicios = [
    {
      title: "Reencuentros familiares",
      description: "Te ayudamos con todo el proceso legal para reunir familias separadas por la migración",
      icon: <FaHeart className="service-icon" />,
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

  const testimonios = [
    {
      image: imageA,
      quote: "Gracias a su ayuda pude reencontrarme con mi hijo después de 8 años",
      name: "María G."
    },
    {
      image: imageB,
      quote: "El proceso de visa fue mucho más fácil con su asesoría experta",
      name: "Carlos M."
    },
    {
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
      {/* Hero Section */}
      <section 
        className="hero-section animate-on-scroll" 
        style={{ backgroundImage: `linear-gradient(rgba(13, 26, 78, 0.7), rgba(13, 26, 78, 0.7)), url(${backgroundImage})` }}
      >
        <div className="hero-content">
          <h1>ÚNETE AL PROGRAMA AMA</h1>
          <p className="hero-subtitle">Abrazos... y más abrazos</p>
          <button className="cta-button">Conoce más</button>
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

      {/* Testimonials Section */}
      <section 
        className="testimonials-section animate-on-scroll"
        style={{ backgroundImage: `linear-gradient(rgba(13, 26, 78, 0.8), url(${backgroundImage4})` }}
      >
        <div className="section-header">
          <h2>Historias de Éxito</h2>
          <p>Lo que dicen las familias que hemos ayudado</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonios.map((testimonio, index) => (
            <TestimonialCard 
              key={index}
              image={testimonio.image}
              quote={testimonio.quote}
              name={testimonio.name}
            />
          ))}
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

      {/* Countries Section */}
      <section className="countries-section animate-on-scroll">
        <div className="section-header">
          <h2>Tu familia importa más</h2>
          <p>Aquí no hay pretextos para reunirte con tus seres queridos</p>
        </div>
        
        <div className="flags-container">
          <InfiniteScroll
            items={banderas}
            isTilted={true}
            tiltDirection="left"
            autoplay={true}
            autoplaySpeed={0.1}
            pauseOnHover={true}
          />
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
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdFamilyRestroom } from "react-icons/md";
import { FaPlane, FaPassport, FaHandsHelping, FaUsers, FaGlobeAmericas } from "react-icons/fa";
import backgroundImage from "../Images/PI.jpg";
import LogoAMA from "../Images/4.png";
import backgroundImage4 from "../Images/Carrucel/carrucel4.jpg";
import imageD from "../Images/Carrucel/carrucel6.jpg";
import Footer from "../Components/Footer";
import ServiceCard from "../Components/ServiceCard";
import TestimonialCard from "../Components/TestimonialCard";
import Navbar from "../Components/Navbar2";
import { fetchNewsItems } from "../services/noticias.service";

// Importa las imágenes para las cards
import imageA from "../Images/Carrucel/carrucel1.jpg";
import imageB from "../Images/Carrucel/carrucel2.jpg";
import imageC from "../Images/Carrucel/carrucel3.jpg";

const formatNewsDate = (date) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate);
};

const getVisibleNewsCount = () => {
  if (window.matchMedia('(max-width: 600px)').matches) return 1;
  if (window.matchMedia('(max-width: 960px)').matches) return 2;
  return 3;
};

const Dashboard = () => {
  
  const servicios = [
    {
      title: "Reencuentros familiares",
      description: "Te ayudamos con todo el proceso legal para reunir familias separadas por la migración",
      icon: <MdFamilyRestroom className="service-icon" />,
      color: "#ff9e1c",
      link: "/servicios/abrazos"
    },
    {
      title: "Tramite de visa",
      description: "Aprobación segura y sin estrés con nuestro soporte prioritario",
      icon: <FaPassport className="service-icon" />,
      color: "#ed3b89",
      link: "/servicios/visa"
    },
    {
      title: "Tramite de pasaporte",
      description: "Guiamos paso a paso para que no pierdas tiempo en citas",
      icon: <FaGlobeAmericas className="service-icon" />,
      color: "#1f96b8",
      link: "/servicios/pasaporte"
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

  // Fallback informativo. Conectar este array con el backend o una API
  // cuando exista un feed oficial de noticias validado.
  const newsItems = [
    {
      image: imageA,
      title: "Reencuentros que inspiran",
      description: "Conoce cómo acompañamos a las familias durante sus procesos de reunificación.",
      date: "Contenido informativo",
      source: "Diligencias Internacionales",
      url: null,
      isOfficial: false
    },
    {
      image: imageB,
      title: "Orientación para tus trámites",
      description: "Recomendaciones generales para preparar documentos y dar seguimiento a cada etapa.",
      date: "Contenido informativo",
      source: "Diligencias Internacionales",
      url: null,
      isOfficial: false
    },
    {
      image: imageC,
      title: "Acompañamiento personalizado",
      description: "Nuestro equipo analiza cada caso para ofrecer una ruta de atención clara y ordenada.",
      date: "Contenido informativo",
      source: "Diligencias Internacionales",
      url: null,
      isOfficial: false
    }
  ];

  const [officialNews, setOfficialNews] = useState([]);
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const [visibleNewsCount, setVisibleNewsCount] = useState(getVisibleNewsCount);
  const [isNewsPaused, setIsNewsPaused] = useState(false);
  const hasOfficialNews = officialNews.length > 0;
  const displayedNews = hasOfficialNews ? officialNews : newsItems;
  const canRotateNews = displayedNews.length > visibleNewsCount;
  const visibleNews = Array.from(
    { length: Math.min(visibleNewsCount, displayedNews.length) },
    (_, offset) => displayedNews[(newsIndex + offset) % displayedNews.length]
  );

  const showPreviousNews = () => {
    setNewsIndex((currentIndex) => (
      (currentIndex - 1 + displayedNews.length) % displayedNews.length
    ));
  };

  const showNextNews = () => {
    setNewsIndex((currentIndex) => (currentIndex + 1) % displayedNews.length);
  };

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      setLoadingNoticias(true);

      try {
        const items = await fetchNewsItems();
        if (isMounted) setOfficialNews(items);
      } catch {
        if (isMounted) setOfficialNews([]);
      } finally {
        if (isMounted) setLoadingNoticias(false);
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const updateVisibleNewsCount = () => {
      setVisibleNewsCount(getVisibleNewsCount());
    };

    window.addEventListener('resize', updateVisibleNewsCount);
    return () => window.removeEventListener('resize', updateVisibleNewsCount);
  }, []);

  useEffect(() => {
    setNewsIndex(0);
  }, [officialNews]);

  useEffect(() => {
    if (!canRotateNews || isNewsPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setNewsIndex((currentIndex) => (currentIndex + 1) % displayedNews.length);
    }, 6000);
    return () => window.clearInterval(intervalId);
  }, [canRotateNews, displayedNews.length, isNewsPaused]);

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

      <section className="home-news-section animate-on-scroll">
        <div className="section-header">
          <h2>Noticias</h2>
          <p>Información útil y novedades relevantes para tus procesos.</p>
        </div>

        {!loadingNoticias && !hasOfficialNews && (
          <p className="home-news-notice">
            No hay feed oficial configurado. Se muestran noticias informativas.
          </p>
        )}
        {loadingNoticias && (
          <p className="home-news-notice">Cargando noticias oficiales...</p>
        )}

        <div
          className="home-news-carousel"
          onMouseEnter={() => setIsNewsPaused(true)}
          onMouseLeave={() => setIsNewsPaused(false)}
        >
          <div
            className="home-news-grid"
            style={{ '--home-news-columns': Math.min(visibleNewsCount, displayedNews.length) }}
            aria-live="polite"
          >
            {visibleNews.map((newsItem, slotIndex) => (
              <article
                key={`${newsItem.url || newsItem.title}-${slotIndex}`}
                className="home-news-card"
              >
                {newsItem.image && <img src={newsItem.image} alt="" className="home-news-image" />}
                <div className="home-news-content">
                  <div className="home-news-meta">
                    <span>{formatNewsDate(newsItem.date)}</span>
                    <span>{newsItem.source}</span>
                  </div>
                  {newsItem.isOfficial && <span className="home-news-official">Fuente oficial</span>}
                  <h3>{newsItem.title}</h3>
                  <p>{newsItem.description}</p>
                  {newsItem.url && (
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-news-link"
                    >
                      Leer más
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {canRotateNews && (
            <>
              <button
                type="button"
                className="home-news-control home-news-control-previous"
                onClick={showPreviousNews}
                aria-label="Ver noticias anteriores"
              >
                &#8249;
              </button>
              <button
                type="button"
                className="home-news-control home-news-control-next"
                onClick={showNextNews}
                aria-label="Ver noticias siguientes"
              >
                &#8250;
              </button>
              <div className="home-news-dots" aria-label="Paginación de noticias">
                {displayedNews.map((newsItem, index) => (
                  <button
                    type="button"
                    key={newsItem.url || `${newsItem.title}-${index}`}
                    className={`home-news-dot ${index === newsIndex ? 'active' : ''}`}
                    onClick={() => setNewsIndex(index)}
                    aria-label={`Ir a la noticia ${index + 1}`}
                    aria-current={index === newsIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="services-section home-services-section animate-on-scroll">
        <div className="section-header">
          <h2>Servicios destacados</h2>
          <p>Accesos rápidos a los procesos más consultados.</p>
        </div>
        
        <div className="services-grid">
          {servicios.map((service) => (
            <Link key={service.title} to={service.link} className="home-service-link">
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={service.icon}
                color={service.color}
              />
            </Link>
          ))}
        </div>
        <div className="home-services-action">
          <Link to="/servicios/catalogo" className="home-catalog-button">
            Ver catálogo completo
          </Link>
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

import React, { useEffect } from "react";
import { FaPlane, FaPassport, FaHeart } from "react-icons/fa"; // Importamos los iconos
import backgroundImage from "../Images/PI.jpg"; // Importa la imagen de fondo
import fixedImage from "../Images/Carrucel/carrucel5.jpg"; // Importa la imagen fija
import backgroundImage4 from "../Images/Carrucel/carrucel4.jpg"; // Importa la imagen de fondo para el contenedor 4
import imageD from "../Images/Carrucel/carrucel6.jpg"; // Importa la imagen para el contenedor 5
import Footer from "../Components/Footer";
import Card from "../Components/Card"

// Importa las imágenes para el contenedor 3
import imageA from "../Images/Carrucel/carrucel1.jpg";
import imageB from "../Images/Carrucel/carrucel2.jpg";
import imageC from "../Images/Carrucel/carrucel3.jpg";

// Importa las banderas de los países
import usaFlag from "../Images/Flags/usa.png";
import mexicoFlag from "../Images/Flags/mexico.webp";
import hondurasFlag from "../Images/Flags/honduras.png";
import elSalvadorFlag from "../Images/Flags/salvador.png";
import guatemalaFlag from "../Images/Flags/guatemala.png";

// Importa el componente InfiniteScroll
import InfiniteScroll from "../Components/InfiniteScroll";

const Dashboard = () => {
  // Array de banderas para el carrusel
  const banderas = [
    { content: <img src={usaFlag} alt="Estados Unidos" className="bandera-carrusel" /> },
    { content: <img src={mexicoFlag} alt="México" className="bandera-carrusel" /> },
    { content: <img src={hondurasFlag} alt="Honduras" className="bandera-carrusel" /> },
    { content: <img src={elSalvadorFlag} alt="El Salvador" className="bandera-carrusel" /> },
    { content: <img src={guatemalaFlag} alt="Guatemala" className="bandera-carrusel" /> },
  ];

  // Efecto para activar animaciones al hacer scroll
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".dashboard-unique-container, .dashboard-unique-split, .imagen-item, .texto-item, .titulo-sobrepuesto"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1, // Activa la animación cuando el 10% del elemento es visible
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    // Limpia el observer al desmontar el componente
    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="dashboard-unique">
      {/* Contenedor 1 con imagen de fondo y texto */}
      <div
        className="dashboard-unique-container"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="dashboard-unique-text">
          <p className="Titulo-Dashboard">ÚNETE AL PROGRAMA AMA</p>
          <p className="Subtitulo-Dashboard">Abrazos... y más abrazos</p>
        </div>
      </div>

      {/* Contenedor 2 con imagen fija y texto */}
      <div className="dashboard-unique-container">
        <div className="dashboard-unique-split">
          {/* Mitad izquierda: Imagen fija */}
          <div className="dashboard-unique-image">
            <img src={fixedImage} alt="Imagen fija" className="fixed-image" />
          </div>
          {/* Mitad derecha: Texto */}
          <div className="dashboard-unique-text-container">
            <h2>Cada día nos esforzamos y damos lo mejor de nosotros para lograr que más familias puedan volverse a abrazar.</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-unique-container">
        <div className="contenedor-3">
          {/* Título centrado */}
          <h2 className="titulo-contenedor-3">¡Con esfuerzo y esperanza todo es posible!</h2>

          {/* Contenedor de cards */}
          <div className="imagenes-contenedor-3">
            {/* Card 1 */}
            <Card image={imageA} text="Reuniendo familias" icon="❤️" />
            <Card image={imageB} text="Visa asegurada" icon="😊" />
            <Card image={imageC} text="Juntos como hermanos" icon="🤝" />
          </div>
        </div>
      </div>

      {/* Contenedor 4 con imagen de fondo y mini contenedores de texto */}
      <div
        className="dashboard-unique-container"
        style={{ backgroundImage: `url(${backgroundImage4})`, backgroundColor: "rgba(0, 0, 0, 0.5)", backgroundBlendMode: "darken" }}
      >
        <div className="contenedor-4">
          {/* Título centrado */}
          <h2 className="titulo-contenedor-4">Mejoramos tus viajes </h2>
          {/* Contenedor de mini contenedores de texto */}
          <div className="textos-contenedor-4">
            {/* Mini contenedor 1 */}
            <div className="texto-item">
              <FaPlane className="icono" /> {/* Icono de compromiso */}
              <h3>Vuelos más baratos</h3>
              <p>Nos comprometemos a brindar un servicio de calidad y a trabajar con pasión por nuestras familias.</p>
            </div>

            {/* Mini contenedor 2 */}
            <div className="texto-item">
              <FaPassport className="icono" /> {/* Icono de transparencia */}
              <h3>Trámites asegurados</h3>
              <p>Creemos en la honestidad y la claridad en cada uno de nuestros procesos.</p>
            </div>

            {/* Mini contenedor 3 */}
            <div className="texto-item">
              <FaHeart className="icono" /> {/* Icono de empatía */}
              <h3>Asesorías gratuitas</h3>
              <p>Ponemos el corazón en cada caso, entendiendo las necesidades de quienes nos buscan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor 5 con imagen a la derecha y texto a la izquierda */}
      <div className="dashboard-unique-container">
        <div className="dashboard-unique-split">
          {/* Mitad izquierda: Texto */}
          <div className="dashboard-unique-text-container">
            <h2>Ofrecemos servicios personalizados para que tu experiencia sea única y sin complicaciones.</h2>
          </div>
          {/* Mitad derecha: Imagen */}
          <div className="dashboard-unique-image">
            <img src={imageD} alt="Imagen fija" className="fixed-image" />
          </div>
        </div>
      </div>

      {/* Contenedor 7 con carrusel de banderas */}
      <div className="dashboard-unique-container" style={{ backgroundColor: "#0d1a4e", position: "relative", height: "100vh" }}>
        {/* Título sobrepuesto */}
        <div className="titulo-sobrepuesto">
          <h2>Aqui no hay pretextos<br></br>Tu familia importa mas </h2>
        </div>

        {/* Carrusel de banderas */}
        <InfiniteScroll
          items={banderas}
          isTilted={true}
          tiltDirection="left"
          autoplay={true}
          autoplaySpeed={0.1}
          autoplayDirection="down"
          pauseOnHover={true}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
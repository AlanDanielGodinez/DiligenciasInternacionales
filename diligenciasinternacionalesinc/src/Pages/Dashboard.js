import React from "react";
 // Importamos el archivo CSS con nombres únicos
import backgroundImage from "../Images/PI.jpg"; // Importa la imagen de fondo
import fixedImage from "../Images/Carrucel/carrucel5.jpg"; // Importa la imagen fija
import backgroundImage4 from "../Images/Carrucel/carrucel4.jpg"; // Importa la imagen de fondo para el contenedor 4

// Importa las imágenes para el contenedor 3
import imageA from "../Images/Carrucel/carrucel1.jpg";
import imageB from "../Images/Carrucel/carrucel2.jpg";
import imageC from "../Images/Carrucel/carrucel3.jpg";

const Dashboard = () => {
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

      {/* Contenedor 3 con título, imágenes y subtítulos */}
      <div className="dashboard-unique-container" style={{ backgroundColor: '#0d1a4e' }}>
        <div className="contenedor-3">
          {/* Título centrado */}
          <h2 className="titulo-contenedor-3">¡Con esfuerzo y esperanza todo es posible!</h2>

          {/* Contenedor de imágenes y subtítulos */}
          <div className="imagenes-contenedor-3">
            {/* Imagen 1 */}
            <div className="imagen-item">
              <img src={imageA} alt="Servicio 1" className="imagen-cuadrada" />
              <p className="subtitulo-imagen">Servicio 1</p>
            </div>

            {/* Imagen 2 */}
            <div className="imagen-item">
              <img src={imageB} alt="Servicio 2" className="imagen-cuadrada" />
              <p className="subtitulo-imagen">Servicio 2</p>
            </div>

            {/* Imagen 3 */}
            <div className="imagen-item">
              <img src={imageC} alt="Servicio 3" className="imagen-cuadrada" />
              <p className="subtitulo-imagen">Servicio 3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor 4 con imagen de fondo y mini contenedores de texto */}
      <div
        className="dashboard-unique-container"
        style={{ backgroundImage: `url(${backgroundImage4})`, backgroundColor: 'rgba(0, 0, 0, 0.5)', backgroundBlendMode: 'darken' }}
      >
        <div className="contenedor-4">
          {/* Título centrado */}
          <h2 className="titulo-contenedor-4">Nuestros Valores</h2>

          {/* Contenedor de mini contenedores de texto */}
          <div className="textos-contenedor-4">
            {/* Mini contenedor 1 */}
            <div className="texto-item">
              <h3>Compromiso</h3>
              <p>Nos comprometemos a brindar un servicio de calidad y a trabajar con pasión por nuestras familias.</p>
            </div>

            {/* Mini contenedor 2 */}
            <div className="texto-item">
              <h3>Transparencia</h3>
              <p>Creemos en la honestidad y la claridad en cada uno de nuestros procesos.</p>
            </div>

            {/* Mini contenedor 3 */}
            <div className="texto-item">
              <h3>Empatía</h3>
              <p>Ponemos el corazón en cada caso, entendiendo las necesidades de quienes nos buscan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedores restantes */}
      <div className="dashboard-unique-container" style={{ backgroundColor: '#8fa8c7' }}>
        Contenedor 5
      </div>
      <div className="dashboard-unique-container" style={{ backgroundColor: '#7f9ac1' }}>
        Contenedor 6
      </div>
      <div className="dashboard-unique-container" style={{ backgroundColor: '#6f8cbb' }}>
        Contenedor 7
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from "react";
// Importamos el archivo CSS

const CustomCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para avanzar al siguiente slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Cambia de imagen cada 7 segundos (ajusta según sea necesario)

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [images.length]);

  return (
    <div className="custom-carousel">
      <div
        className="carousel-inner"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${images.length * 100}%`, // Ancho total del carrusel
          transition: "transform 1.5s ease-in-out", // Transición más lenta
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="carousel-item" style={{ width: `${100 / images.length}%` }}>
            <img src={image.src} alt={image.alt} className="carousel-image" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCarousel;
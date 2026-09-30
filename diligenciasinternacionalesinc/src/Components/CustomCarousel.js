import React, { useState, useEffect } from "react";

const CustomCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Cambia de imagen cada 7 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="custom-carousel">
      <div
        className="carousel-inner"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${images.length * 100}%`, // Ancho total del carrusel
          transition: "transform 1.5s ease-in-out",
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
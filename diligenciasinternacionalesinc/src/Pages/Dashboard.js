import React from "react";
import Carousel from "../Components/Carousel";


function Dashboard() {
  // Datos de ejemplo para el carrusel
  const carouselImages = [
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2E9AQreHxa0OOUgD7yUi2UuWZwGLzzKQgRw&s",
      alt: "Slide 1",
      title: "Título 1",
      description: "Descripción del slide 1.",
    },
    {
      src: "https://wallpapers.com/images/hd/red-clouds-hd-computer-47q7y605ooe310s7.jpg",
      alt: "Slide 2",
      title: "Título 2",
      description: "Descripción del slide 2.",
    },
    {
      src: "https://via.placeholder.com/800x400?text=Slide+3",
      alt: "Slide 3",
      title: "Título 3",
      description: "Descripción del slide 3.",
    },
  ];

  return (
    <div className="parent">
      <div className="div1">
        <Carousel images={carouselImages} /> {/* Carrusel en la primera sección */}
      </div>
      <div className="div2">2</div>
      <div className="div3">3</div>
      <div className="div4">4</div>
      <div className="div11">11</div>
    </div>
  );
}

export default Dashboard;
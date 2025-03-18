import React from 'react';
import Carousel from '../Components/Carousel';// Importa el componente Carousel

import imagen1 from "../Images/carrucel1.jpg";
import imagen2 from "../Images/carrucel2.jpg";
import imagen3 from "../Images/carrucel3.jpg";

const Dashboard = () => {
  // Datos de ejemplo para el carrusel
  const carouselImages = [
    {
      src: imagen1,
      alt: 'Slide 1',
      title: 'Welcome to Acme Co',
      description: 'Explore our latest projects and team updates.',
    },
    {
      src: imagen2,
      alt: 'Slide 2',
      title: 'Project A',
      description: 'Discover the details of Project A.',
    },
    {
      src: imagen3,
      alt: 'Slide 3',
      title: 'Project B',
      description: 'Learn more about Project B.',
    },
  ];

  return (
    <div className="dashboard">
      <main className="main-content">
        {/* Reemplazar hero-section con el Carousel */}
        <Carousel images={carouselImages} />
        <section className="projects-section">
          <h2>Your projects</h2>
          <div className="projects-grid">
            {/* Contenido de los proyectos */}
          </div>
        </section>
        <section className="team-section">
          <h2>Your team</h2>
          <div className="team-grid">
            {/* Contenido del equipo */}
          </div>
        </section>
        <section className="activity-section">
          <h2>Latest activity</h2>
          <div className="activity-list">
            {/* Contenido de la actividad */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
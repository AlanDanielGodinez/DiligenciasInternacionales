import React from 'react';
import image1 from "../Images/Dashboard.jpg";
import a1 from "../Images/a1.jpeg";
import usaFlag from "../Images/usa.png"; // Importa las imágenes de las banderas
import mexicoFlag from "../Images/mexico.webp";
import guatemalaFlag from "../Images/guatemala.png";
import elSalvadorFlag from "../Images/salvador.png";
import hondurasFlag from "../Images/honduras.png";
import Footer from '../Components/Footer'; // Importa el componente Footer

const Dashboard = () => {
  // Cambia esta URL por la imagen de fondo que quieras
  const heroBackgroundImage = image1;

  // Opciones del menú de navegación
  const menuOptions = [
    {
      title: "Asesoría Legal",
      image: a1,
      description: "Brindamos asesoría legal especializada en trámites internacionales.",
    },
    {
      title: "Operadora Turística",
      image: "https://www.cesuma.mx/blog/wp-content/uploads/2023/04/operador-turstico-entregando-boletos-de-avion.jpg",
      description: "Organizamos viajes y paquetes turísticos a nivel internacional.",
    },
    {
      title: "Trámite eTA (Autorización Electrónica de Viaje)",
      image: "https://media.istockphoto.com/id/1020968912/es/vector/icono-de-la-hoja-de-arce-s%C3%ADmbolo-canadiense-ilustraci%C3%B3n-de-vector.jpg?s=612x612&w=0&k=20&c=XYbDMGplNJvpSQECqiDl-6ahBzewF_RpSfQhYcEhSMY=",
      description: "Te ayudamos a obtener tu Autorización Electrónica de Viaje (eTA) de manera rápida y segura.",
    },
    {
      title: "Apostille Americana",
      image: "https://apostilladoytraduccion.com/wp-content/uploads/2022/12/Apostilla-desde-CDMX-Actas-de-Nacimiento-de-Estados-Unidos.jpg",
      description: "Realizamos trámites de apostilla para documentos americanos.",
    },
    {
      title: "Traducciones",
      image: "https://transpanish.biz/es/wp-content/uploads/2012/08/bigstockphoto_Businessteam_Wrapping_Up_A_Mee_931545.jpg",
      description: "Ofrecemos servicios de traducción certificada para documentos oficiales.",
    },
    {
      title: "Cita ante Notario Público",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbtSk1uozBz8It1aDbkIItUldiFYt4I9aTbA&s",
      description: "Agendamos citas con notarios públicos para trámites legales.",
    },
    {
      title: "Trámites de Certificados Americanos",
      image: "https://c.pxhere.com/images/05/4f/cd9cc55daa249e2fa5960f7c7443-1450317.jpg!s2",
      description: "Gestionamos la obtención de certificados americanos.",
    },
    {
      title: "Registro de Nacimiento en el Exterior",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIucBD4D0sWL6Nl6GiedNplsxHdTSkAXWzbw&s",
      description: "Te ayudamos a registrar nacimientos ocurridos en el extranjero.",
    },
  ];

  return (
    <div className="dashboard">
      <main className="main-content">
        <section
          className="hero-section"
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url(${heroBackgroundImage})` }}
        >
          <h1>Diligencias Internacionales <br /> México</h1>
          <h2>VISAS & REENCUENTROS FAMILIARES</h2>
          <div className="flags-container">
            <img src={usaFlag} alt="USA Flag" className="flag" />
            <img src={mexicoFlag} alt="Mexico Flag" className="flag" />
            <img src={guatemalaFlag} alt="Guatemala Flag" className="flag" />
            <img src={elSalvadorFlag} alt="El Salvador Flag" className="flag" />
            <img src={hondurasFlag} alt="Honduras Flag" className="flag" />
          </div>
        </section>

        <section className="projects-section">
          <h2>Servicios</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image" style={{ backgroundImage: 'url("https://www.informador.mx/__export/1656644816650/sites/elinformador/img/2022/06/30/passport-gd8629affd_1920_crop1656644700108.jpg_1902800913.jpg")' }}></div>
              <p>Trámite de visa</p>
            </div>
            <div className="project-card">
              <div className="project-image" style={{ backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdbuSZknOOdQO3lJkxJ0XxTxn-A0-XyaxLcqbrQh5v3_VSZ38gZI3Bkx1rk8CTQo1oGmM&usqp=CAU")' }}></div>
              <p>Reencuentros familiares</p>
            </div>
            <div className="project-card">
              <div className="project-image" style={{ backgroundImage: 'url("https://visafacil.mx/wp-content/uploads/2024/06/producto-pasaporte-americano-visa-facil-copy.webp")' }}></div>
              <p>Trámite de pasaporte</p>
            </div>
            <div className="project-card">
              <div className="project-image" style={{ backgroundImage: 'url("https://tramitvisa.com/wp-content/uploads/2018/08/Asesor%C3%ADa-para-cita-consular.jpg")' }}></div>
              <p>Asesoría consular</p>
            </div>
          </div>
        </section>

        {/* Menú de navegación */}
        <section className="navigation-menu">
          <h2>Otros Servicios</h2>
          <div className="menu-grid">
            {menuOptions.map((option, index) => (
              <div key={index} className="menu-item">
                <div className="menu-image" style={{ backgroundImage: `url(${option.image})` }}></div>
                <div className="menu-content">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
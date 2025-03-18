import React from 'react';
import image1 from "../Images/Dashboard.jpg"


const Dashboard = () => {
  // Cambia esta URL por la imagen de fondo que quieras
  const heroBackgroundImage = image1;

  return (
    <div className="dashboard">
      <main className="main-content">
        <section 
          className="hero-section" 
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url(${heroBackgroundImage})` }}
        >
          <h1>Diligencias Internacionales <br></br> Mèxico</h1>
          <h2>VISAS & REENCUENTROS FAMILIARES</h2>
          
        </section>
        <section className="projects-section">
          <h2>Nuestros servicios</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://www.informador.mx/__export/1656644816650/sites/elinformador/img/2022/06/30/passport-gd8629affd_1920_crop1656644700108.jpg_1902800913.jpg")'}}></div>
              <p>Tramite de visa</p>
             
            </div>
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdbuSZknOOdQO3lJkxJ0XxTxn-A0-XyaxLcqbrQh5v3_VSZ38gZI3Bkx1rk8CTQo1oGmM&usqp=CAU")' }}></div>
              <p>Reecuentros familiares</p>
              
            </div>
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://visafacil.mx/wp-content/uploads/2024/06/producto-pasaporte-americano-visa-facil-copy.webp")'}}></div>
              <p>Tramite de pasaporte</p>
              
            </div>
            <div className="project-card">
              <div className="project-image" style={{backgroundImage: 'url("https://tramitvisa.com/wp-content/uploads/2018/08/Asesor%C3%ADa-para-cita-consular.jpg")'}}></div>
              <p>Asesoria consular</p>
            
            </div>
          </div>
        </section>
        <section className="team-section">
          <h2>Your team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/0394ea29-3d1d-4989-992c-2ba2e9069bda.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/3a48aa23-af7e-475a-84c9-31220c03d86b.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/083e0f53-195a-4d1e-bc49-3b9daa5be411.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/1b088bd1-cf6f-46ff-95dd-e51fb22706f5.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/bc4a93d8-373c-4089-88de-401ec335d5d3.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/75a46306-4693-4c88-98c9-229193ddd0b3.png")'}}></div>
            </div>
            <div className="team-member">
              <div className="member-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/9df2eab8-f8ae-4de9-9165-c58d9bfac259.png")'}}></div>
            </div>
          </div>
        </section>
        <section className="activity-section">
          <h2>Latest activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/4b31f68e-862e-461d-90a5-6a48493d3513.png")'}}></div>
              <div className="activity-info">
                <p>Refactor the React components</p>
                <p>Task created · June 10</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/7b79c9c5-1810-4ce3-9500-7ced82ad3ae2.png")'}}></div>
              <div className="activity-info">
                <p>Any update on this issue?</p>
                <p>Commented on issue #23 · June 9</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/ade8efeb-3fed-4a0a-aabe-7491cfb11415.png")'}}></div>
              <div className="activity-info">
                <p>Update the design spec</p>
                <p>Task completed · June 8</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-avatar" style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/bbd0d90d-6bc8-444c-b5f6-66353f6ddbd4.png")'}}></div>
              <div className="activity-info">
                <p>Add missing error message</p>
                <p>Task created · June 7</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
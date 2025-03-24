import React, { useState } from 'react';
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
 // Asegúrate de que este import sea correcto

const Tramites = () => {
  const [theme, setTheme] = useState('light');
  const [selectedPlan, setSelectedPlan] = useState(null);

 

  const plans = [
    {
      id: 'individual',
      title: 'Reencuentros familiares',
      features: [
        'Te ayudamos con todo el proceso legal',
        'Reunimos familias separadas por la migración',
        'Analizamos si aplica para un perdón o visa',
        'Asesoría experta'
      ],
      buttonText: 'Solicitar información',
      color: 'var(--color-primary)'
    },
    {
      id: 'empresarial',
      title: 'Tramite de visa',
      features: [
        'Te conseguimos fecha rápida',
        'Aprobación segura y sin estrés',
        'Soporte prioritario telefónico',
        'Te ayudamos a corregir errores y reintentar',
      ],
      buttonText: 'Solicitar información',
      color: 'var(--color-secondary)'
    },
    {
      id: 'corporativo',
      title: 'Tramite Pasaporte',
      features: [
        'Sin perder tiempo en citas',
        'Te ayudamos a corregir errores y volver a aplicar',
        'Guiamos paso a paso',
        'Sin perder tiempo en citas',
      ],
      buttonText: 'Solicitar información',
      color: 'var(--color-accent)'
    }
  ];

  const tramites = [
    'Tramite de Visa',
    'Tramite de Pasaporte',
    'Reencuentros Familiares',
    'Asesoria Consular',
    'Operadora Tusristica',
    'Tramite eTA',
    'Apostille Americana',
    'Traducciones',
    'Cita ante Notario Publico',
    'Tramites de Certificados Americanos de Nacimiento, Divorcio, Matrimonio y Defuncion',
    'Registro de nacimiento en el exterior'
  ];

  return (
    <div className="page-container">
      <Navbar />
      <div className={`price-page ${theme}`} data-theme={theme}>
       
        
        <header className="price-header">
          <h1>Nuestros servicios y tramites</h1>
          <p>Descubre la opción que mejor se adapte a tus necesidades</p>
        </header>

        <div className="content-wrap">
          <div className="plans-container">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
                style={{ borderTop: `4px solid ${plan.color}` }}
              >
                <div className="plan-header">
                  <h2>{plan.title}</h2>
                </div>
                
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                
                <div className="plan-actions">
                  <button 
                    className="plan-button"
                    style={{ backgroundColor: plan.color }}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <section className="tramites-list">
            <h2>Trámites disponibles:</h2>
            <ul>
              {tramites.map((tramite, index) => (
                <li key={index}>{tramite}</li>
              ))}
            </ul>
          </section>
          
          <div className="contact-section">
            <h2>¿Necesitas una solución personalizada?</h2>
            <p>Nuestros asesores pueden crear un paquete a medida para tu empresa</p>
            <button className="contact-button" style={{ backgroundColor: 'var(--color-warning)' }}>
              Inicar sesión
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Tramites;
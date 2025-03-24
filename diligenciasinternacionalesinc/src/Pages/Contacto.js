import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="contact-page">
      <Navbar />
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte con cualquier pregunta o consulta que tengas</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="contact-container">
        {/* Contact Info */}
        <section className="contact-info-section">
          <h2>Nuestra información</h2>
          
          <div className="contact-info-grid">
            <div className="contact-info-card">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>Ubicación</h3>
              <p>Atenas 80-Sur, Cd del Valle, 63157 Tepic, Nay., México</p>
            </div>
            
            <div className="contact-info-card">
              <FaPhone className="contact-icon" />
              <h3>Teléfono</h3>
              <p>+52 311 110 1465</p>
              <p>+1 (323) 400-0467</p>
            </div>
            
            <div className="contact-info-card">
              <FaEnvelope className="contact-icon" />
              <h3>Email</h3>
              <p>contacto@dillgenciascorp.org</p>
              <p>soporte@dillgenciascorp.org</p>
            </div>
            
            <div className="contact-info-card">
              <FaClock className="contact-icon" />
              <h3>Horario</h3>
              <p>Lunes a Viernes:<br></br> 8:00 AM - 6:00 PM</p>
              
            </div>
          </div>
        </section>

        {/* Map Section con Iframe */}
        <section className="map-section">
          <h2>Encuéntranos en el mapa</h2>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d232.03253027868897!2d-104.88846369954834!3d21.487323738183434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842736f10d440001%3A0x60c250c0b22163!2sDiligencias%20Internacionales%20Inc.!5e0!3m2!1ses!2smx!4v1742842205663!5m2!1ses!2smx" 
              width="100%" 
              height="400" 
              style={{border:0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Diligencias Internacionales"
            ></iframe>
          </div>
        </section>

        {/* Contact Form */}
        <section className="contact-form-section">
          <h2>Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Asunto</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </button>
            
            {submitMessage && <p className="submit-message">{submitMessage}</p>}
          </form>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contacto;
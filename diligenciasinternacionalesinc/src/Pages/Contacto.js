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

        
      </div>

      <Footer />
    </div>
  );
};

export default Contacto;
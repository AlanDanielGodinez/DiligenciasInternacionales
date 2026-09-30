import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceActionButton = ({ serviceName, children, className = 'servicio-cta-button' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('userToken');
    
    if (isAuthenticated) {
      // Si está autenticado, redirigir al área del cliente
      navigate('/cliente/inicio', { 
        state: { 
          servicioSolicitado: serviceName,
          mensaje: `Continuar con la solicitud de: ${serviceName}`
        }
      });
    } else {
      // Si no está autenticado, redirigir al login con el servicio en query params
      navigate(`/login?servicio=${encodeURIComponent(serviceName)}&action=solicitar`);
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};

export default ServiceActionButton;

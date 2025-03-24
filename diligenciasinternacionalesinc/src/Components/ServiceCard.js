import React from 'react';

const ServiceCard = ({ title, description, icon, color }) => {
  return (
    <div className="service-card animate-on-scroll" style={{ borderTop: `4px solid ${color}` }}>
      <div className="service-icon-container" style={{ color }}>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default ServiceCard;
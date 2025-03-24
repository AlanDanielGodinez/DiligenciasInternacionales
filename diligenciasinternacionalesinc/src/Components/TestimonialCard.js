import React from 'react';

const TestimonialCard = ({ image, quote, name }) => {
  return (
    <div className="testimonial-card animate-on-scroll">
      <img src={image} alt="Testimonio" className="testimonial-image" />
      <div className="testimonial-content">
        <p>"{quote}"</p>
        <p className="name">- {name}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
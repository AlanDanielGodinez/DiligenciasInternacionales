import React from 'react';

const TestimonialCard = ({ image, video, quote, name, type = 'image' }) => {
  const renderMedia = () => {
    if (type === 'video' && video) {
      return (
        <video 
          className="testimonial-video"
          src={video}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
        >
          Tu navegador no soporta el elemento de video.
        </video>
      );
    } else {
      return (
        <img 
          src={image} 
          alt={`Testimonio de ${name}`}
          className="testimonial-image"
        />
      );
    }
  };

  return (
    <div className="testimonial-card">
      <div className="testimonial-media-container">
        {renderMedia()}
        <div className="testimonial-overlay">
          <div className="testimonial-content">
            <blockquote className="testimonial-quote">
              "{quote}"
            </blockquote>
            <cite className="testimonial-author">- {name}</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
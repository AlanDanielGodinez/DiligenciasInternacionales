import React from 'react';
import styled from 'styled-components';

const Card = ({ image, text, icon }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="first-content">
          <img src={image} alt="Card content" className="card-image" />
        </div>
        <div className="second-content">
          <span>{text}</span>
          <div className="icon">{icon}</div> {/* Icono o emoji */}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    margin:20px;
    width: 300px;
    height: 350px;
    background: rgba(255, 255, 255, 0);
    transition: all 0.4s;
    border-radius: 10px;
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.705);
    font-size: 30px;
    font-weight: 900;
    overflow: hidden; /* Para que el contenido no se desborde */
  }

  .card:hover {
    border-radius: 15px;
    cursor: pointer;
    transform: scale(1.2);
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.705);
    background: rgb(255, 255, 255);
  }

  .first-content {
    height: 100%;
    width: 100%;
    transition: all 0.4s;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    border-radius: 15px;
  }

  .card:hover .first-content {
    height: 0px;
    opacity: 0;
  }

  .second-content {
    text-align:center;
    height: 0%;
    width: 100%;
    opacity: 0;
    display: flex;
    flex-direction: column; /* Alinear texto e icono verticalmente */
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    transition: all 0.4s;
    font-size: 0px;
    transform: rotate(90deg) scale(-1);
    background: rgba(255, 255, 255, 0.9); /* Fondo semi-transparente */
  }

  .card:hover .second-content {
    opacity: 1;
    height: 100%;
    font-size: 2.2rem;
    transform: rotate(0deg);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ajusta la imagen sin distorsionar */
    border-radius: 10px;
  }

  .icon {
    margin-top: 10px; /* Espacio entre el texto y el icono */
    font-size: 1.5rem; /* Tamaño del icono */
  }
`;

export default Card;
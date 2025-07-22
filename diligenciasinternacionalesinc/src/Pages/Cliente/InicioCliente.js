import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InicioCliente = () => {
  const [cliente, setCliente] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Puedes ajustar este endpoint si quieres obtener info del cliente desde el backend
    const userData = JSON.parse(localStorage.getItem('userCliente'));
    if (!userData) {
      navigate('/login');
    } else {
      setCliente(userData);
    }
  }, [navigate]);

  return (
    <div className="inicio-cliente">
      <h1>Bienvenido, {cliente?.nombre || 'Cliente'}</h1>
      <p>Aquí podrás consultar el estado de tu solicitud, subir documentos y más.</p>

      {/* Aquí se insertará SeguimientoTimeline después */}
    </div>
  );
};

export default InicioCliente;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al cargar
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h1>Bienvenido Administrador</h1>
      <p>Panel de control principal</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Home;
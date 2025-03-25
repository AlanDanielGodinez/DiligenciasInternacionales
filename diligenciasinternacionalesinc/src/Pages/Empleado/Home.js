import React from 'react';
import { useNavigate } from 'react-router-dom';


const HomeEmpleado = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="home-empleado">
      <h1>Bienvenido, {user?.nombre || 'Empleado'}</h1>
      <div className="dashboard-cards">
        <div className="card" onClick={() => navigate('/empleado/tramites')}>
          <h3>Trámites</h3>
          <p>Gestión de trámites</p>
        </div>
        <div className="card" onClick={() => navigate('/empleado/clientes')}>
          <h3>Clientes</h3>
          <p>Administración de clientes</p>
        </div>
        <div className="card" onClick={() => navigate('/empleado/reportes')}>
          <h3>Reportes</h3>
          <p>Generar reportes</p>
        </div>
      </div>
    </div>
  );
};

export default HomeEmpleado;
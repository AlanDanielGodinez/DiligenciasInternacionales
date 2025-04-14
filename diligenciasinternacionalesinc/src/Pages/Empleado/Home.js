import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeEmpleado = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Determinar el tipo de usuario
  const isAdmin = user?.rol === 'Administrador';
  const isEmployee = !isAdmin;

  return (
    <div className="home-empleado">
      <h1>Bienvenido, {user?.nombre || 'Usuario'}</h1>
      <p className="user-role">Rol: {user?.rol || 'No definido'}</p>
      
      <div className="dashboard-cards">
        {isEmployee && (
          <>
            <div className="card" onClick={() => navigate('/empleado/solicitudes')}>
              <h3>Gestión de Solicitudes</h3>
              <p>Crear y administrar solicitudes</p>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="card" onClick={() => navigate('/empleado/empleados')}>
              <h3>Empleados</h3>
              <p>Administrar personal</p>
            </div>
            <div className="card" onClick={() => navigate('/empleado/areas')}>
              <h3>Áreas</h3>
              <p>Gestionar áreas de trabajo</p>
            </div>
            <div className="card" onClick={() => navigate('/empleado/roles')}>
              <h3>Roles</h3>
              <p>Administrar roles del sistema</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeEmpleado;
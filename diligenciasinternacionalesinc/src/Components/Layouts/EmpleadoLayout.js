import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';



const EmpleadoLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="empleado-layout">
      <Sidebar />
      <div className="main-content">
        
        <div className="content-area">
          <Outlet /> {/* Esto renderizará las rutas hijas */}
        </div>
      </div>
    </div>
  );
};

export default EmpleadoLayout;
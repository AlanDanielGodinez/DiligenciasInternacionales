// EmpleadoLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNavigation from "../Sidebar";

const EmpleadoLayout = () => {
  return (
    <div className="home-empleado-container">
      <SidebarNavigation />
      <div className="main-content">
        
        <div className="home-empleado">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmpleadoLayout;
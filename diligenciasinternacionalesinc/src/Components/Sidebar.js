import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import logoImage from '../Images/1.png';

const SidebarNavigation = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  

  const permisosPorRol = {
    "Administrador": ["Dashboard", "Clientes", "Solicitudes y Trámites", "Viajes", "Pagos", "Áreas", "Empleados"],
    "Auditoria": ["Dashboard", "Clientes", "Solicitudes y Trámites", "Viajes", "Pagos", "Áreas", "Empleados"],
    "Coordinador de Informes": ["Clientes", "Solicitudes y Trámites"],
    "Auxiliar de Informes": ["Clientes", "Solicitudes y Trámites"],
    "Coordinador de Individuales y servicios multinacionales": ["Clientes", "Solicitudes y Trámites"],
    "Auxiliar de Individuales y servicios multinacionales": ["Clientes", "Solicitudes y Trámites"],
    "Coordinador de AMA Grupos": ["Clientes", "Solicitudes y Trámites"],
    "Auxiliar de AMA Grupos": ["Clientes", "Solicitudes y Trámites"],
    "Coordinador de Recursos humanos": ["Áreas", "Empleados"],
    "Logistica y viajes": ["Viajes", "Solicitudes y Trámites", "Clientes"],
    "Coordinador de Finanzas": ["Pagos", "Solicitudes y Trámites"],
    "Auxiliar de Finanzas": ["Pagos", "Solicitudes y Trámites"],
    // Puedes agregar más si defines nuevos roles
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const rol = user?.rol || '';
  const permisosPermitidos = permisosPorRol[rol] || [];

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };
  



  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: "📊",
      items: [
        { name: "Inicio", path: "/home" },
        { name: "Estadísticas", path: "/stats" }
      ]
    },
    {
      title: "Clientes",
      icon: "👥",
      items: [
        { name: "Lista de Clientes", path: "/empleado/clientes" },
        { name: "Antecedentes", path: "/antecedentes" },
        { name: "Paises y Ciudades", path: "/empleado/paisesciudades" }
      ]
    },
    {
      title: "Solicitudes y Trámites",
      icon: "📋",
      items: [
        { name: "Solicitudes", path: "/empleado/versolicitudes" },
        { name: "Nueva Solicitud", path: "/empleado/CrearSolicitud" },
        { name: "Trámites", path: "/empleado/tramiteslista" },
        
      ]
    },
    {
      title: "Viajes",
      icon: "✈️",
      items: [
        { name: "Itinerarios", path: "/empleado/itinerarios" },
        { name: "Aerolíneas", path: "/empleado/aerolineas" },
      ]
    },
    {
      title: "Pagos",
      icon: "💳",
      items: [
        { name: "Registro de Pagos", path: "/empleado/pagos-pendientes" },
        { name: "Métodos de Pago", path: "/empleado/metodospago" },
        
      ]
    },
    {
      title: "Áreas",
      icon: "🏢",
      items: [
        { name: "Lista de Áreas", path: "/empleado/areas" },
        
      ]
    },
    {
      title: "Empleados",
      icon: "👨‍💼",
      items: [
        { name: "Lista de Empleados", path: "/empleado/empleados" },
        { name: "Roles y Permisos", path: "/empleado/roles" },
      ]
    },
    
  ];

  

  return (
    <>
      {/* Pestaña lateral para abrir */}
      <div className="sidebar-tab" onClick={toggleSidebar}>
        <FaBars />
      </div>

      {/* Sidebar principal */}
      <div className={`sidebar-container ${isVisible ? 'visible' : ''}`}>
        {/* Botón para cerrar */}
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>
        
        <div className="sidebar-logo">
          <img src={logoImage} alt="Logo" className="sidebar-logo-image" />
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-menu-scroll-container">
            {menuItems
              .filter(menu => permisosPermitidos.includes(menu.title)) // 👈 SOLO LOS PERMITIDOS
              .map((menu, index) => (
                <div key={index} className="sidebar-menu-group">
                  <div 
                    className={`sidebar-menu-header ${activeMenu === menu.title ? 'active' : ''}`}
                    onClick={() => toggleMenu(menu.title)}
                  >
                    <span className="sidebar-menu-icon">{menu.icon}</span>
                    <span className="sidebar-menu-title">{menu.title}</span>
                    <span className="sidebar-menu-arrow">
                      {activeMenu === menu.title ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  </div>
                  <div 
                    className={`sidebar-menu-items ${activeMenu === menu.title ? 'open' : ''}`}
                    style={{ height: activeMenu === menu.title ? `${menu.items.length * 45}px` : '0px' }}
                  >
                    {menu.items.map((item, i) => (
                      <Link
                        key={i}
                        to={item.path}
                        className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
            ))}

            </div>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="sidebar-footer-item logout-button"
          >
            <span className="sidebar-footer-icon">🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default SidebarNavigation;
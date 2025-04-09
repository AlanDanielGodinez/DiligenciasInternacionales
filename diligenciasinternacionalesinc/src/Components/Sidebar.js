import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const SidebarNavigation = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        { name: "Lista de Clientes", path: "/clientes" },
        { name: "Antecedentes", path: "/antecedentes" },
        { name: "Condiciones Especiales", path: "/condiciones" }
      ]
    },
    {
      title: "Trámites",
      icon: "📋",
      items: [
        { name: "Tipos de Trámites", path: "/tramites" },
        { name: "Nueva Solicitud", path: "/SolicitudForm" },
        { name: "Solicitudes Activas", path: "/solicitudes" },
        { name: "Calendario de Plazos", path: "/calendario" }
      ]
    },
    {
      title: "Viajes",
      icon: "✈️",
      items: [
        { name: "Itinerarios", path: "/itinerarios" },
        { name: "Aerolíneas", path: "/aerolineas" },
        { name: "Grupos", path: "/grupos" }
      ]
    },
    {
      title: "Pagos",
      icon: "💳",
      items: [
        { name: "Registro de Pagos", path: "/pagos" },
        { name: "Métodos de Pago", path: "/metodos-pago" },
        { name: "Reportes", path: "/reportes" }
      ]
    },
    {
      title: "Áreas",
      icon: "🏢",
      items: [
        { name: "Lista de Áreas", path: "/Areas" },
        { name: "Asignar Empleados", path: "/asignar-empleados" }
      ]
    },
    {
      title: "Empleados",
      icon: "👨‍💼",
      items: [
        { name: "Lista de Empleados", path: "/Empleados" },
        { name: "Por Área", path: "/empleados-por-area" },
        { name: "Roles y Permisos", path: "/Roles" },
      ]
    },
    {
      title: "Documentos",
      icon: "📄",
      items: [
        { name: "Subir Documentos", path: "/subir-documentos" },
        { name: "Archivo Digital", path: "/archivo" },
        { name: "Validación", path: "/validacion" }
      ]
    }
  ];

  const configItems = [
    { name: "Configuración", icon: "⚙️", path: "/configuracion" },
    { name: "Notificaciones", icon: "🧩", path: "/notificaciones" },
    { name: "Ayuda", icon: "❓", path: "/ayuda" }
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
          <h2>D I I</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-menu-scroll-container">
            {menuItems.map((menu, index) => (
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
                  style={{ 
                    height: activeMenu === menu.title ? `${menu.items.length * 45}px` : '0px' 
                  }}
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
          {configItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-footer-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-footer-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
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
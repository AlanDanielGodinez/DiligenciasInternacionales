import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SidebarNavigation = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    // Elimina los datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirige al login
    navigate('/login');
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
        { name: "Nueva Solicitud", path: "/nueva-solicitud" },
        { name: "Solicitudes Activas", path: "/solicitudes" },
        { name: "Calendario de Plazos", path: "/calendario" }
      ]
    },
    {
      title: "Productos",
      icon: "📦",
      items: [
        { name: "Inventario", path: "/inventario" },
        { name: "Categorías", path: "/categorias" },
        { name: "Movimientos", path: "/movimientos" }
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
      title: "Empleados",
      icon: "👨‍💼",
      items: [
        { name: "Lista de Empleados", path: "/empleados" },
        { name: "Roles y Permisos", path: "/roles" },
        { name: "Estado de Empleados", path: "/estado-empleados" }
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
    <div className="sidebarContainer">
      <div className="sidebarLogo">
        <h2>D I I</h2>
      </div>
      
      <nav className="sidebarNav">
        {menuItems.map((menu, index) => (
          <div key={index} className="sidebarMenuGroup">
            <div 
              className={`sidebarMenuHeader ${activeMenu === menu.title ? 'active' : ''}`}
              onClick={() => toggleMenu(menu.title)}
            >
              <span className="sidebarMenuIcon">{menu.icon}</span>
              <span className="sidebarMenuTitle">{menu.title}</span>
              <span className="sidebarMenuArrow">
                {activeMenu === menu.title ? '▼' : '►'}
              </span>
            </div>
            
            <div 
              className={`sidebarMenuItems ${activeMenu === menu.title ? 'open' : ''}`}
              style={{ 
                height: activeMenu === menu.title ? `${menu.items.length * 45}px` : '0px' 
              }}
            >
              {menu.items.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className={`sidebarMenuItem ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="sidebarFooter">
        {configItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebarFooterItem ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebarFooterIcon">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
        {/* Botón de cierre de sesión mejorado */}
        <button 
          onClick={handleLogout}
          className="sidebarFooterItem logoutButton"
        >
          <span className="sidebarFooterIcon">🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
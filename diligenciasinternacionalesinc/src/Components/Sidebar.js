import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaChartBar,
  FaAddressBook,
  FaUsers,
  FaHandshake,
  FaPlane,
  FaCreditCard,
  FaUserShield,
  FaSignOutAlt,
} from 'react-icons/fa';
import logoImage from '../Images/1.png';
import { getCurrentUser } from '../utils/authUser';

const menuCatalog = {
  dashboard: {
    title: 'Dashboard',
    icon: <FaChartBar />,
    items: [{ name: 'Inicio', path: '/home' }],
  },
  informes: {
    title: 'Informes',
    icon: <FaAddressBook />,
    items: [
      { name: 'Nuevo expediente', path: '/empleado/solicitudes-nuevo' },
      { name: 'Contactos', path: '/empleado/contactos' },
    ],
  },
  aplicantes: {
    title: 'Aplicantes',
    icon: <FaUsers />,
    items: [
      { name: 'Todos los aplicantes', path: '/empleado/clientes' },
      { name: 'Negados', path: '/empleado/negados' },
      { name: 'Mis expedientes', path: '/empleado/mis-expedientes' },
      { name: 'Ver expediente', path: '/empleado/solicitudes-nuevo' },
    ],
  },
  legales: {
    title: 'Legales',
    icon: <FaUserShield />,
    items: [
      { name: 'Casos legales', path: '/empleado/legales' },
      { name: 'Mis casos', path: '/empleado/legales?solo_mios=1' },
    ],
  },
  pagos: {
    title: 'Pagos',
    icon: <FaCreditCard />,
    items: [
      { name: 'Pendientes de pago', path: '/empleado/pagos-pendientes' },
      { name: 'Registro de pagos', path: '/empleado/pagos/registro' },
      { name: 'Métodos de pago', path: '/empleado/metodospago' },
    ],
  },
  ama: {
    title: 'AMA',
    icon: <FaHandshake />,
    items: [
      { name: 'Grupos AMA', path: '/empleado/ama/grupos' },
      { name: 'Expedientes AMA', path: '/empleado/ama' },
    ],
  },
  viajes: {
    title: 'Viajes',
    icon: <FaPlane />,
    items: [
      { name: 'Vuelos / Viajes', path: '/empleado/viajes/vuelos' },
      { name: 'Cotizaciones', path: '/empleado/viajes/cotizaciones' },
      { name: 'Itinerarios', path: '/empleado/viajes/itinerarios' },
    ],
  },
  reportes: {
    title: 'Reportes',
    icon: <FaChartBar />,
    items: [{ name: 'Estadísticas', path: '/empleado/estadisticas' }],
  },
  configuracion: {
    title: 'Configuración',
    icon: <FaUserShield />,
    items: [
      { name: 'Empleados', path: '/empleado/empleados' },
      { name: 'Áreas', path: '/empleado/areas' },
      { name: 'Roles y permisos', path: '/empleado/roles' },
      { name: 'Tipos de trámite', path: '/empleado/tramites/tipos' },
      { name: 'Países y ciudades', path: '/empleado/paisesciudades' },
      { name: 'QuickBooks Online', path: '/empleado/configuracion/quickbooks' },
    ],
  },
};

const menuByRole = {
  ADMIN: ['dashboard', 'informes', 'aplicantes', 'legales', 'pagos', 'ama', 'viajes', 'configuracion'],
  INFORMES: ['dashboard', 'informes', 'aplicantes'],
  FINANZAS: ['dashboard', 'pagos', 'aplicantes'],
  INDIVIDUALES: ['dashboard', 'aplicantes'],
  AMA: ['dashboard', 'ama', 'aplicantes'],
  LEGALES: ['dashboard', 'aplicantes', 'legales'],
  VUELOS: ['dashboard', 'viajes', 'aplicantes'],
  PROTOCOLO: ['dashboard', 'ama', 'aplicantes'],
  NEGADOS: ['dashboard', 'aplicantes'],
  SIN_ROL: ['dashboard'],
};

const roleSpecificItems = {
  INDIVIDUALES: {
    aplicantes: [
      { name: 'Todos los aplicantes', path: '/empleado/clientes' },
      { name: 'Negados', path: '/empleado/negados' },
      { name: 'Mis expedientes', path: '/empleado/mis-expedientes' },
      { name: 'Expedientes Individuales', path: '/empleado/individuales' },
      { name: 'Ver expediente', path: '/empleado/solicitudes-nuevo' },
    ],
  },
  LEGALES: {
    aplicantes: [
      { name: 'Todos los aplicantes', path: '/empleado/clientes' },
      { name: 'Negados', path: '/empleado/negados' },
      { name: 'Mis expedientes', path: '/empleado/mis-expedientes' },
      { name: 'Expedientes Legales', path: '/empleado/legales' },
      { name: 'Ver expediente', path: '/empleado/solicitudes-nuevo' },
    ],
  },
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const roleAliases = [
  {
    key: 'ADMIN',
    matches: ['admin', 'administrador', 'administracion', 'auditoria', 'direccion', 'configuracion'],
  },
  {
    key: 'INFORMES',
    matches: ['informes', 'coordinador de informes', 'auxiliar de informes'],
  },
  {
    key: 'FINANZAS',
    matches: ['finanzas', 'pagos', 'contabilidad', 'coordinador de finanzas', 'auxiliar de finanzas'],
  },
  {
    key: 'INDIVIDUALES',
    matches: ['individuales', 'multinacionales', 'servicios multinacionales'],
  },
  {
    key: 'AMA',
    matches: ['ama', 'ama grupos'],
  },
  {
    key: 'LEGALES',
    matches: ['legales', 'legal', 'asesoria legal'],
  },
  {
    key: 'PROTOCOLO',
    matches: ['protocolo'],
  },
  {
    key: 'NEGADOS',
    matches: ['negados'],
  },
  {
    key: 'VUELOS',
    matches: ['vuelos', 'viajes', 'logistica', 'dilitours', 'turismo'],
  },
];

const getRoleCandidates = (user) => {
  if (!user) return [];

  const candidates = [
    user.rol,
    user.role,
    user.nombreRol,
    user.rol_nombre,
    user.area,
    user.area_actual,
    user.empleado?.rol,
    user.empleado?.role,
    user.empleado?.area,
  ];

  if (Array.isArray(user.roles)) {
    candidates.push(...user.roles.map((role) => role?.nombreRol || role?.nombre || role?.rol || role));
  }

  return candidates.filter(Boolean);
};

export const getSidebarRole = (user) => {
  const candidates = getRoleCandidates(user);

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate);
    const match = roleAliases.find(({ matches }) =>
      matches.some((alias) => normalizedCandidate.includes(normalizeText(alias)))
    );

    if (match) return match.key;
  }

  // Rol/área no reconocidos: menú mínimo (antes mostraba el menú de administrador).
  // El backend aplica los permisos reales; ver backend/src/security/permissions.js.
  return 'SIN_ROL';
};

export const getMenuItemsByRole = (user) => {
  const roleKey = getSidebarRole(user);
  const menuKeys = menuByRole[roleKey] || menuByRole.SIN_ROL;
  const itemOverrides = roleSpecificItems[roleKey] || {};

  return menuKeys
    .map((key) => {
      const menu = menuCatalog[key];
      if (!menu) return null;

      return {
        ...menu,
        items: itemOverrides[key] || menu.items,
      };
    })
    .filter(Boolean);
};

const getStoredUser = () => {
  return getCurrentUser();
};

const SidebarNavigation = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = getStoredUser();
  const menuItems = getMenuItemsByRole(user);

  useEffect(() => {
    const currentMenu = menuItems.find((menu) =>
      menu.items.some((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
    );
    setActiveMenu(currentMenu?.title || null);
  // The menu catalog is stable; reopening only needs to follow route changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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

  return (
    <>
      <div className="sidebar-tab" onClick={toggleSidebar}>
        <FaBars />
      </div>

      <div className={`sidebar-container ${isVisible ? 'visible' : ''}`}>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        <div className="sidebar-logo">
          <img src={logoImage} alt="Logo" className="sidebar-logo-image" />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-menu-scroll-container">
            {menuItems.map((menu) => (
              <div key={menu.title} className="sidebar-menu-group">
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
                  {menu.items.map((item) => (
                    <Link
                      key={item.path}
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
          {user && (
            <div className="sidebar-user">
              <span className="sidebar-user-avatar">
                {(user.nombre || user.name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="sidebar-user-copy">
                <strong>{user.nombre || user.name || 'Usuario'}</strong>
                <small>{user.area || user.rol || user.role || 'Colaborador'}</small>
              </span>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-footer-item logout-button">
            <span className="sidebar-footer-icon">
              <FaSignOutAlt />
            </span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarNavigation;

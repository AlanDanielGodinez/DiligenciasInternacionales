// EmpleadoLayout.js
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SidebarNavigation from "../Sidebar";
import api from '../../lib/api';
import { clearAuthSession } from '../../utils/authSession';
import { hasUsableSession } from '../../utils/apiAuth';
import { saveCurrentUser } from '../../utils/authUser';

/**
 * Guard de rutas de empleado: sin sesión válida redirige a /login. El backend sigue siendo la
 * autoridad (toda la API exige token); esto evita mostrar pantallas vacías o con errores.
 */
const EmpleadoLayout = () => {
  const location = useLocation();
  const [status, setStatus] = useState(() => (hasUsableSession() ? 'checking' : 'anonymous'));

  useEffect(() => {
    if (status !== 'checking') return undefined;
    let cancelled = false;
    api.get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        const user = saveCurrentUser(data.user);
        setStatus(user.debe_cambiar_password ? 'must-change-password' : 'ok');
      })
      .catch((error) => {
        if (cancelled) return;
        const code = error?.response?.data?.error?.code;
        if (code === 'PASSWORD_CHANGE_REQUIRED') { setStatus('must-change-password'); return; }
        clearAuthSession();
        setStatus('anonymous');
      });
    return () => { cancelled = true; };
  }, [status]);

  if (status === 'anonymous') {
    return <Navigate to={`/login?volver=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (status === 'must-change-password') return <Navigate to="/cambiar-password" replace />;
  if (status === 'checking') {
    return <div className="home-empleado-container" aria-busy="true"><p style={{ padding: 24 }}>Verificando sesión…</p></div>;
  }

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

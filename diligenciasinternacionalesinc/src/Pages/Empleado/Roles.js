import React from 'react';
import { FaUserShield } from 'react-icons/fa';

const RolesPage = () => (
  <main className="config-min">
    <header className="config-min__header">
      <div>
        <span className="config-min__eyebrow"><FaUserShield /> Configuracion</span>
        <h1>Roles y permisos</h1>
        <p>La administración de roles y permisos aún no está disponible.</p>
      </div>
    </header>

    <section className="config-min__placeholder">
      <FaUserShield />
      <h2>Configuración pendiente</h2>
      <p>
        Por ahora no se pueden crear ni modificar roles desde esta pantalla.
      </p>
      <p>
        Falta definir los permisos de cada rol y el acceso de los empleados a las áreas.
      </p>
    </section>
  </main>
);

export default RolesPage;

import React from 'react';
import { FaUserShield } from 'react-icons/fa';

const RolesPage = () => (
  <main className="config-min">
    <header className="config-min__header">
      <div>
        <span className="config-min__eyebrow"><FaUserShield /> Configuracion</span>
        <h1>Roles y permisos</h1>
        <p>Este modulo queda pendiente hasta definir el modelo productivo de permisos.</p>
      </div>
    </header>

    <section className="config-min__placeholder">
      <FaUserShield />
      <h2>Roles y permisos pendiente</h2>
      <p>
        No hay endpoint PostgreSQL activo para administrar roles desde esta pantalla.
        Por seguridad se deshabilito el CRUD legacy que llamaba a /api/roles.
      </p>
      <p>
        Fase 2 recomendada: definir tablas de roles/permisos, relacion con empleados y reglas de acceso por area.
      </p>
    </section>
  </main>
);

export default RolesPage;

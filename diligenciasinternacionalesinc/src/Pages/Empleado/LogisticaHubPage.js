import React from 'react';
import { Link } from 'react-router-dom';
import { ManagementHeader, ManagementPage } from '../../Components/Management/ManagementUI';
import '../../Styles/LogisticaHubPage.css';

const modules = [
  { title: 'Vuelos', text: 'Calendario de salidas y regresos, con lista administrativa.', to: '/empleado/viajes/vuelos', icon: '✈' },
  { title: 'Itinerarios', text: 'Rutas, fechas, hospedaje y transporte de cada expediente.', to: '/empleado/viajes/itinerarios', icon: '⌖' },
  { title: 'Cotizaciones', text: 'Seguimiento de propuestas y servicios de viaje.', to: '/empleado/viajes/cotizaciones', icon: '$' },
  { title: 'Aerolíneas', text: 'Consulta y administración del catálogo disponible.', to: '/empleado/aerolineas', icon: '◎' },
  { title: 'Tours', text: 'Salidas, capacidad y operación de tours.', to: '/empleado/viajes/tours', icon: '◇' },
  { title: 'Grupos de viaje', text: 'Fechas e integrantes de grupos logísticos.', to: '/empleado/viajes/grupos', icon: '◆' },
];

export default function LogisticaHubPage() {
  return <ManagementPage className="logistica-hub">
    <ManagementHeader eyebrow="Logística / Dilitours" title="Operación de viajes" description="Accede a cada flujo desde una vista operativa." />
    <section className="logistica-hub__grid" aria-label="Módulos de logística">
      {modules.map((module) => <Link className="logistica-hub__card" to={module.to} key={module.title}>
        <span className="logistica-hub__icon" aria-hidden="true">{module.icon}</span>
        <div><h2>{module.title}</h2><p>{module.text}</p></div>
        <span className="logistica-hub__access">Abrir módulo →</span>
      </Link>)}
    </section>
  </ManagementPage>;
}

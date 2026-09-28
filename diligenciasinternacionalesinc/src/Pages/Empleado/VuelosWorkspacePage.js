import React, { useState } from 'react';
import ViajesCalendarioPage from './ViajesCalendarioPage';
import VuelosPage from './VuelosPage';
import '../../Styles/VuelosWorkspacePage.css';

export default function VuelosWorkspacePage() {
  const [view, setView] = useState('calendar');
  return <div className="vuelos-workspace">
    <nav className="vuelos-workspace__switch" aria-label="Vista de vuelos">
      <button type="button" className={view === 'calendar' ? 'is-active' : ''} onClick={() => setView('calendar')}>Calendario</button>
      <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>Lista</button>
    </nav>
    {view === 'calendar' ? <ViajesCalendarioPage /> : <VuelosPage />}
  </div>;
}

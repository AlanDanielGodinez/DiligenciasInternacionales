import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OperationalCalendar from '../../Components/Calendar/OperationalCalendar';
import { getCalendarEventType } from '../../Components/Calendar/calendarEventTypes';
import { ManagementHeader, ManagementPage, ManagementState } from '../../Components/Management/ManagementUI';
import { getItinerariosViaje } from '../../services/viajes.service';
import '../../Styles/CalendarPages.css';

const ViajesCalendarioPage = () => {
  const navigate = useNavigate(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); const [view, setView] = useState('month'); const [selected, setSelected] = useState(null);
  useEffect(() => { let active = true; getItinerariosViaje().then((data) => active && setItems(data)).catch((err) => active && setError(err.response?.data?.message || err.message || 'No fue posible cargar los itinerarios.')).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const events = useMemo(() => items.flatMap((item) => {
    const route = [item.origen, item.destino].filter(Boolean).join(' → ') || `Solicitud #${item.id_solicitud}`;
    const common = { title: route, requestId: item.id_solicitud, traveler: item.aplicante, responsible: item.creado_por_nombre_completo, status: item.estado_itinerario, airline: item.aerolinea, flight: item.numero_vuelo, hotel: item.hotel };
    return [item.fecha_salida && { ...common, id: `viaje-salida-${item.id_itinerario}`, start: item.fecha_salida, type: 'vuelo_salida' }, item.fecha_regreso && { ...common, id: `viaje-regreso-${item.id_itinerario}`, start: item.fecha_regreso, type: 'vuelo_regreso' }].filter(Boolean);
  }), [items]);
  const format = (value) => new Date(value).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
  return <ManagementPage><ManagementHeader eyebrow="Logística / Viajes" title="Calendario de viajes" description="Salidas y regresos registrados en itinerarios activos." actions={<Link className="calendar-page__action" to="/empleado/viajes/itinerarios">Ver lista</Link>} />
    {loading ? <ManagementState className="calendar-page__state">Cargando calendario...</ManagementState> : error ? <ManagementState tone="error" className="calendar-page__state">{error}</ManagementState> : events.length === 0 ? <ManagementState className="calendar-page__state">No hay itinerarios con fechas de salida o regreso.</ManagementState> : <OperationalCalendar events={events} currentDate={currentDate} view={view} onEventClick={setSelected} onDateChange={setCurrentDate} onViewChange={setView} />}
    {selected && <div className="calendar-detail-backdrop" role="presentation" onMouseDown={() => setSelected(null)}><section className="calendar-detail" role="dialog" aria-modal="true" aria-label="Detalle de viaje" onMouseDown={(e) => e.stopPropagation()}><div className="calendar-detail__header"><div><span className="management-eyebrow">{getCalendarEventType(selected.type).label}</span><h2>{selected.title}</h2></div><button className="calendar-detail__close" type="button" onClick={() => setSelected(null)} aria-label="Cerrar">×</button></div><dl><dt>Fecha y hora</dt><dd>{format(selected.start)}</dd><dt>Aplicante</dt><dd>{selected.traveler || 'No disponible'}</dd><dt>Responsable</dt><dd>{selected.responsible || 'No asignado'}</dd><dt>Estado</dt><dd>{selected.status || 'No disponible'}</dd><dt>Aerolínea / vuelo</dt><dd>{[selected.airline, selected.flight].filter(Boolean).join(' · ') || 'No disponible'}</dd><dt>Hotel</dt><dd>{selected.hotel || 'No disponible'}</dd></dl><div className="calendar-detail__actions"><button className="calendar-page__action" type="button" onClick={() => navigate(`/empleado/solicitudes?id_solicitud=${selected.requestId}`)}>Abrir expediente</button></div></section></div>}
  </ManagementPage>;
};
export default ViajesCalendarioPage;

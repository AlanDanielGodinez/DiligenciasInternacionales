export const CALENDAR_EVENT_TYPES = {
  llamada_ama: { label: 'Llamada', tone: 'violet' },
  grupo_tentativo: { label: 'Salida tentativa', tone: 'warning' },
  grupo_confirmado: { label: 'Salida confirmada', tone: 'success' },
  vuelo_salida: { label: 'Salida / vuelo', tone: 'info' },
  vuelo_regreso: { label: 'Regreso / vuelo', tone: 'violet' },
  tour_salida: { label: 'Salida de tour', tone: 'info' },
  tour_regreso: { label: 'Regreso de tour', tone: 'success' },
  grupo_viaje_ida: { label: 'Salida de grupo', tone: 'warning' },
  grupo_viaje_regreso: { label: 'Regreso de grupo', tone: 'violet' },
  cita_cas: { label: 'Cita CAS', tone: 'info' },
  cita_consulado: { label: 'Cita consular', tone: 'success' },
  cita_pasaporte: { label: 'Cita de pasaporte', tone: 'warning' },
};

export const getCalendarEventType = (type) =>
  CALENDAR_EVENT_TYPES[type] || { label: type || 'Evento', tone: 'muted' };

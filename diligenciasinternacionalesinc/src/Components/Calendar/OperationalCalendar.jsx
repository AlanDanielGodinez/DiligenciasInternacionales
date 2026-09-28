import React, { useMemo } from 'react';
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek,
  format, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarEventType } from './calendarEventTypes';
import { parseEventDate } from './calendarDate';
import './OperationalCalendar.css';

const titleForView = (date, view) => {
  if (view === 'month') return format(date, 'MMMM yyyy', { locale: es });
  if (view === 'day') return format(date, "EEEE d 'de' MMMM", { locale: es });
  const first = startOfWeek(date, { weekStartsOn: 1 });
  const last = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(first, 'd MMM', { locale: es })} – ${format(last, 'd MMM yyyy', { locale: es })}`;
};

const OperationalCalendar = ({ events = [], currentDate, view = 'month', onEventClick, onDateChange, onViewChange }) => {
  const safeDate = useMemo(() => currentDate || new Date(), [currentDate]);
  const days = useMemo(() => {
    if (view === 'day') return [startOfDay(safeDate)];
    if (view === 'week') return eachDayOfInterval({ start: startOfWeek(safeDate, { weekStartsOn: 1 }), end: endOfWeek(safeDate, { weekStartsOn: 1 }) });
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(safeDate), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(safeDate), { weekStartsOn: 1 }),
    });
  }, [safeDate, view]);

  const move = (direction) => {
    const mover = view === 'month' ? addMonths : view === 'week' ? addWeeks : addDays;
    onDateChange?.(mover(safeDate, direction));
  };

  return (
    <section className={`operational-calendar operational-calendar--${view}`} aria-label="Calendario operativo">
      <div className="operational-calendar__toolbar">
        <div className="operational-calendar__navigation">
          <button type="button" onClick={() => move(-1)} aria-label="Periodo anterior">‹</button>
          <button type="button" onClick={() => onDateChange?.(new Date())}>Hoy</button>
          <button type="button" onClick={() => move(1)} aria-label="Periodo siguiente">›</button>
        </div>
        <h2>{titleForView(safeDate, view)}</h2>
        <div className="operational-calendar__views" aria-label="Cambiar vista">
          {[['month', 'Mes'], ['week', 'Semana'], ['day', 'Día']].map(([value, label]) => (
            <button key={value} type="button" className={view === value ? 'is-active' : ''} onClick={() => onViewChange?.(value)}>{label}</button>
          ))}
        </div>
      </div>
      <div className="operational-calendar__weekdays" aria-hidden="true">
        {(view === 'day' ? days : days.slice(0, 7)).map((day) => <span key={day.toISOString()}>{format(day, 'EEE', { locale: es })}</span>)}
      </div>
      <div className="operational-calendar__grid">
        {days.map((day) => {
          const dayEvents = events.filter((event) => {
            const eventDate = parseEventDate(event.start);
            return !Number.isNaN(eventDate.getTime()) && isSameDay(eventDate, day);
          });
          return (
            <article key={day.toISOString()} className={`operational-calendar__day ${view === 'month' && !isSameMonth(day, safeDate) ? 'is-outside' : ''} ${isSameDay(day, new Date()) ? 'is-today' : ''}`}>
              <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, view === 'day' ? "d 'de' MMMM" : 'd', { locale: es })}</time>
              <div className="operational-calendar__events">
                {dayEvents.map((event) => {
                  const type = getCalendarEventType(event.type);
                  return <button key={event.id} type="button" className={`operational-calendar__event operational-calendar__event--${type.tone}`} onClick={() => onEventClick?.(event)} title={event.title}><span>{event.allDay ? '' : format(parseEventDate(event.start), 'HH:mm')}</span>{event.title}</button>;
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default OperationalCalendar;

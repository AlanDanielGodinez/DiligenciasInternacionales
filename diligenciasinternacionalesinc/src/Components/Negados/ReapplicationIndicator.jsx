import React from 'react';
import { differenceInMonths, format, isValid, startOfDay } from 'date-fns';
import './ReapplicationIndicator.css';
const parseDate = (value) => { if (!value) return null; if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) { const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d); } const date = new Date(value); return isValid(date) ? date : null; };
export const getReapplicationStatus = (value, today = new Date()) => {
  const date = parseDate(value); if (!date) return { months: null, duration: 'Sin fecha de aplicación', label: 'Sin fecha de aplicación', tone: 'neutral' };
  const months = Math.max(0, differenceInMonths(startOfDay(today), startOfDay(date))); const years = Math.floor(months / 12); const rest = months % 12;
  const duration = years ? `${years} ${years === 1 ? 'año' : 'años'}${rest ? ` ${rest} ${rest === 1 ? 'mes' : 'meses'}` : ''}` : `${months} ${months === 1 ? 'mes' : 'meses'}`;
  if (months < 10) return { months, duration, label: 'Aún no corresponde', tone: 'danger' };
  if (months < 12) return { months, duration, label: 'Dar seguimiento', tone: 'warning' };
  return { months, duration, label: 'Posible reaplicación', tone: 'success' };
};
const ReapplicationIndicator = ({ date, display = 'status' }) => { const status = getReapplicationStatus(date); const parsed = parseDate(date); const title = status.months === null ? status.label : `${status.duration} transcurridos · ${status.label}`; return <span className={`reapplication-indicator reapplication-indicator--${status.tone} ${display === 'date' ? 'reapplication-indicator--date' : ''}`} title={title}><strong>{display === 'date' ? (parsed ? format(parsed, 'dd/MM/yyyy') : 'Sin fecha') : status.duration}</strong>{display !== 'date' && status.months !== null && <small>{status.label}</small>}</span>; };
export default ReapplicationIndicator;

import React, { useEffect, useMemo, useState } from 'react';
import { getCalendarioAma } from '../../../services/calendarioAma.service';

const pageStyle = {
  minHeight: '100%',
  padding: 28,
  backgroundColor: '#f4f7fb',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 20,
  marginBottom: 22,
  flexWrap: 'wrap',
};

const eyebrowStyle = {
  margin: '0 0 8px',
  color: '#2563eb',
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0,
};

const titleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: 28,
  fontWeight: 800,
};

const subtitleStyle = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: 15,
  lineHeight: 1.5,
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 16,
  marginBottom: 22,
};

const metricCardStyle = {
  padding: 18,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const metricLabelStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: 13,
  fontWeight: 700,
};

const metricValueStyle = {
  margin: '10px 0 0',
  color: '#0f172a',
  fontSize: 28,
  fontWeight: 800,
};

const searchPanelStyle = {
  width: '100%',
  padding: 18,
  marginBottom: 22,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  fontSize: 14,
  color: '#0f172a',
  backgroundColor: '#f8fafc',
  outline: 'none',
};

const tableWrapperStyle = {
  overflowX: 'auto',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.07)',
  backgroundColor: '#ffffff',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#ffffff',
};

const thStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#334155',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  fontSize: 13,
};

const tdStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid #edf2f7',
  color: '#0f172a',
  verticalAlign: 'top',
  fontSize: 14,
};

const mutedTdStyle = {
  ...tdStyle,
  color: '#475569',
  fontSize: 13,
};

const notesStyle = {
  ...tdStyle,
  maxWidth: 320,
  color: '#475569',
  lineHeight: 1.45,
};

const messageStyle = {
  padding: 24,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#334155',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: 180,
  padding: '5px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const typeBadgeStyle = {
  ...badgeStyle,
  color: '#1e3a8a',
  backgroundColor: '#dbeafe',
};

const neutralBadgeStyle = {
  ...badgeStyle,
  color: '#475569',
  backgroundColor: '#e2e8f0',
};

const getValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
  return value;
};

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const formatDate = (value) => {
  if (!hasValue(value)) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('es-MX');
};

const formatTime = (value) => {
  if (!hasValue(value)) return 'N/A';

  const text = String(value).trim();
  const timeMatch = text.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`;

  return text;
};

const getUniqueCount = (items, field) => {
  const values = items
    .map((item) => item[field])
    .filter((value) => hasValue(value))
    .map((value) => String(value).trim().toLowerCase());

  return new Set(values).size;
};

const searchFields = ['grupo', 'tipo', 'lugar', 'notas', 'source_id'];

const CalendarioAmaPostgresPage = () => {
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getCalendarioAma()
      .then((data) => {
        if (mounted) setEventos(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Error al consultar calendario AMA');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEventos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return eventos;

    return eventos.filter((evento) =>
      searchFields.some((field) =>
        String(evento[field] || '')
          .toLowerCase()
          .includes(query)
      )
    );
  }, [eventos, search]);

  const metrics = useMemo(
    () => [
      { label: 'Total de eventos', value: eventos.length },
      { label: 'Eventos visibles', value: filteredEventos.length },
      { label: 'Grupos unicos', value: getUniqueCount(eventos, 'grupo') },
      { label: 'Lugares unicos', value: getUniqueCount(eventos, 'lugar') },
    ],
    [eventos, filteredEventos.length]
  );

  if (loading) return <div style={pageStyle}><div style={messageStyle}>Cargando calendario AMA...</div></div>;
  if (error) return <div style={pageStyle}><div style={messageStyle}>Error: {error}</div></div>;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>PostgreSQL</p>
          <h2 style={titleStyle}>Calendario AMA</h2>
          <p style={subtitleStyle}>
            Vista de solo lectura conectada al backend PostgreSQL.
          </p>
        </div>
      </div>

      <div style={metricsGridStyle}>
        {metrics.map((metric) => (
          <div key={metric.label} style={metricCardStyle}>
            <p style={metricLabelStyle}>{metric.label}</p>
            <p style={metricValueStyle}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div style={searchPanelStyle}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por grupo, tipo, lugar, notas o source ID"
          style={inputStyle}
        />
      </div>

      {eventos.length === 0 ? (
        <div style={messageStyle}>No hay eventos registrados.</div>
      ) : filteredEventos.length === 0 ? (
        <div style={messageStyle}>No se encontraron eventos con ese criterio.</div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Grupo</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Hora</th>
                <th style={thStyle}>Lugar</th>
                <th style={thStyle}>Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredEventos.map((evento) => {
                const tipo = getValue(evento.tipo);

                return (
                  <tr key={evento.id_calendario_ama}>
                    <td style={tdStyle}>{getValue(evento.id_calendario_ama)}</td>
                    <td style={tdStyle}>{getValue(evento.grupo)}</td>
                    <td style={tdStyle}>
                      <span style={tipo === 'N/A' ? neutralBadgeStyle : typeBadgeStyle}>{tipo}</span>
                    </td>
                    <td style={mutedTdStyle}>{formatDate(evento.fecha)}</td>
                    <td style={mutedTdStyle}>{formatTime(evento.hora)}</td>
                    <td style={tdStyle}>{getValue(evento.lugar)}</td>
                    <td style={notesStyle}>{getValue(evento.notas)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CalendarioAmaPostgresPage;

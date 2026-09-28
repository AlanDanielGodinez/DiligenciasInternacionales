import React, { useEffect, useState } from 'react';
import { getHealthTables } from '../../../services/health.service';

const getTableCounts = (data) => {
  if (data?.counts) return data.counts;
  if (data?.data?.counts) return data.data.counts;
  return data;
};

const DashboardPage = () => {
  const [tables, setTables] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getHealthTables()
      .then((data) => {
        console.log('Health tables response:', data);
        if (mounted) setTables(getTableCounts(data));
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Error al consultar salud de tablas');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Cargando datos del dashboard...</div>;
  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>;
  if (!tables) return <div style={{ padding: 20 }}>No hay datos.</div>;

  const fields = [
    'contacto',
    'clientes',
    'solicitudes',
    'documentos',
    'pagos',
    'citas',
    'tipos_tramite',
    'calendario_ama',
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard - PostgreSQL (Health / Tables)</h2>
      <ul>
        {fields.map((f) => (
          <li key={f}>
            <strong>{f}:</strong> {typeof tables[f] !== 'undefined' ? tables[f] : '—'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;

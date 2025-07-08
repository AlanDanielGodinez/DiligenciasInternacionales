import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:5000/api/solicitudes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSolicitudes(res.data);
      } catch (err) {
        console.error('Error al obtener solicitudes:', err);
        setError('No se pudieron cargar las solicitudes');
      } finally {
        setCargando(false);
      }
    };

    fetchSolicitudes();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Solicitudes registradas</h2>

      {cargando ? (
        <p style={styles.loading}>Cargando solicitudes...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : solicitudes.length === 0 ? (
        <p style={styles.noResults}>No hay solicitudes registradas.</p>
      ) : (
        <div style={styles.grid}>
          {solicitudes.map((solicitud) => (
            <div key={solicitud.idsolicitud} style={styles.card}>
              <h3 style={styles.tramite}>{solicitud.tipotramite}</h3>
              <p><strong>Cliente:</strong> {solicitud.nombrecliente}</p>
              <p><strong>Empleado:</strong> {solicitud.nombreempleado}</p>
              <p><strong>Estado:</strong> {solicitud.estado}</p>
              <p><strong>Fecha:</strong> {solicitud.fechasolicitud}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '960px',
    margin: '0 auto',
    backgroundColor: '#f4f4f4',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#2c3e50',
  },
  loading: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: '#777',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tramite: {
    marginBottom: '0.5rem',
    color: '#2c3e50',
  }
};

export default VerSolicitudes;

import React, { useEffect, useState } from 'react';
import axios from 'axios';


const PagosPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitudesPendientes();
  }, []);

  const fetchSolicitudesPendientes = async () => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('TOKEN ENVIADO:', token); // ← 🔍 Aquí ves si el token existe
    const response = await axios.get('http://localhost:5000/api/solicitudes/pendientes-pago', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setSolicitudes(response.data);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="pagos-pendientes-container">
      <h1 className="pagos-pendientes-title">Solicitudes Pendientes de Pago</h1>
      {loading ? (
        <p className="pagos-pendientes-loading">Cargando...</p>
      ) : solicitudes.length === 0 ? (
        <p className="pagos-pendientes-empty">No hay solicitudes pendientes de pago o anticipo.</p>
      ) : (
        <table className="pagos-pendientes-table">
            <thead>
                <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Tipo de Trámite</th>
                <th>Estado</th>
                <th>Fecha del Seguimiento</th>
                </tr>
            </thead>
            <tbody>
                {solicitudes.map((sol) => (
                <tr key={sol.idsolicitud}>
                    <td>{sol.idsolicitud}</td>
                    <td>{sol.nombrecliente}</td>
                    <td>{sol.tipotramite}</td>
                    <td>{sol.estadoseguimiento}</td>
                    <td>{new Date(sol.fecha_actualizacion).toLocaleDateString()}</td>
                </tr>
                ))}
            </tbody>
        </table>
      )}
    </div>
  );
};

export default PagosPendientes;

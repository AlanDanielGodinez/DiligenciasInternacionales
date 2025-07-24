import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PagosPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [documentosPorSolicitud, setDocumentosPorSolicitud] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitudesPendientes();
  }, []);

  const fetchSolicitudesPendientes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/solicitudes/pendientes-pago', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const solicitudesData = response.data;
      setSolicitudes(solicitudesData);

      // Cargar documentos para cada solicitud
      const docsPorSolicitud = {};

      for (const solicitud of solicitudesData) {
        const docRes = await axios.get(`http://localhost:5000/api/documentos/solicitud/${solicitud.idsolicitud}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        docsPorSolicitud[solicitud.idsolicitud] = docRes.data;
      }

      setDocumentosPorSolicitud(docsPorSolicitud);
    } catch (error) {
      console.error('Error al obtener solicitudes o documentos:', error);
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
              <th>Documento</th>
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
                <td>
                  {documentosPorSolicitud[sol.idsolicitud]?.length > 0 ? (
                    documentosPorSolicitud[sol.idsolicitud].map((doc, index) => (
                      <div key={index}>
                        <a
                          href={`http://localhost:5000/uploads/documentos/${doc.archivo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ver-archivo"
                        >
                          Ver {doc.nombredocumento}
                        </a>
                      </div>
                    ))
                  ) : (
                    <span>Sin documento</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PagosPendientes;

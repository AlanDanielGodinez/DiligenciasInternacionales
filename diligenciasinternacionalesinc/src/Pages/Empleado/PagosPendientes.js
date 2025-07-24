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

      const docsPorSolicitud = {};

      for (const solicitud of solicitudesData) {
        const docRes = await axios.get(
          `http://localhost:5000/api/documentos/solicitud/${solicitud.idsolicitud}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const docsFiltrados = docRes.data.filter(doc =>
          doc.nombredocumento.toLowerCase().includes('pago') ||
          doc.nombredocumento.toLowerCase().includes('anticipo')
        );

        docsPorSolicitud[solicitud.idsolicitud] = docsFiltrados;
      }

      setDocumentosPorSolicitud(docsPorSolicitud);
    } catch (error) {
      console.error('Error al obtener solicitudes o documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarPago = async (idSolicitud) => {
    try {
      const token = localStorage.getItem('authToken');
      const idEmpleado = JSON.parse(localStorage.getItem('user'))?.id; // Corregido aquí

      if (!idEmpleado) {
        alert('No se encontró el ID del empleado en localStorage');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/solicitudes/${idSolicitud}/validar-pago`,
        { idEmpleado },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`✅ ${response.data.mensaje}`);
      fetchSolicitudesPendientes(); // Refrescar lista
    } catch (error) {
      console.error('Error al validar pago:', error);
      alert('❌ Error al validar el pago. Revisa la consola para más detalles.');
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
              <th>Documentos</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((sol) => {
              const docs = documentosPorSolicitud[sol.idsolicitud] || [];
              const tieneDocs = docs.length > 0;

              return (
                <tr key={sol.idsolicitud}>
                  <td>{sol.idsolicitud}</td>
                  <td>{sol.nombrecliente}</td>
                  <td>{sol.tipotramite}</td>
                  <td>{sol.estadoseguimiento}</td>
                  <td>{new Date(sol.fecha_actualizacion).toLocaleDateString()}</td>
                  <td>
                    {tieneDocs ? (
                      docs.map((doc, index) => (
                        <div key={index} className="doc-item">
                          <a
                            href={`http://localhost:5000/uploads/documentos/${doc.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ver-archivo"
                          >
                            Ver {doc.nombredocumento}
                          </a>
                          <div className="doc-meta">
                            <small>📅 {new Date(doc.fechasubida).toLocaleDateString()}</small><br />
                            <small>📌 Estado: {doc.estado}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span>Sin documento</span>
                    )}
                  </td>
                  <td>
                    {tieneDocs ? (
                      <button
                        className="btn-validar"
                        onClick={() => validarPago(sol.idsolicitud)}
                      >
                        Validar pago
                      </button>
                    ) : (
                      <span className="no-action">Sin documento</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PagosPendientes;

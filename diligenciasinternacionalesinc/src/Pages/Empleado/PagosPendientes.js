import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AgregarPagoModal from './AgregarPagoModal';
import VerPagoModal from './VerPagoModal';

const PagosPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [documentosPorSolicitud, setDocumentosPorSolicitud] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSolicitudActual, setIdSolicitudActual] = useState(null);
  const [pagosPorSolicitud, setPagosPorSolicitud] = useState({});
  const [modalPagoVisible, setModalPagoVisible] = useState(false);

  useEffect(() => {
    fetchSolicitudesPendientes();
  }, []);

  const fetchSolicitudesPendientes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/solicitudes/pendientes-pago', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const solicitudesData = response.data;
      setSolicitudes(solicitudesData);
      await fetchPagosPorSolicitud(solicitudesData);

      const docsPorSolicitud = {};
      for (const solicitud of solicitudesData) {
        const docRes = await axios.get(
          `http://localhost:5000/api/documentos/solicitud/${solicitud.idsolicitud}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
      const idEmpleado = JSON.parse(localStorage.getItem('user'))?.id;

      if (!idEmpleado) {
        alert('No se encontró el ID del empleado en localStorage');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/solicitudes/${idSolicitud}/validar-pago`,
        { idEmpleado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIdSolicitudActual(idSolicitud);
      setModalAbierto(true);
    } catch (error) {
      console.error('Error al validar pago:', error);
      alert('❌ Error al validar el pago. Revisa la consola para más detalles.');
    }
  };

  const fetchPagosPorSolicitud = async (solicitudes) => {
    const token = localStorage.getItem('authToken');
    const pagos = {};
    for (const sol of solicitudes) {
      try {
        const res = await axios.get(`http://localhost:5000/api/pagos/solicitud/${sol.idsolicitud}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        pagos[sol.idsolicitud] = Array.isArray(res.data) ? res.data : [res.data];
      } catch (err) {
        pagos[sol.idsolicitud] = [];
      }
    }
    setPagosPorSolicitud(pagos);
  };

  const verDocumento = (documento) => {
    const fileUrl = `http://localhost:5000/uploads/documentos/${documento.archivo}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="pp-container">
      <h1 className="pp-title">Solicitudes Pendientes de Pago</h1>
      
      {loading ? (
        <div className="pp-loading">
          <div className="pp-spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="pp-empty-state">
          <svg className="pp-empty-icon" viewBox="0 0 24 24">
            <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M7,7H17V9H7V7M7,11H17V13H7V11M7,15H14V17H7V15Z" />
          </svg>
          <p>No hay solicitudes pendientes de pago o anticipo</p>
        </div>
      ) : (
        <div className="pp-table-container">
          <table className="pp-table">
            <thead>
              <tr>
                <th className="pp-th">ID</th>
                <th className="pp-th">Cliente</th>
                <th className="pp-th">Trámite</th>
                <th className="pp-th">Estado</th>
                <th className="pp-th">Fecha</th>
                <th className="pp-th">Documentos</th>
                <th className="pp-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => {
                const docs = documentosPorSolicitud[sol.idsolicitud] || [];
                const tieneDocs = docs.length > 0;
                const tienePago = pagosPorSolicitud[sol.idsolicitud]?.length > 0;

                return (
                  <tr key={sol.idsolicitud} className="pp-tr">
                    <td className="pp-td">{sol.idsolicitud}</td>
                    <td className="pp-td">{sol.nombrecliente}</td>
                    <td className="pp-td">{sol.tipotramite}</td>
                    <td className="pp-td">
                      <span className={`pp-status pp-status-${sol.estadoseguimiento.replace(/\s+/g, '-')}`}>
                        {sol.estadoseguimiento}
                      </span>
                    </td>
                    <td className="pp-td">{new Date(sol.fecha_actualizacion).toLocaleDateString()}</td>
                    <td className="pp-td">
                      {tieneDocs ? (
                        <div className="pp-docs-list">
                          {docs.map((doc) => (
                            <button
                              key={doc.iddocumento}
                              className="pp-doc-btn"
                              onClick={() => verDocumento(doc)}
                              title={`Ver ${doc.nombredocumento}`}
                            >
                              <svg className="pp-doc-icon" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                              <span>{doc.nombredocumento}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="pp-no-docs">Sin documentos</span>
                      )}
                    </td>
                    <td className="pp-td pp-actions">
                      {tienePago ? (
                        <div className="pp-validated">
                          <button
                            className="pp-view-btn"
                            onClick={() => {
                              setIdSolicitudActual(sol.idsolicitud);
                              setModalPagoVisible(true);
                            }}
                          >
                            <svg className="pp-view-icon" viewBox="0 0 24 24">
                              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                            </svg>
                            Ver pago
                          </button>
                        </div>
                      ) : tieneDocs ? (
                        <button
                          className="pp-validate-btn"
                          onClick={() => validarPago(sol.idsolicitud)}
                        >
                          <svg className="pp-validate-icon" viewBox="0 0 24 24">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                          Validar pago
                        </button>
                      ) : (
                        <span className="pp-no-action">No disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AgregarPagoModal
        visible={modalAbierto}
        onClose={(refresh) => {
          setModalAbierto(false);
          if (refresh) fetchSolicitudesPendientes();
        }}
        idSolicitud={idSolicitudActual}
      />
      <VerPagoModal
        visible={modalPagoVisible}
        onClose={() => setModalPagoVisible(false)}
        idSolicitud={idSolicitudActual}
      />
    </div>
  );
};

export default PagosPendientes;
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DetallesSolicitudModal = ({ solicitudId, isOpen, onClose }) => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && solicitudId) {
      fetchSolicitudCompleta();
    }
  }, [isOpen, solicitudId]);

  const fetchSolicitudCompleta = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`http://localhost:5000/api/solicitudes/${solicitudId}/completo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitud(res.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener solicitud:', err);
      setError('No se pudo cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-wide">
        <button className="modal-close-btn" onClick={onClose}>✖</button>
        <h2>Detalles de Solicitud</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : solicitud ? (
          <>
            <div className="modal-columns">
              {/* Columna izquierda - Información de la solicitud */}
              <div className="modal-column">
                <h3>Información General</h3>
                <p><strong>ID Solicitud:</strong> {solicitud.idsolicitud}</p>
                <p><strong>Tipo de Trámite:</strong> {solicitud.tipotramite}</p>
                <p><strong>Cliente:</strong> {solicitud.nombrecliente}</p>
                <p><strong>Responsable:</strong> {solicitud.nombreempleado}</p>
                <p><strong>Estado Actual:</strong> {solicitud.estado_actual}</p>
                <p><strong>Fecha Solicitud:</strong> {new Date(solicitud.fechasolicitud).toLocaleDateString()}</p>
                <p><strong>Observaciones:</strong> {solicitud.observaciones || 'Ninguna'}</p>
              </div>

              {/* Columna derecha - Seguimientos */}
              <div className="modal-column">
                <h3>Seguimientos</h3>
                {solicitud.seguimientos?.length > 0 ? (
                  <ul className="seguimiento-lista">
                    {solicitud.seguimientos.map(seg => (
                      <li key={seg.idseguimiento} className="seguimiento-item">
                        <p><strong>{seg.estado}</strong> - {new Date(seg.fecha).toLocaleDateString()}</p>
                        <p>{seg.descripcion}</p>
                        <p className="seguimiento-responsable">Responsable: {seg.nombreempleado}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay seguimientos registrados.</p>
                )}
              </div>
            </div>

            {/* Documentos del cliente */}
            <div className="modal-documentos">
              <h3>Documentos Subidos por el Cliente</h3>
              {solicitud.documentos?.length > 0 ? (
                <ul className="documento-lista">
                  {solicitud.documentos.map((doc) => (
                    <li key={doc.iddocumento} className="documento-item">
                      <p><strong>{doc.nombredocumento}</strong> ({doc.tipodocumento})</p>
                      <p>Subido el: {new Date(doc.fechasubida).toLocaleDateString()}</p>
                      <a
                        href={`http://localhost:5000/uploads/documentos/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver documento
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay documentos disponibles.</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DetallesSolicitudModal;

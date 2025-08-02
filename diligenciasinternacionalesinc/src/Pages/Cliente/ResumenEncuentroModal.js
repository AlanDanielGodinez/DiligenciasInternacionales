import React, { useEffect, useState } from 'react';
import axios from 'axios';
 // Archivo CSS separado para los estilos

const ResumenReencuentroModal = ({ idSolicitud, cerrar }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:5000/api/solicitudes/${idSolicitud}/completo`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del viaje.');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [idSolicitud]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatDocName = (doc) => {
    if (doc.nombreDocumento && doc.nombreDocumento.trim() !== '') {
      return doc.nombreDocumento;
    }
    // Si no hay nombreDocumento, usar el nombre del archivo sin el prefijo numérico
    return doc.archivo.replace(/^\d+-/, '');
  };

  const renderLoading = () => (
    <div className="modal-overlay">
      <div className="modal-container loading">
        <div className="spinner"></div>
        <p>Cargando datos del viaje...</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="modal-overlay">
      <div className="modal-container error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={cerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );

  const renderSection = (title, content) => (
    <div className="info-section">
      <h3 className="section-title">{title}</h3>
      <div className="section-content">{content}</div>
    </div>
  );

  const renderPagoItem = (pago) => (
    <div key={pago.idpago} className="pago-item">
      <div className="pago-header">
        <span className={`pago-estado ${pago.estado.toLowerCase()}`}>
          {pago.estado}
        </span>
        <span className="pago-monto">${pago.monto}</span>
      </div>
      <div className="pago-details">
        <p><strong>Método:</strong> {pago.metodopago}</p>
        <p><strong>Fecha:</strong> {formatDate(pago.fecha)}</p>
      </div>
    </div>
  );

  const renderDocumentoItem = (doc) => (
  <li key={doc.iddocumento} className="documento-item">
    <span className="documento-name">
      📄 {formatDocName(doc)}
    </span>
    <span className="documento-type">({doc.tipoDocumento})</span>
    <a
      href={`http://localhost:5000/uploads/documentos/${doc.archivo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="documento-link"
    >
      Ver
    </a>
  </li>
);


  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Resumen de tu viaje</h2>
          <button className="close-btn" onClick={cerrar}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {renderSection(
            'Datos del Cliente',
            <p className="client-name">{data.nombrecliente}</p>
          )}

          {renderSection(
            'Trámite',
            <>
              <p><strong>Tipo:</strong> {data.tipotramite}</p>
              <p><strong>Fecha solicitud:</strong> {formatDate(data.fechasolicitud)}</p>
            </>
          )}

          {renderSection(
            'Itinerario',
            data.itinerario ? (
              <div className="itinerario-details">
                <div className="flight-info">
                  <span className="flight-number">{data.itinerario.numero_vuelo}</span>
                  <span className="airline">{data.itinerario.nombreaerolinea}</span>
                </div>
                <div className="date-row">
                  <div className="date-item">
                    <span className="date-label">Salida</span>
                    <span className="date-value">{formatDate(data.itinerario.fecha_salida)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">Regreso</span>
                    <span className="date-value">{formatDate(data.itinerario.fecha_regreso)}</span>
                  </div>
                </div>
                <div className="hotel-info">
                  <p className="hotel-name">{data.itinerario.hotel}</p>
                  <p><strong>Dirección:</strong> {data.itinerario.direccion_hotel}</p>
                  <p><strong>Contacto:</strong> {data.itinerario.contacto_hotel}</p>
                </div>
              </div>
            ) : (
              <p className="no-data">No hay itinerario registrado aún.</p>
            )
          )}

          {renderSection(
            'Pagos',
            data.pagos.length > 0 ? (
              <div className="pagos-list">
                {data.pagos.map(renderPagoItem)}
              </div>
            ) : (
              <p className="no-data">No hay pagos registrados.</p>
            )
          )}

          {renderSection(
            'Documentos',
            data.documentos.length > 0 ? (
              <ul className="documentos-list">
                {data.documentos.map(renderDocumentoItem)}
              </ul>
            ) : (
              <p className="no-data">No hay documentos disponibles.</p>
            )
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={cerrar}>
            Cerrar resumen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumenReencuentroModal;
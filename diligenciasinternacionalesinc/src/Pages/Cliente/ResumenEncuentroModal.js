import React, { useEffect, useState } from 'react';
import axios from 'axios';


const ResumenReencuentroModal = ({ idSolicitud, cerrar }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/solicitudes/${idSolicitud}/completo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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

  if (loading) {
    return (
      <div className="modal-reencuentro-overlay">
        <div className="modal-reencuentro-container">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-reencuentro-overlay">
        <div className="modal-reencuentro-container">
          <p>{error}</p>
          <button onClick={cerrar}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-reencuentro-overlay">
      <div className="modal-reencuentro-container">
        <h2>Resumen de tu viaje</h2>

        <div className="tarjeta-info">
          <h3>Datos del Cliente</h3>
          <p><strong>Nombre:</strong> {data.nombrecliente}</p>
        </div>

        <div className="tarjeta-info">
          <h3>Trámite</h3>
          <p><strong>Tipo:</strong> {data.tipotramite}</p>
          <p><strong>Fecha solicitud:</strong> {new Date(data.fechasolicitud).toLocaleDateString()}</p>
        </div>

        <div className="tarjeta-info">
          <h3>Itinerario</h3>
          {data.itinerario ? (
            <>
              <p><strong>Vuelo:</strong> {data.itinerario.numero_vuelo} con {data.itinerario.nombreaerolinea}</p>
              <p><strong>Salida:</strong> {new Date(data.itinerario.fecha_salida).toLocaleDateString()}</p>
              <p><strong>Regreso:</strong> {new Date(data.itinerario.fecha_regreso).toLocaleDateString()}</p>
              <p><strong>Hotel:</strong> {data.itinerario.hotel}</p>
              <p><strong>Dirección hotel:</strong> {data.itinerario.direccion_hotel}</p>
              <p><strong>Contacto hotel:</strong> {data.itinerario.contacto_hotel}</p>
            </>
          ) : (
            <p>No hay itinerario registrado aún.</p>
          )}
        </div>

        <div className="tarjeta-info">
          <h3>Pagos</h3>
          {data.pagos.length > 0 ? (
            data.pagos.map((pago) => (
              <div key={pago.idpago} className="pago-item">
                <p><strong>Monto:</strong> ${pago.monto}</p>
                <p><strong>Método:</strong> {pago.metodopago}</p>
                <p><strong>Estado:</strong> {pago.estado}</p>
                <p><strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No hay pagos registrados.</p>
          )}
        </div>

        <div className="tarjeta-info">
          <h3>Documentos</h3>
          {data.documentos.length > 0 ? (
            <ul>
              {data.documentos.map((doc) => (
                <li key={doc.iddocumento}>
                  {doc.nombreDocumento} ({doc.tipoDocumento}) -{' '}
                  <a
                    href={`http://localhost:5000/uploads/documentos/${doc.archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay documentos disponibles.</p>
          )}
        </div>

        <div className="modal-reencuentro-footer">
          <button onClick={cerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ResumenReencuentroModal;

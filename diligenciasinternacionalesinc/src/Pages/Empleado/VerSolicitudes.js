import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AgregarSeguimientoModal from './AgregarSeguimientoModal';
import DetallesSolicitudModal from './DetallesSolicitudModal';


const VerSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitudSeleccionadaId, setSolicitudSeleccionadaId] = useState(null);


  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/solicitudes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const datosOrdenados = res.data.sort((a, b) => {
        const fechaA = new Date(a.fechasolicitud);
        const fechaB = new Date(b.fechasolicitud);
        return orden === 'recientes' ? fechaB - fechaA : fechaA - fechaB;
      });

      setSolicitudes(datosOrdenados);
    } catch (err) {
      console.error('Error al obtener solicitudes:', err);
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [orden]);

  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const busqueda = filtro.toLowerCase();
    return (
      solicitud.tipotramite.toLowerCase().includes(busqueda) ||
      solicitud.nombrecliente.toLowerCase().includes(busqueda) ||
      solicitud.nombreempleado.toLowerCase().includes(busqueda) ||
      solicitud.estado.toLowerCase().includes(busqueda)
    );
  });

  const getEstadoColor = (estado) => {
    const estadosColores = {
      'iniciado': '#3498db',
      'finalizado': '#2ecc71',
      'en espera': '#f39c12',
      'cancelado': '#e74c3c',
      'pendiente': '#9b59b6',
      'documentos entregados': '#1abc9c',
      'pago completado': '#27ae60'
    };
    return estadosColores[estado.toLowerCase()] || '#7f8c8d';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const abrirModalSeguimiento = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalVisible(true);
  };

  const cerrarModalSeguimiento = () => {
    setModalVisible(false);
    setSolicitudSeleccionada(null);
  };

  const handleSeguimientoAgregado = () => {
    fetchSolicitudes(); // Recargar solicitudes tras agregar seguimiento
  };

  return (
    <div className="solicitudes-container">
      <div className="solicitudes-header">
        <h1 className="solicitudes-title">
          <span className="solicitudes-title-icon">📋</span>
          Solicitudes Registradas
          <span className="solicitudes-count">{solicitudes.length}</span>
        </h1>

        <div className="solicitudes-controls">
          <div className="solicitudes-search">
            <input
              type="text"
              placeholder="Buscar solicitudes..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="solicitudes-search-input"
            />
            <span className="solicitudes-search-icon">🔍</span>
          </div>

          <div className="solicitudes-sort">
            <label>Ordenar por:</label>
            <select 
              value={orden} 
              onChange={(e) => setOrden(e.target.value)}
              className="solicitudes-sort-select"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
            </select>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="solicitudes-loading">
          <div className="solicitudes-spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      ) : error ? (
        <div className="solicitudes-error">
          <div className="solicitudes-error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="solicitudes-retry-btn">Reintentar</button>
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="solicitudes-empty">
          <div className="solicitudes-empty-icon">📭</div>
          <h3>No se encontraron solicitudes</h3>
          <p>{filtro ? 'Intenta con otro término de búsqueda' : 'No hay solicitudes registradas aún'}</p>
        </div>
      ) : (
        <div className="solicitudes-grid">
          {solicitudesFiltradas.map((solicitud) => (
            <div key={solicitud.idsolicitud} className="solicitud-card" style={{ '--estado-color': getEstadoColor(solicitud.estado) }}>
              <div className="solicitud-card-header">
                <h3 className="solicitud-tramite">{solicitud.tipotramite}</h3>
                <span className="solicitud-estado" style={{ backgroundColor: getEstadoColor(solicitud.estado) }}>
                  {solicitud.estado}
                </span>
              </div>

              <div className="solicitud-card-body">
                <div className="solicitud-info">
                  <span className="solicitud-info-icon">👤</span>
                  <div>
                    <p className="solicitud-info-label">Cliente</p>
                    <p className="solicitud-info-value">{solicitud.nombrecliente}</p>
                  </div>
                </div>
                <div className="solicitud-info">
                  <span className="solicitud-info-icon">💼</span>
                  <div>
                    <p className="solicitud-info-label">Responsable</p>
                    <p className="solicitud-info-value">{solicitud.nombreempleado}</p>
                  </div>
                </div>
                <div className="solicitud-info">
                  <span className="solicitud-info-icon">📅</span>
                  <div>
                    <p className="solicitud-info-label">Fecha</p>
                    <p className="solicitud-info-value">{formatearFecha(solicitud.fechasolicitud)}</p>
                  </div>
                </div>
              </div>

              <div className="solicitud-card-footer">
                <button
                  className="solicitud-action-btn solicitud-details-btn"
                  onClick={() => {
                    setSolicitudSeleccionadaId(solicitud.idsolicitud);
                    setModalAbierto(true);
                  }}
                >
                  Ver detalles
                </button>

                <button className="solicitud-action-btn solicitud-edit-btn">Editar</button>
                <button
                  className="solicitud-action-btn solicitud-followup-btn"
                  onClick={() => abrirModalSeguimiento(solicitud)}
                >
                  ➕ Seguimiento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AgregarSeguimientoModal
        isOpen={modalVisible}
        onClose={cerrarModalSeguimiento}
        idSolicitud={solicitudSeleccionada?.idsolicitud}
        onSeguimientoAgregado={handleSeguimientoAgregado}
      />
      <DetallesSolicitudModal
        solicitudId={solicitudSeleccionadaId}
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />

    </div>
  );
};

export default VerSolicitudes;

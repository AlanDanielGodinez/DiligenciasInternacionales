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

  // Modal seguimiento
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // Modal detalles
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitudSeleccionadaId, setSolicitudSeleccionadaId] = useState(null);

  // Modal entregar documentos
  const [modalEntregarDocs, setModalEntregarDocs] = useState(false);
  const [archivos, setArchivos] = useState({
    documento1: null,
    documento2: null,
    documento3: null
  });

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
      'pendiente de entregar los documentos finales': '#e67e22',
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
    fetchSolicitudes();
  };

  const handleFileChange = (e) => {
    setArchivos({ ...archivos, [e.target.name]: e.target.files[0] });
  };

  const enviarDocumentos = async () => {
    const token = localStorage.getItem('authToken');
    const idEmpleado = JSON.parse(localStorage.getItem('user'))?.id;

    if (!archivos.documento1 || !archivos.documento2 || !archivos.documento3) {
      return alert('Debes seleccionar los 3 documentos');
    }

    const formData = new FormData();
    formData.append('documento1', archivos.documento1);
    formData.append('documento2', archivos.documento2);
    formData.append('documento3', archivos.documento3);
    formData.append('idEmpleado', idEmpleado);

    try {
      await axios.post(
        `http://localhost:5000/api/solicitudes/${solicitudSeleccionada.idsolicitud}/entregar-documentos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('✅ Documentos entregados correctamente');
      setModalEntregarDocs(false);
      fetchSolicitudes();
    } catch (err) {
      console.error('Error al entregar documentos:', err);
      alert('❌ Error al entregar los documentos');
    }
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

                {solicitud.estado.toLowerCase() === "pendiente de entregar los documentos finales" ? (
                  <button
                    className="solicitud-action-btn solicitud-docs-btn"
                    onClick={() => {
                      setSolicitudSeleccionada(solicitud);
                      setArchivos({ documento1: null, documento2: null, documento3: null });
                      setModalEntregarDocs(true);
                    }}
                  >
                    📄 Entregar documentos
                  </button>
                ) : null}

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

      {/* Modal seguimiento */}
      <AgregarSeguimientoModal
        isOpen={modalVisible}
        onClose={cerrarModalSeguimiento}
        idSolicitud={solicitudSeleccionada?.idsolicitud}
        onSeguimientoAgregado={handleSeguimientoAgregado}
        tipoTramite={solicitudSeleccionada?.tipotramite}
      />

      {/* Modal detalles */}
      <DetallesSolicitudModal
        solicitudId={solicitudSeleccionadaId}
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />

      {/* Modal entregar documentos */}
      {modalEntregarDocs && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Subir Documentos Oficiales</h2>

            <div className="form-group">
              <label>Documento 1</label>
              <input type="file" name="documento1" onChange={handleFileChange} />
            </div>

            <div className="form-group">
              <label>Documento 2</label>
              <input type="file" name="documento2" onChange={handleFileChange} />
            </div>

            <div className="form-group">
              <label>Documento 3</label>
              <input type="file" name="documento3" onChange={handleFileChange} />
            </div>

            <div className="modal-buttons">
              <button onClick={() => setModalEntregarDocs(false)}>Cancelar</button>
              <button onClick={enviarDocumentos}>Subir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerSolicitudes;
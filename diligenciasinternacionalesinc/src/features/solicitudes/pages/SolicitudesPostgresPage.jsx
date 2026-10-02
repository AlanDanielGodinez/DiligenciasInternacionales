import React, { useEffect, useMemo, useState } from 'react';
import {
  getDocumentosBySolicitud,
  getSolicitudById,
  getSolicitudes,
} from '../../../services/solicitudes.service';
import { downloadDocumentoAutenticado, describeDownloadError } from '../../../utils/downloadDocumento';

const pageStyle = {
  minHeight: '100%',
  padding: 28,
  backgroundColor: '#f4f7fb',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 20,
  marginBottom: 22,
  flexWrap: 'wrap',
};

const eyebrowStyle = {
  margin: '0 0 8px',
  color: '#2563eb',
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0,
};

const titleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: 28,
  fontWeight: 800,
};

const subtitleStyle = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: 15,
  lineHeight: 1.5,
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 16,
  marginBottom: 22,
};

const metricCardStyle = {
  padding: 18,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const metricLabelStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: 13,
  fontWeight: 700,
};

const metricValueStyle = {
  margin: '10px 0 0',
  color: '#0f172a',
  fontSize: 28,
  fontWeight: 800,
};

const searchPanelStyle = {
  width: '100%',
  padding: 18,
  marginBottom: 22,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  fontSize: 14,
  color: '#0f172a',
  backgroundColor: '#f8fafc',
  outline: 'none',
};

const tableWrapperStyle = {
  overflowX: 'auto',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.07)',
  backgroundColor: '#ffffff',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#ffffff',
};

const thStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#334155',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  fontSize: 13,
};

const tdStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid #edf2f7',
  color: '#0f172a',
  verticalAlign: 'top',
  fontSize: 14,
};

const mutedTdStyle = {
  ...tdStyle,
  color: '#475569',
  fontSize: 13,
};

const messageStyle = {
  padding: 24,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#334155',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: 180,
  padding: '5px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const statusBadgeStyle = {
  ...badgeStyle,
  color: '#1e3a8a',
  backgroundColor: '#dbeafe',
};

const neutralBadgeStyle = {
  ...badgeStyle,
  color: '#475569',
  backgroundColor: '#e2e8f0',
};

const originBadgeStyle = {
  ...badgeStyle,
  color: '#334155',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  fontWeight: 600,
};

const actionButtonStyle = {
  padding: '8px 12px',
  border: '1px solid #bfdbfe',
  borderRadius: 8,
  color: '#1d4ed8',
  backgroundColor: '#eff6ff',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  backgroundColor: 'rgba(15, 23, 42, 0.45)',
};

const modalCardStyle = {
  width: '100%',
  maxWidth: 980,
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
};

const previewModalCardStyle = {
  ...modalCardStyle,
  maxWidth: 1100,
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  padding: '22px 24px',
  borderBottom: '1px solid #e2e8f0',
};

const modalTitleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: 22,
  fontWeight: 800,
};

const modalSubtitleStyle = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: 14,
};

const closeButtonStyle = {
  padding: '8px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  color: '#334155',
  backgroundColor: '#ffffff',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const modalBodyStyle = {
  padding: 24,
};

const previewFrameStyle = {
  width: '100%',
  height: '70vh',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  backgroundColor: '#f8fafc',
};

const modalActionsStyle = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const sectionStyle = {
  marginBottom: 24,
};

const sectionTitleStyle = {
  margin: '0 0 12px',
  color: '#0f172a',
  fontSize: 16,
  fontWeight: 800,
};

const detailGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
};

const detailItemStyle = {
  padding: 14,
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
};

const detailLabelStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: 12,
  fontWeight: 700,
};

const detailValueStyle = {
  margin: '7px 0 0',
  color: '#0f172a',
  fontSize: 14,
  lineHeight: 1.45,
  wordBreak: 'break-word',
};

const modalMessageStyle = {
  marginBottom: 16,
  padding: 12,
  color: '#92400e',
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: 10,
  fontSize: 14,
};

const documentCardStyle = {
  padding: 14,
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
};

const documentGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const documentTitleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: 15,
  fontWeight: 800,
};

const documentMetaStyle = {
  margin: '8px 0 0',
  color: '#475569',
  fontSize: 13,
  lineHeight: 1.45,
  wordBreak: 'break-word',
};

const linkButtonStyle = {
  display: 'inline-flex',
  marginTop: 10,
  marginRight: 8,
  padding: '8px 12px',
  border: 'none',
  borderRadius: 8,
  color: '#ffffff',
  backgroundColor: '#1d4ed8',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
};

const secondaryLinkButtonStyle = {
  ...linkButtonStyle,
  backgroundColor: '#0f766e',
};

const migratedBadgeStyle = {
  ...badgeStyle,
  maxWidth: 'none',
  marginTop: 8,
  color: '#854d0e',
  backgroundColor: '#fef3c7',
};


const linkedBadgeStyle = {
  ...badgeStyle,
  maxWidth: 'none',
  marginTop: 8,
  marginRight: 8,
  color: '#065f46',
  backgroundColor: '#d1fae5',
};

const legacyBadgeStyle = {
  ...badgeStyle,
  maxWidth: 'none',
  marginTop: 8,
  marginRight: 8,
  color: '#1e3a8a',
  backgroundColor: '#dbeafe',
};

const getValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
  return value;
};

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const buildClientName = (solicitud) => {
  const parts = [
    solicitud.cliente_nombre,
    solicitud.cliente_apellido_paterno,
    solicitud.cliente_apellido_materno,
  ]
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
    .map((value) => String(value).trim());

  return parts.length > 0 ? parts.join(' ') : 'N/A';
};

const formatDate = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('es-MX');
};

const isWebUrl = (value) => {
  const text = String(value || '').trim().toLowerCase();
  return text.startsWith('http://') || text.startsWith('https://');
};

const getDrivePreviewUrl = (documento) => {
  if (!documento?.drive_file_id) return null;
  return `https://drive.google.com/file/d/${documento.drive_file_id}/preview`;
};

// La descarga exige sesión: se hace como blob con el token (ver utils/downloadDocumento.js).
const descargarDocumento = (documento) =>
  downloadDocumentoAutenticado(documento).catch((error) => window.alert(describeDownloadError(error)));

const openExternalLink = (link) => {
  if (!link) return;
  window.open(link, '_blank', 'noopener,noreferrer');
};

const formatFileSize = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return 'N/A';

  const size = Number(value);
  if (Number.isNaN(size)) return 'N/A';

  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${size} B`;
};

const getClientId = (solicitud) => solicitud.id_cliente || solicitud.cliente_id;

const searchFields = [
  'id_solicitud',
  'cliente_nombre',
  'cliente_apellido_paterno',
  'cliente_apellido_materno',
  'cliente_telefono',
  'cliente_correo',
  'tipo_nombre',
  'estado_actual',
  'origen_registro',
  'observaciones',
];

const SolicitudesPostgresPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);
  const [exactSolicitud, setExactSolicitud] = useState(null);
  const [exactSearchLoading, setExactSearchLoading] = useState(false);
  const [exactSearchMessage, setExactSearchMessage] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getSolicitudes({ limit: 500, offset: 0 })
      .then((data) => {
        if (mounted) setSolicitudes(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Error al consultar solicitudes');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSolicitudes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return solicitudes;

    return solicitudes.filter((solicitud) =>
      searchFields.some((field) =>
        String(solicitud[field] || '')
          .toLowerCase()
          .includes(query)
      )
    );
  }, [solicitudes, search]);

  const metrics = useMemo(() => {
    const conCliente = solicitudes.filter((solicitud) => buildClientName(solicitud) !== 'N/A').length;
    const conTipoTramite = solicitudes.filter((solicitud) => hasValue(solicitud.tipo_nombre)).length;

    return [
      { label: 'Total de solicitudes', value: solicitudes.length },
      { label: 'Solicitudes visibles', value: filteredSolicitudes.length },
      { label: 'Con cliente', value: conCliente },
      { label: 'Con tipo de tramite', value: conTipoTramite },
    ];
  }, [solicitudes, filteredSolicitudes.length]);

  const trimmedSearch = search.trim();
  const isNumericSearch = /^\d+$/.test(trimmedSearch);
  const displaySolicitudes = filteredSolicitudes.length > 0 ? filteredSolicitudes : exactSolicitud ? [exactSolicitud] : [];

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setExactSolicitud(null);
    setExactSearchMessage(null);
  };

  const handleExactSearch = async () => {
    setExactSearchLoading(true);
    setExactSearchMessage(null);
    setExactSolicitud(null);

    try {
      const solicitud = await getSolicitudById(trimmedSearch);

      if (solicitud?.id_solicitud) {
        setExactSolicitud(solicitud);
      } else {
        setExactSearchMessage('No se encontró la solicitud en base de datos.');
      }
    } catch (err) {
      setExactSearchMessage('No se encontró la solicitud en base de datos.');
    } finally {
      setExactSearchLoading(false);
    }
  };

  const handleViewSolicitud = async (solicitud) => {
    setSelectedSolicitud(solicitud);
    setDocumentos([]);
    setDetailLoading(true);
    setDocumentsLoading(true);
    setDetailError(null);
    setDocumentsError(null);

    try {
      const detalle = await getSolicitudById(solicitud.id_solicitud);
      setSelectedSolicitud(detalle || solicitud);
    } catch (err) {
      setSelectedSolicitud(solicitud);
      setDetailError('No se pudo consultar el detalle completo. Se muestra la informacion disponible en la fila.');
    } finally {
      setDetailLoading(false);
    }

    try {
      const docs = await getDocumentosBySolicitud(solicitud.id_solicitud);
      setDocumentos(docs);
    } catch (err) {
      setDocumentos([]);
      setDocumentsError('No se pudieron consultar los documentos de esta solicitud.');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedSolicitud(null);
    setDocumentos([]);
    setDetailLoading(false);
    setDocumentsLoading(false);
    setDetailError(null);
    setDocumentsError(null);
    setPreviewDocument(null);
  };

  const handleViewDocument = (documento) => {
    if (documento.drive_file_id) {
      setPreviewDocument(documento);
      return;
    }

    if (documento.web_view_link) {
      openExternalLink(documento.web_view_link);
    }
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
  };

  if (loading) return <div style={pageStyle}><div style={messageStyle}>Cargando solicitudes...</div></div>;
  if (error) return <div style={pageStyle}><div style={messageStyle}>Error: {error}</div></div>;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>PostgreSQL</p>
          <h2 style={titleStyle}>Solicitudes</h2>
          <p style={subtitleStyle}>
            Vista de solo lectura conectada al backend PostgreSQL.
          </p>
        </div>
      </div>

      <div style={metricsGridStyle}>
        {metrics.map((metric) => (
          <div key={metric.label} style={metricCardStyle}>
            <p style={metricLabelStyle}>{metric.label}</p>
            <p style={metricValueStyle}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div style={searchPanelStyle}>
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por solicitud, cliente, telefono, correo, tramite, estado u origen"
          style={inputStyle}
        />
      </div>

      {solicitudes.length === 0 ? (
        <div style={messageStyle}>No hay solicitudes registradas.</div>
      ) : displaySolicitudes.length === 0 ? (
        <div style={messageStyle}>
          <p style={{ margin: '0 0 12px' }}>No se encontraron solicitudes con ese criterio.</p>
          {isNumericSearch && (
            <button type="button" onClick={handleExactSearch} style={actionButtonStyle} disabled={exactSearchLoading}>
              {exactSearchLoading ? 'Buscando...' : 'Buscar solicitud exacta en base de datos'}
            </button>
          )}
          {exactSearchMessage && <p style={{ margin: '12px 0 0', color: '#92400e' }}>{exactSearchMessage}</p>}
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID solicitud</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Telefono</th>
                <th style={thStyle}>Correo</th>
                <th style={thStyle}>Tipo de tramite</th>
                <th style={thStyle}>Estado actual</th>
                <th style={thStyle}>Fecha inicio</th>
                <th style={thStyle}>Origen</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displaySolicitudes.map((solicitud) => {
                const estadoActual = getValue(solicitud.estado_actual);
                const origenRegistro = getValue(solicitud.origen_registro);

                return (
                  <tr key={solicitud.id_solicitud}>
                    <td style={tdStyle}>{getValue(solicitud.id_solicitud)}</td>
                    <td style={tdStyle}>{buildClientName(solicitud)}</td>
                    <td style={tdStyle}>{getValue(solicitud.cliente_telefono)}</td>
                    <td style={tdStyle}>{getValue(solicitud.cliente_correo)}</td>
                    <td style={tdStyle}>{getValue(solicitud.tipo_nombre)}</td>
                    <td style={tdStyle}>
                      <span style={estadoActual === 'N/A' ? neutralBadgeStyle : statusBadgeStyle}>
                        {estadoActual}
                      </span>
                    </td>
                    <td style={mutedTdStyle}>{formatDate(solicitud.fecha_inicio)}</td>
                    <td style={tdStyle}>
                      <span title={String(origenRegistro)} style={origenRegistro === 'N/A' ? neutralBadgeStyle : originBadgeStyle}>
                        {origenRegistro}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => handleViewSolicitud(solicitud)} style={actionButtonStyle}>
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedSolicitud && (
        <div style={overlayStyle}>
          <div style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={modalTitleStyle}>Detalle de solicitud</h3>
                <p style={modalSubtitleStyle}>
                  Solicitud #{getValue(selectedSolicitud.id_solicitud)} · {buildClientName(selectedSolicitud)}
                </p>
              </div>
              <button type="button" onClick={handleCloseModal} style={closeButtonStyle}>
                Cerrar
              </button>
            </div>

            <div style={modalBodyStyle}>
              {detailLoading && <div style={modalMessageStyle}>Cargando detalle de solicitud...</div>}
              {detailError && <div style={modalMessageStyle}>{detailError}</div>}

              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Datos de solicitud</h4>
                <div style={detailGridStyle}>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>ID solicitud</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.id_solicitud)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Tipo de tramite</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.tipo_nombre)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Estado actual</p>
                    <p style={detailValueStyle}>
                      <span style={getValue(selectedSolicitud.estado_actual) === 'N/A' ? neutralBadgeStyle : statusBadgeStyle}>
                        {getValue(selectedSolicitud.estado_actual)}
                      </span>
                    </p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Fecha inicio</p>
                    <p style={detailValueStyle}>{formatDate(selectedSolicitud.fecha_inicio)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Fecha cierre</p>
                    <p style={detailValueStyle}>{formatDate(selectedSolicitud.fecha_cierre)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Origen registro</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.origen_registro)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Observaciones</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.observaciones)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Source ID</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.source_id)}</p>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Datos del cliente</h4>
                <div style={detailGridStyle}>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>ID cliente</p>
                    <p style={detailValueStyle}>{getValue(getClientId(selectedSolicitud))}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Cliente</p>
                    <p style={detailValueStyle}>{buildClientName(selectedSolicitud)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Telefono</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.cliente_telefono)}</p>
                  </div>
                  <div style={detailItemStyle}>
                    <p style={detailLabelStyle}>Correo</p>
                    <p style={detailValueStyle}>{getValue(selectedSolicitud.cliente_correo)}</p>
                  </div>
                </div>
              </div>

              <div style={{ ...sectionStyle, marginBottom: 0 }}>
                <h4 style={sectionTitleStyle}>Documentos</h4>
                {documentsLoading && <div style={modalMessageStyle}>Cargando documentos...</div>}
                {documentsError && <div style={modalMessageStyle}>{documentsError}</div>}
                {!documentsLoading && documentos.length === 0 ? (
                  <div style={messageStyle}>No hay documentos registrados para esta solicitud.</div>
                ) : (
                  <div style={documentGridStyle}>
                    {documentos.map((documento) => {
                      const archivo = getValue(documento.url_archivo);
                      const hasViewLink = hasValue(documento.web_view_link);
                      const hasDownloadLink = hasValue(documento.web_content_link);
                      const hasBackendDownload = hasValue(documento.drive_file_id);
                      const hasPreview = hasBackendDownload || hasViewLink;
                      const hasDriveLinks = hasPreview || hasDownloadLink;
                      const isMatched = documento.drive_match_status === 'matched';
                      const isLegacyAppSheet = documento.origen_documento === 'legacy_appsheet';

                      return (
                        <div key={documento.id_documento} style={documentCardStyle}>
                          <h5 style={documentTitleStyle}>{getValue(documento.nombre_documento)}</h5>
                          <div>
                            {isMatched && <span style={linkedBadgeStyle}>Vinculado a Drive</span>}
                            {isLegacyAppSheet && <span style={legacyBadgeStyle}>Legado AppSheet</span>}
                          </div>
                          <p style={documentMetaStyle}><strong>ID:</strong> {getValue(documento.id_documento)}</p>
                          <p style={documentMetaStyle}><strong>Tipo:</strong> {getValue(documento.tipo_documento)}</p>
                          <p style={documentMetaStyle}><strong>Estado:</strong> {getValue(documento.estado_documento)}</p>
                          <p style={documentMetaStyle}><strong>Fecha subida:</strong> {formatDate(documento.fecha_subida)}</p>
                          {hasValue(documento.mime_type) && (
                            <p style={documentMetaStyle}><strong>Tipo archivo:</strong> {documento.mime_type}</p>
                          )}
                          {hasValue(documento.tamano_bytes) && (
                            <p style={documentMetaStyle}><strong>Tamaño:</strong> {formatFileSize(documento.tamano_bytes)}</p>
                          )}
                          <p style={documentMetaStyle}><strong>Observaciones:</strong> {getValue(documento.observaciones)}</p>
                          <p style={documentMetaStyle}><strong>Archivo:</strong></p>
                          {hasDriveLinks ? (
                            <div>
                              {hasPreview && (
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(documento)}
                                  style={linkButtonStyle}
                                >
                                  Ver
                                </button>
                              )}
                              {(hasBackendDownload || hasDownloadLink) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    hasBackendDownload
                                      ? descargarDocumento(documento)
                                      : openExternalLink(documento.web_content_link)
                                  }
                                  style={secondaryLinkButtonStyle}
                                >
                                  Descargar
                                </button>
                              )}
                            </div>
                          ) : archivo === 'N/A' ? (
                            <p style={documentMetaStyle}>Sin archivo</p>
                          ) : isWebUrl(archivo) ? (
                            <button type="button" onClick={() => openExternalLink(archivo)} style={linkButtonStyle}>
                              Abrir documento
                            </button>
                          ) : (
                            <>
                              <p style={documentMetaStyle}>{archivo}</p>
                              <span style={migratedBadgeStyle}>Referencia migrada</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewDocument && (
        <div style={overlayStyle}>
          <div style={previewModalCardStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={modalTitleStyle}>{getValue(previewDocument.nombre_documento)}</h3>
                <p style={modalSubtitleStyle}>Vista previa del documento vinculado a Google Drive.</p>
              </div>
              <div style={modalActionsStyle}>
                {previewDocument.web_view_link && (
                  <button
                    type="button"
                    onClick={() => openExternalLink(previewDocument.web_view_link)}
                    style={actionButtonStyle}
                  >
                    Abrir en Drive
                  </button>
                )}
                <button type="button" onClick={handleClosePreview} style={closeButtonStyle}>
                  Cerrar
                </button>
              </div>
            </div>
            <div style={modalBodyStyle}>
              {getDrivePreviewUrl(previewDocument) ? (
                <iframe
                  title={getValue(previewDocument.nombre_documento)}
                  src={getDrivePreviewUrl(previewDocument)}
                  style={previewFrameStyle}
                  allow="autoplay"
                />
              ) : (
                <div style={messageStyle}>No hay vista previa disponible para este documento.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesPostgresPage;

import React, { useEffect, useMemo, useState } from 'react';
import { getClienteById, getClientes } from '../../../services/clientes.service';

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

const messageStyle = {
  padding: 24,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#334155',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
};

const statusBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 48,
  justifyContent: 'center',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const activeBadgeStyle = {
  ...statusBadgeStyle,
  color: '#065f46',
  backgroundColor: '#d1fae5',
};

const inactiveBadgeStyle = {
  ...statusBadgeStyle,
  color: '#7f1d1d',
  backgroundColor: '#fee2e2',
};

const unknownBadgeStyle = {
  ...statusBadgeStyle,
  color: '#475569',
  backgroundColor: '#e2e8f0',
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
  maxWidth: 760,
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
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

const getValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
  return value;
};

const formatDate = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('es-MX');
};

const buildFullName = (cliente) => {
  const parts = [cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno]
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
    .map((value) => String(value).trim());

  return parts.length > 0 ? parts.join(' ') : 'N/A';
};

const getActivoText = (activo) => {
  if (activo === null || activo === undefined || String(activo).trim() === '') return 'N/A';
  if (activo === true || activo === 1 || activo === '1' || String(activo).toLowerCase() === 'true') return 'Si';
  if (activo === false || activo === 0 || activo === '0' || String(activo).toLowerCase() === 'false') return 'No';
  return String(activo);
};

const getActivoBadgeStyle = (activoText) => {
  if (activoText === 'Si') return activeBadgeStyle;
  if (activoText === 'No') return inactiveBadgeStyle;
  return unknownBadgeStyle;
};

const searchFields = [
  'nombre',
  'apellido_paterno',
  'apellido_materno',
  'telefono',
  'correo',
  'estado',
  'ciudad',
];

const ClientesPostgresPage = () => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getClientes()
      .then((data) => {
        if (mounted) setClientes(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Error al consultar clientes');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredClientes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clientes;

    return clientes.filter((cliente) =>
      searchFields.some((field) =>
        String(cliente[field] || '')
          .toLowerCase()
          .includes(query)
      )
    );
  }, [clientes, search]);

  const metrics = useMemo(() => {
    const activeClientes = clientes.filter((cliente) => getActivoText(cliente.activo) === 'Si').length;
    const clientesConTelefono = clientes.filter(
      (cliente) => cliente.telefono !== null && cliente.telefono !== undefined && String(cliente.telefono).trim() !== ''
    ).length;

    return [
      { label: 'Total de clientes', value: clientes.length },
      { label: 'Clientes activos', value: activeClientes },
      { label: 'Clientes con telefono', value: clientesConTelefono },
      { label: 'Clientes visibles', value: filteredClientes.length },
    ];
  }, [clientes, filteredClientes.length]);

  const handleViewCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const detalle = await getClienteById(cliente.id_cliente);
      setSelectedCliente(detalle || cliente);
    } catch (err) {
      setSelectedCliente(cliente);
      setDetailError('No se pudo consultar el detalle completo. Se muestra la informacion disponible en la fila.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setDetailLoading(false);
    setDetailError(null);
  };

  if (loading) return <div style={pageStyle}><div style={messageStyle}>Cargando clientes...</div></div>;
  if (error) return <div style={pageStyle}><div style={messageStyle}>Error: {error}</div></div>;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>PostgreSQL</p>
          <h2 style={titleStyle}>Clientes</h2>
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
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, telefono, correo, estado o ciudad"
          style={inputStyle}
        />
      </div>

      {clientes.length === 0 ? (
        <div style={messageStyle}>No hay clientes registrados.</div>
      ) : filteredClientes.length === 0 ? (
        <div style={messageStyle}>No se encontraron clientes con ese criterio.</div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nombre completo</th>
                <th style={thStyle}>Telefono</th>
                <th style={thStyle}>Correo</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Ciudad</th>
                <th style={thStyle}>Activo</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => {
                const activoText = getActivoText(cliente.activo);

                return (
                  <tr key={cliente.id_cliente}>
                    <td style={tdStyle}>{getValue(cliente.id_cliente)}</td>
                    <td style={tdStyle}>{buildFullName(cliente)}</td>
                    <td style={tdStyle}>{getValue(cliente.telefono)}</td>
                    <td style={tdStyle}>{getValue(cliente.correo)}</td>
                    <td style={tdStyle}>{getValue(cliente.estado)}</td>
                    <td style={tdStyle}>{getValue(cliente.ciudad)}</td>
                    <td style={tdStyle}>
                      <span style={getActivoBadgeStyle(activoText)}>{activoText}</span>
                    </td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => handleViewCliente(cliente)} style={actionButtonStyle}>
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

      {selectedCliente && (
        <div style={overlayStyle}>
          <div style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={modalTitleStyle}>Detalle del cliente</h3>
                <p style={modalSubtitleStyle}>{buildFullName(selectedCliente)}</p>
              </div>
              <button type="button" onClick={handleCloseModal} style={closeButtonStyle}>
                Cerrar
              </button>
            </div>

            <div style={modalBodyStyle}>
              {detailLoading && <div style={modalMessageStyle}>Cargando detalle completo...</div>}
              {detailError && <div style={modalMessageStyle}>{detailError}</div>}

              <div style={detailGridStyle}>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>ID cliente</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.id_cliente)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Nombre completo</p>
                  <p style={detailValueStyle}>{buildFullName(selectedCliente)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Telefono</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.telefono)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Correo</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.correo)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Fecha de nacimiento</p>
                  <p style={detailValueStyle}>{formatDate(selectedCliente.fecha_nacimiento)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Estado</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.estado)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Ciudad</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.ciudad)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Direccion</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.direccion)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Notas generales</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.notas_generales)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Activo</p>
                  <p style={detailValueStyle}>
                    <span style={getActivoBadgeStyle(getActivoText(selectedCliente.activo))}>
                      {getActivoText(selectedCliente.activo)}
                    </span>
                  </p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Creado en</p>
                  <p style={detailValueStyle}>{formatDate(selectedCliente.creado_en)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Actualizado en</p>
                  <p style={detailValueStyle}>{formatDate(selectedCliente.actualizado_en)}</p>
                </div>
                <div style={detailItemStyle}>
                  <p style={detailLabelStyle}>Source ID</p>
                  <p style={detailValueStyle}>{getValue(selectedCliente.source_id)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesPostgresPage;

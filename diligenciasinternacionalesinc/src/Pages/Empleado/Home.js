import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaCreditCard,
  FaExclamationTriangle,
  FaFileAlt,
  FaFolderOpen,
  FaHandshake,
  FaRedo,
  FaRoute,
  FaUserClock,
} from 'react-icons/fa';
import { getSidebarRole } from '../../Components/Sidebar';
import { getDashboardResumen } from '../../services/dashboard.service';
import { getAuthUserIssue, getCurrentEmployeeId, getCurrentUser } from '../../utils/authUser';

const getDisplayName = (user) =>
  [
    user.nombre,
    user.apellidos,
  ].filter(Boolean).join(' ') ||
  user.name ||
  user.email ||
  user.correo ||
  'Equipo Diligencias';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatOrigin = (value) =>
  String(value || 'Movimiento')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const metricCatalog = [
  {
    key: 'mis_expedientes_activos',
    label: 'Mis expedientes activos',
    icon: <FaBriefcase />,
  },
  {
    key: 'pendientes_pago',
    label: 'Pendientes de pago',
    icon: <FaCreditCard />,
  },
  {
    key: 'perfiles_incompletos',
    label: 'Perfiles incompletos',
    icon: <FaFileAlt />,
  },
  {
    key: 'documentos_faltantes',
    label: 'Documentos faltantes',
    icon: <FaFolderOpen />,
  },
  {
    key: 'proximos_contactos_hoy',
    label: 'Contactos hoy',
    icon: <FaUserClock />,
  },
];

const getMetricsForRole = (role) => {
  if (role === 'AMA') {
    return [
      metricCatalog[0],
      { key: 'grupos_ama_activos', label: 'Grupos AMA activos', icon: <FaHandshake /> },
      metricCatalog[2],
      metricCatalog[3],
      metricCatalog[4],
    ];
  }

  if (role === 'FINANZAS') {
    return [
      metricCatalog[1],
      { key: 'pagos_por_validar', label: 'Pagos por validar', icon: <FaCheckCircle /> },
      metricCatalog[0],
      metricCatalog[4],
      metricCatalog[3],
    ];
  }

  return metricCatalog;
};

const ProgressBadge = ({ avance }) => {
  if (!avance) return <span className="home-op-progress-muted">Sin avance</span>;
  return (
    <div className="home-op-progress">
      <span>{avance.perfil_porcentaje || 0}% perfil</span>
      <div className="home-op-progress-bar" aria-hidden="true">
        <div style={{ width: `${Math.min(100, avance.perfil_porcentaje || 0)}%` }} />
      </div>
      <small>
        Docs {avance.documentos_obligatorios_subidos || 0}/{avance.documentos_obligatorios_total || 0}
      </small>
    </div>
  );
};

const EmptyState = ({ children }) => (
  <div className="home-op-empty">
    <FaFolderOpen />
    <span>{children}</span>
  </div>
);

const HomeEmpleado = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const role = getSidebarRole(user);
  const idEmpleado = getCurrentEmployeeId();
  const sessionIssue = getAuthUserIssue();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!idEmpleado) {
      setDashboard(null);
      setError(sessionIssue || 'Tu sesión no tiene empleado asociado.');
      setLoading(false);
      return;
    }
    try {
      const data = await getDashboardResumen({
        id_empleado: idEmpleado,
        rol: role,
        include_global: role === 'ADMIN',
        nombre: getDisplayName(user),
      });
      setDashboard(data);
    } catch (err) {
      setError('No se pudo cargar el dashboard operativo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [idEmpleado, role, sessionIssue, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = getMetricsForRole(role);
  const todayLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const goToExpediente = (idSolicitud) => {
    if (!idSolicitud) return;
    navigate(`/empleado/solicitudes-nuevo?id_solicitud=${idSolicitud}`);
  };

  const goToGruposAma = () => {
    navigate('/empleado/ama/grupos');
  };

  const renderRolePanel = () => {
    if (!dashboard) return null;

    if (role === 'FINANZAS') {
      return (
        <section className="home-op-panel home-op-panel--wide">
          <div className="home-op-panel-header">
            <div>
              <h2>Pagos por validar</h2>
              <p>Comprobantes registrados pendientes de revisión.</p>
            </div>
            <FaCreditCard />
          </div>
          {dashboard.pagos_por_validar?.length ? (
            <div className="home-op-list">
              {dashboard.pagos_por_validar.map((pago) => (
                <button key={pago.id_pago} className="home-op-list-row" onClick={() => goToExpediente(pago.id_solicitud)}>
                  <strong>Solicitud #{pago.id_solicitud}</strong>
                  <span>{pago.aplicante || 'Aplicante N/A'}</span>
                  <span>{pago.monto} {pago.moneda}</span>
                </button>
              ))}
            </div>
          ) : <EmptyState>No hay pagos por validar.</EmptyState>}
        </section>
      );
    }

    if (role === 'AMA') {
      return (
        <section className="home-op-panel home-op-panel--wide">
          <div className="home-op-panel-header">
            <div>
              <h2>Grupos AMA activos</h2>
              <p>Grupos disponibles para operación y seguimiento.</p>
            </div>
            <button className="home-op-icon-button" onClick={goToGruposAma} type="button">
              Ver grupos
            </button>
          </div>
          {dashboard.grupos_ama?.length ? (
            <div className="home-op-group-grid">
              {dashboard.grupos_ama.slice(0, 6).map((grupo) => (
                <button key={grupo.id_grupo_ama} className="home-op-group-card" onClick={goToGruposAma}>
                  <strong>{grupo.nombre_grupo}</strong>
                  <span>{grupo.tipo_tramite || 'Trámite AMA'}</span>
                  <small>{grupo.cantidad_solicitudes || 0} solicitudes</small>
                </button>
              ))}
            </div>
          ) : <EmptyState>No hay grupos AMA activos.</EmptyState>}
        </section>
      );
    }

    if (role === 'ADMIN') {
      return (
        <section className="home-op-panel home-op-panel--wide">
          <div className="home-op-panel-header">
            <div>
              <h2>Expedientes por área</h2>
              <p>Distribución operativa general.</p>
            </div>
            <FaRoute />
          </div>
          {dashboard.expedientes_por_area?.length ? (
            <div className="home-op-area-grid">
              {dashboard.expedientes_por_area.map((area) => (
                <div key={area.id_area} className="home-op-area-chip">
                  <span>{area.nombre}</span>
                  <strong>{area.total}</strong>
                </div>
              ))}
            </div>
          ) : <EmptyState>No hay expedientes por área.</EmptyState>}
        </section>
      );
    }

    return (
      <section className="home-op-panel home-op-panel--wide">
        <div className="home-op-panel-header">
          <div>
            <h2>Pendientes operativos</h2>
            <p>Perfiles, documentos y próximos contactos de tus expedientes.</p>
          </div>
          <FaExclamationTriangle />
        </div>
        {dashboard.alertas?.length ? (
          <div className="home-op-list">
            {dashboard.alertas.slice(0, 6).map((alerta, index) => (
              <button
                key={`${alerta.tipo}-${alerta.id_solicitud || index}`}
                className="home-op-list-row"
                onClick={() => goToExpediente(alerta.id_solicitud)}
              >
                <strong>{alerta.titulo}</strong>
                <span>{alerta.descripcion}</span>
              </button>
            ))}
          </div>
        ) : <EmptyState>No hay pendientes críticos.</EmptyState>}
      </section>
    );
  };

  return (
    <main className="home-op">
      <header className="home-op-hero">
        <div>
          <p className="home-op-kicker">Dashboard operativo</p>
          <h1>Hola, {dashboard?.usuario?.nombre || getDisplayName(user)}</h1>
          <span>{role} · {todayLabel}</span>
          {sessionIssue && (
            <small className="home-op-dev-note">
              {sessionIssue}
            </small>
          )}
        </div>
        <button className="home-op-refresh" type="button" onClick={loadDashboard} disabled={loading}>
          <FaRedo />
          Actualizar
        </button>
      </header>

      {loading && (
        <section className="home-op-state">
          <div className="home-op-spinner" />
          <p>Cargando operación del día...</p>
        </section>
      )}

      {!loading && error && (
        <section className="home-op-state home-op-state--error">
          <FaExclamationTriangle />
          <p>{error}</p>
          <button type="button" onClick={loadDashboard}>Reintentar</button>
        </section>
      )}

      {!loading && !error && dashboard && (
        <>
          <section className="home-op-metrics" aria-label="Métricas principales">
            {metrics.map((metric) => (
              <article key={metric.key} className="home-op-metric-card">
                <div className="home-op-metric-icon">{metric.icon}</div>
                <span>{metric.label}</span>
                <strong>{dashboard.metricas?.[metric.key] ?? 0}</strong>
              </article>
            ))}
          </section>

          <section className="home-op-layout">
            <section className="home-op-panel home-op-panel--large">
              <div className="home-op-panel-header">
                <div>
                  <h2>Mis expedientes activos</h2>
                  <p>Expedientes asignados para seguimiento inmediato.</p>
                </div>
                <FaBriefcase />
              </div>

              {dashboard.mis_expedientes?.length ? (
                <div className="home-op-expedientes">
                  {dashboard.mis_expedientes.map((solicitud) => (
                    <article key={solicitud.id_solicitud} className="home-op-expediente">
                      <div>
                        <strong>#{solicitud.id_solicitud}</strong>
                        <span>{solicitud.aplicante || 'Aplicante N/A'}</span>
                        <small>{solicitud.tipo_tramite || 'Trámite N/A'}</small>
                      </div>
                      <div>
                        <span className="home-op-status">{solicitud.estado_actual_nombre || solicitud.estado_actual_valor || 'Sin estado'}</span>
                        <small>{solicitud.area_actual_nombre || solicitud.area_actual_clave || 'Sin área'}</small>
                      </div>
                      <ProgressBadge avance={solicitud.avance} />
                      <button type="button" onClick={() => goToExpediente(solicitud.id_solicitud)}>
                        Ver expediente
                      </button>
                    </article>
                  ))}
                </div>
              ) : <EmptyState>No hay expedientes activos para mostrar.</EmptyState>}
            </section>

            <section className="home-op-panel">
              <div className="home-op-panel-header">
                <div>
                  <h2>Alertas importantes</h2>
                  <p>Elementos que requieren atención.</p>
                </div>
                <FaBell />
              </div>
              {dashboard.alertas?.length ? (
                <div className="home-op-alerts">
                  {dashboard.alertas.slice(0, 8).map((alerta, index) => (
                    <button
                      key={`${alerta.tipo}-${alerta.id_solicitud || index}`}
                      className={`home-op-alert home-op-alert--${alerta.severidad || 'media'}`}
                      type="button"
                      onClick={() => goToExpediente(alerta.id_solicitud)}
                    >
                      <strong>{alerta.titulo}</strong>
                      <span>{alerta.descripcion}</span>
                    </button>
                  ))}
                </div>
              ) : <EmptyState>Sin alertas importantes.</EmptyState>}
            </section>

            <section className="home-op-panel">
              <div className="home-op-panel-header">
                <div>
                  <h2>Próximos contactos</h2>
                  <p>Fechas programadas por expediente.</p>
                </div>
                <FaCalendarAlt />
              </div>
              {dashboard.proximos_contactos?.length ? (
                <div className="home-op-list">
                  {dashboard.proximos_contactos.map((contacto) => (
                    <button
                      key={`${contacto.id_solicitud}-${contacto.fecha_proximo_contacto}`}
                      className="home-op-list-row"
                      onClick={() => goToExpediente(contacto.id_solicitud)}
                    >
                      <strong>#{contacto.id_solicitud} · {contacto.aplicante || 'Aplicante N/A'}</strong>
                      <span>{contacto.tipo_tramite || 'Trámite N/A'}</span>
                      <small>{formatDate(contacto.fecha_proximo_contacto)}</small>
                    </button>
                  ))}
                </div>
              ) : <EmptyState>No hay próximos contactos registrados.</EmptyState>}
            </section>

            <section className="home-op-panel home-op-panel--wide">
              <div className="home-op-panel-header">
                <div>
                  <h2>Últimos movimientos</h2>
                  <p>Seguimientos recientes en expedientes.</p>
                </div>
                <FaRoute />
              </div>
              {dashboard.ultimos_movimientos?.length ? (
                <div className="home-op-movements">
                  {dashboard.ultimos_movimientos.map((movimiento) => (
                    <button
                      key={movimiento.id_seguimiento}
                      className="home-op-movement"
                      type="button"
                      onClick={() => goToExpediente(movimiento.id_solicitud)}
                    >
                      <time>{formatDateTime(movimiento.creado_en || movimiento.fecha_seguimiento)}</time>
                      <strong>#{movimiento.id_solicitud} · {movimiento.descripcion || 'Seguimiento'}</strong>
                      <span>
                        {formatOrigin(movimiento.origen)}
                        {movimiento.estado_nuevo_valor ? ` · ${movimiento.estado_nuevo_valor}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              ) : <EmptyState>No hay movimientos recientes.</EmptyState>}
            </section>

            {renderRolePanel()}
          </section>
        </>
      )}
    </main>
  );
};

export default HomeEmpleado;

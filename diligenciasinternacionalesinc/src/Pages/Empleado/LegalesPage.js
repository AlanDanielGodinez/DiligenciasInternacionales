import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaBalanceScale, FaChevronLeft, FaChevronRight, FaClock, FaDollarSign,
  FaEye, FaFileAlt, FaFilter, FaPauseCircle, FaSearch,
} from 'react-icons/fa';
import { getLegales } from '../../services/legales.service';
import { getCurrentEmployeeId } from '../../utils/authUser';
import { legalOriginLabel, legalPaymentLabel, legalResultLabel, legalServiceLabel, legalStateLabel } from '../../utils/legalLabels';
import '../../features/solicitudes/pages/SolicitudesNuevoPage.css';
import '../../Styles/LegalesHistorical.css';

const views = [['todos', 'Todos'], ['nuevos', 'Nuevos'], ['en_proceso', 'En proceso'], ['falta_cobro', 'Falta de cobro'], ['foia', 'FOIA'], ['foia_especial_ama', 'FOIA especial AMA'], ['negados_grupos', 'Negados grupos'], ['negados_individuales', 'Negados individuales'], ['terminados', 'Terminados']];
const formatDate = (value) => value ? new Date(value).toLocaleDateString('es-MX') : '—';
const tone = (value) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('termin') || normalized.includes('valid')) return 'success';
  if (normalized.includes('esper') || normalized.includes('pend') || normalized.includes('cobro')) return 'warning';
  if (normalized.includes('neg') || normalized.includes('venc')) return 'danger';
  if (normalized.includes('nuevo') || normalized.includes('proceso') || normalized.includes('registr')) return 'info';
  return 'neutral';
};

export default function LegalesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mine = new URLSearchParams(location.search).get('solo_mios') === '1';
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ metrics: {}, filters: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);
  const [filters, setFilters] = useState({ q: '', vista: 'todos', origen: '', estado: '', responsable: '', resultado: '', gestion: '', con_solicitud: '', desde: '', hasta: '', page: 1, limit: 25 });
  const set = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      getLegales({ ...filters, solo_mios: mine ? '1' : '', id_empleado: mine ? getCurrentEmployeeId() : '' })
        .then((response) => { setData(response.data || []); setMeta(response); })
        .catch((requestError) => setError(requestError.response?.data?.error?.message || requestError.message))
        .finally(() => setLoading(false));
    }, filters.q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [filters, mine]);

  const metrics = meta.metrics || {};
  const total = meta.pagination?.total ?? data.length;
  const totalPages = Math.max(1, meta.pagination?.total_pages || Math.ceil(total / filters.limit));
  const page = Math.min(filters.page, totalPages);
  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, index) => index + 1);
  const summaries = [
    { label: 'Casos activos', value: metrics.activos || 0, caption: 'Procesos legales activos', icon: FaBalanceScale, tone: 'navy', action: () => set('vista', 'todos') },
    { label: 'Nuevos', value: metrics.nuevos || 0, caption: 'Pendientes de primera gestión', icon: FaFileAlt, tone: 'blue', action: () => set('vista', 'nuevos') },
    { label: 'Falta de cobro', value: metrics.falta_cobro || 0, caption: 'Servicios pendientes de pago', icon: FaDollarSign, tone: 'mint', action: () => set('vista', 'falta_cobro') },
    { label: 'Seguimientos vencidos', value: metrics.vencidos || 0, caption: 'Requieren atención', icon: FaClock, tone: 'amber', action: () => set('gestion', 'vencida') },
  ];

  return <div className="solicitudes-nuevo-page">
    <main className="solicitudes-nuevo-content">
      <section className="solicitudes-nuevo-page-heading">
        <div><span className="legales-eyebrow">Legales</span><h1>{mine ? 'Mis casos' : 'Casos legales'}</h1><p>Administra procesos, seguimientos y expedientes legales.</p></div>
        <div className="solicitudes-nuevo-heading-actions"><button type="button" className="solicitudes-nuevo-export-button" onClick={() => navigate(mine ? '/empleado/legales' : '/empleado/legales?solo_mios=1')}>{mine ? 'Ver todos' : 'Mis casos'}</button></div>
      </section>

      <section className="solicitudes-nuevo-summary-grid">
        {summaries.map((summary) => { const Icon = summary.icon; return <article role="button" tabIndex="0" onClick={summary.action} onKeyDown={(event) => event.key === 'Enter' && summary.action()} className={`solicitudes-nuevo-summary-card solicitudes-nuevo-summary-${summary.tone}`} key={summary.label}><div className="solicitudes-nuevo-summary-icon"><Icon /></div><div><span>{summary.label}</span><strong>{summary.value}</strong><small>{summary.caption}</small></div></article>; })}
      </section>

      <section className="solicitudes-nuevo-applicants-card">
        <div className="solicitudes-nuevo-filter-row">
          <form className="solicitudes-nuevo-top-search" onSubmit={(event) => event.preventDefault()}><FaSearch /><input type="search" value={filters.q} onChange={(event) => set('q', event.target.value)} placeholder="Buscar por nombre, solicitud, cliente, teléfono o expediente..." aria-label="Buscar casos legales" /></form>
          <label><FaFilter /><select aria-label="Vista" value={filters.vista} onChange={(event) => set('vista', event.target.value)}>{views.map(([value, label]) => <option value={value} key={value}>Vista: {label}</option>)}</select></label>
          <label><FaFilter /><select aria-label="Origen" value={filters.origen} onChange={(event) => set('origen', event.target.value)}><option value="">Origen: Todos</option>{Object.entries(legalOriginLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label><FaPauseCircle /><select aria-label="Estado" value={filters.estado} onChange={(event) => set('estado', event.target.value)}><option value="">Estado: Todos</option>{Object.entries(legalStateLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <button type="button" className="legales-more-button" aria-expanded={more} onClick={() => setMore((current) => !current)}><FaFilter /> Más filtros</button>
          <span>Mostrando {data.length} de {total}</span>
        </div>

        {more && <div className="legales-more-filters">
          <label><span>Asesor Legal</span><select value={filters.responsable} onChange={(event) => set('responsable', event.target.value)}><option value="">Todos los asesores</option>{(meta.filters?.responsables || []).map((person) => <option key={person.id_empleado} value={person.id_empleado}>{person.nombre} {person.apellidos}</option>)}</select></label>
          <label><span>Resultado</span><select value={filters.resultado} onChange={(event) => set('resultado', event.target.value)}><option value="">Todos los resultados</option>{Object.entries(legalResultLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label><span>Próxima gestión</span><select value={filters.gestion} onChange={(event) => set('gestion', event.target.value)}><option value="">Cualquier gestión</option><option value="vencida">Vencida</option><option value="hoy">Hoy</option><option value="sin_programar">Sin programar</option></select></label>
          <label><span>Fecha de entrada desde</span><input type="date" value={filters.desde} onChange={(event) => set('desde', event.target.value)} /></label>
          <label><span>Fecha de entrada hasta</span><input type="date" value={filters.hasta} onChange={(event) => set('hasta', event.target.value)} /></label>
          <label><span>Pago</span><select value={filters.vista === 'falta_cobro' ? 'falta_cobro' : ''} onChange={(event) => set('vista', event.target.value || 'todos')}><option value="">Cualquier estado</option><option value="falta_cobro">Falta de cobro</option></select></label>
          <label><span>Con solicitud Legal relacionada</span><select value={filters.con_solicitud} onChange={(event) => set('con_solicitud', event.target.value)}><option value="">Todas</option><option value="1">Con solicitud</option><option value="0">Sin solicitud</option></select></label>
        </div>}

        {loading ? <div className="solicitudes-nuevo-empty">Cargando casos...</div> : error ? <div className="solicitudes-nuevo-empty solicitudes-nuevo-error">{error}</div> : !data.length ? <div className="solicitudes-nuevo-empty"><FaSearch /><strong>No se encontraron coincidencias con la búsqueda actual.</strong></div> : <div className="solicitudes-nuevo-table-wrap"><table className="solicitudes-nuevo-table legales-table"><thead><tr><th>Aplicante</th><th>Origen</th><th>Trámite / servicio</th><th>Asesor Legal</th><th>Estatus</th><th>Última / próxima gestión</th><th>Pago</th><th>Acciones</th></tr></thead><tbody>{data.map((item) => {
          const name = [item.cliente_nombre, item.apellido_paterno, item.apellido_materno].filter(Boolean).join(' ');
          const open = () => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${item.id_solicitud}`);
          const state = legalStateLabel[item.estado_proceso] || item.estado_proceso || 'Sin estado';
          const payment = legalPaymentLabel[item.estado_pago_legal] || 'No aplica';
          return <tr key={item.id_proceso} className="admin-clickable-row" onClick={open}><td><div className="solicitudes-nuevo-applicant-cell"><div className="solicitudes-nuevo-applicant-avatar">{name.charAt(0)}</div><div><strong>{name}</strong><span>Solicitud #{item.id_solicitud} · Cliente #{item.id_cliente}</span></div></div></td><td>{legalOriginLabel[item.origen] || item.origen}</td><td><span className="solicitudes-nuevo-visa-pill">{legalServiceLabel(item)}</span>{item.es_foia && <span className="solicitudes-nuevo-visa-pill legales-foia-pill">FOIA</span>}</td><td>{[item.responsable_nombre, item.responsable_apellidos].filter(Boolean).join(' ') || 'Sin asignar'}</td><td><span className={`solicitudes-nuevo-status solicitudes-nuevo-status-${tone(state)}`}><i />{state}</span></td><td><small>Última: {formatDate(item.fecha_ultimo_contacto)}</small><br />Próxima: {formatDate(item.fecha_proximo_contacto)}</td><td><span className={`solicitudes-nuevo-status solicitudes-nuevo-status-${tone(payment)}`}><i />{payment}</span></td><td><div className="solicitudes-nuevo-row-actions"><button type="button" className="admin-action-button" onClick={(event) => { event.stopPropagation(); open(); }} title="Ver expediente"><FaEye /></button></div></td></tr>;
        })}</tbody></table></div>}

        {!loading && !error && total > 0 && <div className="solicitudes-nuevo-pagination"><button type="button" disabled={page <= 1} onClick={() => set('page', page - 1)}><FaChevronLeft /> Anterior</button><div>{pageNumbers.map((number) => <button type="button" key={number} className={page === number ? 'solicitudes-nuevo-page-active' : ''} onClick={() => set('page', number)}>{number}</button>)}{totalPages > 4 && <span>...</span>}{totalPages > 3 && <button type="button" className={page === totalPages ? 'solicitudes-nuevo-page-active' : ''} onClick={() => set('page', totalPages)}>{totalPages}</button>}</div><button type="button" disabled={page >= totalPages} onClick={() => set('page', page + 1)}>Siguiente <FaChevronRight /></button></div>}
      </section>
    </main>
  </div>;
}

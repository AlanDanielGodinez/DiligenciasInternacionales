import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaEye,
  FaFileAlt,
  FaPlus,
  FaRedo,
  FaSearch,
  FaUsers,
} from 'react-icons/fa';
import {
  createSolicitudForCliente,
  getClientes,
  getSolicitudById,
  getTiposTramite,
  moverSolicitudArea,
  updateCliente,
} from '../../services/clientes.service';
import {
  ManagementActionButton,
  ManagementActions,
  ManagementBadge,
  ManagementHeader,
  ManagementPage,
  ManagementState,
  ManagementTableFrame,
  ManagementToolbar,
} from '../../Components/Management/ManagementUI';

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const getValue = (value) => (hasValue(value) ? value : 'N/A');
const todayInput = () => new Date().toISOString().slice(0, 10);

const formatDate = (value) => {
  if (!hasValue(value)) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-MX');
};

const buildName = (cliente = {}) =>
  [cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno]
    .filter(hasValue)
    .join(' ') || 'N/A';

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

const getApiMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;

const findTipoById = (tipos = [], idTipo) =>
  tipos.find((tipo) => String(tipo.id_tipo_tramite) === String(idTipo));

const isPasaporte = (tipo = {}) =>
  `${tipo.nombre_tramite || ''} ${tipo.clave || ''}`.toLowerCase().includes('pasaporte');

const emptySolicitudForm = {
  id_tipo_tramite: '',
  id_tipo_tramite_adicional: '',
  canal_contacto: '',
  observaciones: '',
};

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [tiposTramite, setTiposTramite] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [solicitudForm, setSolicitudForm] = useState(emptySolicitudForm);
  const [saving, setSaving] = useState(false);

  const selectedTipo = useMemo(
    () => findTipoById(tiposTramite, solicitudForm.id_tipo_tramite),
    [solicitudForm.id_tipo_tramite, tiposTramite]
  );
  const showTramiteAdicional = Boolean(selectedTipo && isPasaporte(selectedTipo));

  const loadClientes = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await getClientes({
        q: search.trim() || undefined,
        limit: 120,
        offset: 0,
      });
      setClientes(data);
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudieron cargar los aplicantes.'));
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const tipos = await getTiposTramite();
      setTiposTramite(tipos);
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudieron cargar los tipos de tramite.'));
    }
  };

  useEffect(() => {
    loadClientes();
    loadCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (cliente) => {
    setSelectedCliente(cliente);
    setEditForm({
      nombre: cliente.nombre || '',
      apellido_paterno: cliente.apellido_paterno || '',
      apellido_materno: cliente.apellido_materno || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      fecha_nacimiento: cliente.fecha_nacimiento ? String(cliente.fecha_nacimiento).slice(0, 10) : '',
      estado: cliente.estado || '',
      ciudad: cliente.ciudad || '',
      direccion: cliente.direccion || '',
      notas_generales: cliente.notas_generales || '',
      activo: cliente.activo === false ? 'false' : 'true',
    });
    setModal('edit');
  };

  const openSolicitud = (cliente) => {
    setSelectedCliente(cliente);
    setSolicitudForm(emptySolicitudForm);
    setModal('solicitud');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedCliente(null);
    setSaving(false);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!selectedCliente?.id_cliente) return;
    setSaving(true);
    setMessage('');
    try {
      await updateCliente(selectedCliente.id_cliente, cleanPayload({
        ...editForm,
        activo: editForm.activo === 'true',
      }));
      setMessage('Aplicante actualizado correctamente.');
      await loadClientes();
      closeModal();
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo actualizar el aplicante.'));
    } finally {
      setSaving(false);
    }
  };

  const buildSolicitudPayloads = () => {
    const base = {
      id_tipo_tramite: Number(solicitudForm.id_tipo_tramite),
      id_empleado_responsable: null,
      estado_actual: 102,
      fecha_inicio: todayInput(),
      origen_registro: 'aplicantes_ficha',
      canal_contacto: solicitudForm.canal_contacto,
      observaciones: solicitudForm.observaciones || 'Solicitud creada desde ficha de aplicante',
    };

    const payloads = [base];
    if (showTramiteAdicional && hasValue(solicitudForm.id_tipo_tramite_adicional)) {
      payloads.push({
        ...base,
        id_tipo_tramite: Number(solicitudForm.id_tipo_tramite_adicional),
        observaciones: `${base.observaciones} | Tramite adicional`,
      });
    }
    return payloads;
  };

  const saveSolicitud = async (event) => {
    event.preventDefault();
    if (!selectedCliente?.id_cliente) return;
    setSaving(true);
    setMessage('');
    try {
      const created = [];
      for (const payload of buildSolicitudPayloads()) {
        const solicitud = await createSolicitudForCliente(selectedCliente.id_cliente, cleanPayload(payload));
        if (!solicitud?.id_solicitud) throw new Error('El backend no devolvio id_solicitud.');

        await moverSolicitudArea(solicitud.id_solicitud, {
          area_destino: 'PAGOS',
          descripcion: 'Solicitud creada desde Aplicantes y enviada a Finanzas para pago inicial',
          id_empleado_responsable: null,
          origen: 'enviado_a_finanzas',
        });

        const detail = await getSolicitudById(solicitud.id_solicitud);
        created.push(detail || solicitud);
      }

      setMessage(`${created.length} solicitud(es) creada(s) para el aplicante.`);
      await loadClientes();
      closeModal();
      if (created[0]?.id_solicitud) {
        navigate(`/empleado/solicitudes-nuevo?id_solicitud=${created[0].id_solicitud}`);
      }
    } catch (error) {
      setMessage(getApiMessage(error, 'No se pudo crear la solicitud.'));
    } finally {
      setSaving(false);
    }
  };

  const renderEditModal = () => (
    <form className="admin-modal admin-modal--wide" onSubmit={saveEdit}>
      <div className="admin-modal-header">
        <div><span className="admin-modal-kicker">Aplicantes</span><h2 className="admin-modal-title">Editar aplicante</h2></div>
        <button className="admin-modal-close" type="button" onClick={closeModal} aria-label="Cerrar">&times;</button>
      </div>
      <div className="admin-modal-body aplicantes-form-grid">
        {[
          ['nombre', 'Nombre'],
          ['apellido_paterno', 'Apellido paterno'],
          ['apellido_materno', 'Apellido materno'],
          ['telefono', 'Telefono'],
          ['correo', 'Correo'],
          ['estado', 'Estado'],
          ['ciudad', 'Ciudad'],
          ['direccion', 'Direccion'],
        ].map(([field, label]) => (
          <label key={field}>{label}
            <input
              value={editForm[field] || ''}
              onChange={(event) => setEditForm((current) => ({ ...current, [field]: event.target.value }))}
              required={field === 'nombre'}
            />
          </label>
        ))}
        <label>Fecha nacimiento
          <input type="date" value={editForm.fecha_nacimiento || ''} onChange={(event) => setEditForm((current) => ({ ...current, fecha_nacimiento: event.target.value }))} />
        </label>
        <label>Activo
          <select value={editForm.activo || 'true'} onChange={(event) => setEditForm((current) => ({ ...current, activo: event.target.value }))}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </label>
        <label className="aplicantes-span-2">Notas generales
          <textarea value={editForm.notas_generales || ''} onChange={(event) => setEditForm((current) => ({ ...current, notas_generales: event.target.value }))} />
        </label>
      </div>
      <div className="admin-modal-footer"><button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button><button type="submit" className="admin-button admin-button-primary aplicantes-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button></div>
    </form>
  );

  const renderSolicitudModal = () => {
    const extraTipos = tiposTramite.filter((tipo) => String(tipo.id_tipo_tramite) !== String(solicitudForm.id_tipo_tramite));
    return (
      <form className="admin-modal" onSubmit={saveSolicitud}>
        <div className="admin-modal-header">
          <div>
            <span>{buildName(selectedCliente || {})}</span>
            <h2>Nuevo tramite</h2>
          </div>
          <button className="admin-modal-close" type="button" onClick={closeModal} aria-label="Cerrar">&times;</button>
        </div>
        <label>Tipo de tramite
          <select value={solicitudForm.id_tipo_tramite} onChange={(event) => setSolicitudForm((current) => ({ ...current, id_tipo_tramite: event.target.value, id_tipo_tramite_adicional: '' }))} required>
            <option value="">Seleccionar tramite</option>
            {tiposTramite.map((tipo) => (
              <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>{tipo.nombre_tramite}</option>
            ))}
          </select>
        </label>
        {showTramiteAdicional && (
          <label>Tramite adicional
            <select value={solicitudForm.id_tipo_tramite_adicional} onChange={(event) => setSolicitudForm((current) => ({ ...current, id_tipo_tramite_adicional: event.target.value }))}>
              <option value="">Sin tramite adicional</option>
              {extraTipos.map((tipo) => (
                <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>{tipo.nombre_tramite}</option>
              ))}
            </select>
          </label>
        )}
        <label>Canal de contacto
          <select value={solicitudForm.canal_contacto} onChange={(event) => setSolicitudForm((current) => ({ ...current, canal_contacto: event.target.value }))} required>
            <option value="">Seleccionar canal</option>
            <option value="Walle">Walle</option>
            <option value="Eva">Eva</option>
            <option value="Banny">Banny</option>
          </select>
        </label>
        <label>Observaciones
          <textarea value={solicitudForm.observaciones} onChange={(event) => setSolicitudForm((current) => ({ ...current, observaciones: event.target.value }))} />
        </label>
        <p className="aplicantes-hint">El nuevo tramite se enviara a Finanzas/Pagos para pago inicial.</p>
        <div className="admin-modal-footer"><button className="admin-button admin-button-secondary" type="button" onClick={closeModal}>Cancelar</button><button type="submit" className="admin-button admin-button-primary aplicantes-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear tramite'}</button></div>
      </form>
    );
  };

  return (
    <ManagementPage className="aplicantes-page">
      <ManagementHeader
        className="aplicantes-hero"
        eyebrow={<><FaUsers /> Aplicantes</>}
        title="Todos los aplicantes"
        description="Consulta aplicantes, abre su ficha central y agrega nuevos tramites sin duplicar clientes."
        actions={<button type="button" onClick={loadClientes}><FaRedo /> Actualizar</button>}
      />

      <ManagementToolbar as="section" className="aplicantes-search">
        <FaSearch />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') loadClientes(); }}
          placeholder="Buscar por nombre, telefono, correo o contacto"
        />
        <button type="button" onClick={loadClientes}>Buscar</button>
      </ManagementToolbar>

      {message && <div className="aplicantes-message">{message}</div>}

      <ManagementTableFrame className="aplicantes-table-wrap">
        {loading ? (
          <ManagementState className="aplicantes-empty" tone="loading">Cargando aplicantes...</ManagementState>
        ) : clientes.length === 0 ? (
          <ManagementState className="aplicantes-empty">No hay aplicantes para mostrar.</ManagementState>
        ) : (
          <table className="aplicantes-table">
            <thead>
              <tr>
                <th>Aplicante</th>
                <th>Contacto</th>
                <th>Ubicacion</th>
                <th>Solicitudes</th>
                <th>Ultimo movimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id_cliente} className="admin-clickable-row" onClick={() => navigate(`/empleado/clientes/${cliente.id_cliente}`)}>
                  <td><strong>{buildName(cliente)}</strong><small>Folio aplicante #{cliente.id_cliente}</small></td>
                  <td><strong>{getValue(cliente.contacto_nombre)}</strong><small>{getValue(cliente.contacto_telefono || cliente.contacto_correo)}</small></td>
                  <td>{getValue([cliente.ciudad, cliente.estado, cliente.pais_nombre].filter(hasValue).join(', '))}</td>
                  <td>{cliente.cantidad_solicitudes || 0}</td>
                  <td>{formatDate(cliente.ultimo_movimiento)}</td>
                  <td><ManagementBadge className={cliente.activo === false ? 'aplicantes-status is-off' : 'aplicantes-status'} tone={cliente.activo === false ? 'danger' : 'success'}>{cliente.activo === false ? 'Inactivo' : 'Activo'}</ManagementBadge></td>
                  <td>
                    <ManagementActions className="aplicantes-row-actions">
                      <ManagementActionButton className="admin-action-button" type="button" title="Ver ficha" onClick={(event) => { event.stopPropagation(); navigate(`/empleado/clientes/${cliente.id_cliente}`); }}><FaEye /></ManagementActionButton>
                      <ManagementActionButton className="admin-action-button" type="button" title="Editar" onClick={(event) => { event.stopPropagation(); openEdit(cliente); }}><FaEdit /></ManagementActionButton>
                      <ManagementActionButton className="admin-action-button" type="button" title="Nuevo tramite" onClick={(event) => { event.stopPropagation(); openSolicitud(cliente); }}><FaPlus /></ManagementActionButton>
                      <ManagementActionButton type="button" title="Abrir ultimo expediente" disabled={!cliente.cantidad_solicitudes} onClick={(event) => { event.stopPropagation(); navigate(`/empleado/clientes/${cliente.id_cliente}`); }}><FaFileAlt /></ManagementActionButton>
                    </ManagementActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ManagementTableFrame>

      {modal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          {modal === 'edit' && renderEditModal()}
          {modal === 'solicitud' && renderSolicitudModal()}
        </div>
      )}
    </ManagementPage>
  );
};

export default Clientes;

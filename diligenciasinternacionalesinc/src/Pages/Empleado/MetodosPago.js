import React, { useEffect, useMemo, useState } from 'react';
import { FaCreditCard, FaPlus, FaSearch } from 'react-icons/fa';
import {
  createMetodoPago,
  getMetodosPago,
  updateMetodoPago,
} from '../../services/metodosPago.service';

const emptyForm = {
  nombre_metodo: '',
  descripcion: '',
  activo: true,
};

const MetodosPago = () => {
  const [metodos, setMetodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const cargarMetodos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMetodosPago({ include_inactive: true });
      setMetodos(data);
    } catch (requestError) {
      setError('No fue posible cargar los métodos de pago.');
      setMetodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetodos();
  }, []);

  const metodosFiltrados = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return metodos;
    return metodos.filter((metodo) =>
      [
        metodo.nombre_metodo,
        metodo.descripcion,
        metodo.activo ? 'activo' : 'inactivo',
      ].join(' ').toLowerCase().includes(normalized)
    );
  }, [metodos, query]);

  const abrirNuevo = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setShowForm(true);
  };

  const abrirEdicion = (metodo) => {
    setEditing(metodo);
    setForm({
      nombre_metodo: metodo.nombre_metodo || '',
      descripcion: metodo.descripcion || '',
      activo: metodo.activo !== false,
    });
    setMessage('');
    setError('');
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const guardarMetodo = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editing?.id_metodo_pago) {
        await updateMetodoPago(editing.id_metodo_pago, form);
        setMessage('Método de pago actualizado.');
      } else {
        await createMetodoPago(form);
        setMessage('Método de pago creado.');
      }
      cerrarForm();
      await cargarMetodos();
    } catch (requestError) {
      setError(requestError?.response?.data?.error?.message || 'No fue posible guardar el método de pago.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (metodo) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateMetodoPago(metodo.id_metodo_pago, { activo: !metodo.activo });
      setMessage(metodo.activo ? 'Método desactivado.' : 'Método activado.');
      await cargarMetodos();
    } catch (requestError) {
      setError('No fue posible cambiar el estado del método de pago.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="config-min metodos-pago-page">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaCreditCard /> Finanzas</span>
          <h1>Métodos de pago</h1>
          <p>Catálogo operativo para registrar pagos sin depender de texto libre.</p>
        </div>
        <button type="button" onClick={abrirNuevo}>
          <FaPlus /> Nuevo método
        </button>
      </header>

      <section className="config-min__search">
        <FaSearch />
        <input
          type="search"
          placeholder="Buscar por nombre, descripción o estado"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      {message && <div className="config-min__message is-success">{message}</div>}
      {error && <div className="config-min__message">{error}</div>}

      {loading ? (
        <div className="config-min__empty">Cargando métodos de pago...</div>
      ) : metodosFiltrados.length === 0 ? (
        <div className="config-min__empty">No hay métodos de pago para mostrar.</div>
      ) : (
        <section className="config-min__table-wrap">
          <table className="config-min__table">
            <thead>
              <tr>
                <th>Método</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {metodosFiltrados.map((metodo) => (
                <tr key={metodo.id_metodo_pago}>
                  <td>
                    <strong>{metodo.nombre_metodo}</strong>
                    <small>#{metodo.id_metodo_pago}</small>
                  </td>
                  <td>{metodo.descripcion || 'N/A'}</td>
                  <td>
                    <span className={`config-min__badge ${metodo.activo ? '' : 'is-off'}`}>
                      {metodo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{metodo.actualizado_en ? new Date(metodo.actualizado_en).toLocaleDateString('es-MX') : 'N/A'}</td>
                  <td>
                    <div className="metodos-pago-actions">
                      <button type="button" onClick={() => abrirEdicion(metodo)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => toggleActivo(metodo)} disabled={saving}>
                        {metodo.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {showForm && (
        <div className="metodos-pago-modal-overlay" role="presentation">
          <form className="metodo-pago-modal" onSubmit={guardarMetodo}>
            <h2 className="metodo-pago-modal-title">
              {editing ? 'Editar método de pago' : 'Nuevo método de pago'}
            </h2>
            <label className="metodo-pago-modal-input-container">
              <span className="metodo-pago-modal-label">Nombre *</span>
              <input
                className="metodo-pago-modal-input"
                type="text"
                value={form.nombre_metodo}
                onChange={(event) => setForm((current) => ({ ...current, nombre_metodo: event.target.value }))}
                required
              />
            </label>
            <label className="metodo-pago-modal-input-container">
              <span className="metodo-pago-modal-label">Descripción</span>
              <textarea
                className="metodo-pago-modal-input"
                rows="3"
                value={form.descripcion}
                onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
              />
            </label>
            <label className="metodos-pago-check">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
              />
              Activo
            </label>
            <div className="metodo-pago-modal-buttons">
              <button type="button" className="metodo-pago-modal-cancel" onClick={cerrarForm}>
                Cancelar
              </button>
              <button type="submit" className="metodo-pago-modal-save" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default MetodosPago;

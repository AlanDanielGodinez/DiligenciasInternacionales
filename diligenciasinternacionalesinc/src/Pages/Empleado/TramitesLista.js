import React, { useEffect, useMemo, useState } from 'react';
import { FaClipboardList, FaRedo, FaSearch } from 'react-icons/fa';
import { getTiposTramite } from '../../services/configuracion.service';

const getValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '' ? value : 'N/A';

const Tramites = () => {
  const [tipos, setTipos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadTipos = async () => {
    setLoading(true);
    setMessage('');
    try {
      setTipos(await getTiposTramite());
    } catch (error) {
      setMessage(error?.response?.data?.error?.message || 'No se pudieron cargar los tipos de tramite.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTipos();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tipos;
    return tipos.filter((tipo) =>
      [tipo.nombre_tramite, tipo.nombre, tipo.clave, tipo.descripcion].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    );
  }, [tipos, search]);

  return (
    <main className="config-min">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaClipboardList /> Configuracion</span>
          <h1>Tipos de tramite</h1>
          <p>Catalogo real usado para crear solicitudes y resolver plantillas de perfil. La edicion queda pendiente para fase 2.</p>
        </div>
        <button type="button" onClick={loadTipos}><FaRedo /> Actualizar</button>
      </header>

      <section className="config-min__search">
        <FaSearch />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, clave o descripcion" />
      </section>

      {message && <div className="config-min__message">{message}</div>}

      <section className="config-min__table-wrap">
        {loading ? (
          <div className="config-min__empty">Cargando tipos de tramite...</div>
        ) : filtered.length === 0 ? (
          <div className="config-min__empty">No hay tipos de tramite para mostrar.</div>
        ) : (
          <table className="config-min__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Clave</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tipo) => (
                <tr key={tipo.id_tipo_tramite || tipo.id}>
                  <td>{getValue(tipo.id_tipo_tramite || tipo.id)}</td>
                  <td><strong>{getValue(tipo.nombre_tramite || tipo.nombre)}</strong></td>
                  <td>{getValue(tipo.clave)}</td>
                  <td>
                    <span className={tipo.activo === false ? 'config-min__badge is-off' : 'config-min__badge'}>
                      {tipo.activo === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default Tramites;

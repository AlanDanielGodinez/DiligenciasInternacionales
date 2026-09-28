import React, { useEffect, useMemo, useState } from 'react';
import { FaLayerGroup, FaRedo, FaSearch } from 'react-icons/fa';
import { getAreas } from '../../services/configuracion.service';

const getValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '' ? value : 'N/A';

const AreasPage = () => {
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadAreas = async () => {
    setLoading(true);
    setMessage('');
    try {
      setAreas(await getAreas());
    } catch (error) {
      setMessage(error?.response?.data?.error?.message || 'No se pudieron cargar las areas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return areas;
    return areas.filter((area) =>
      [area.clave, area.nombre, area.nombre_area].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    );
  }, [areas, search]);

  return (
    <main className="config-min">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaLayerGroup /> Configuracion</span>
          <h1>Areas operativas</h1>
          <p>Catalogo de areas reales usado por solicitudes y bandejas operativas. El CRUD queda pendiente para fase 2.</p>
        </div>
        <button type="button" onClick={loadAreas}><FaRedo /> Actualizar</button>
      </header>

      <section className="config-min__search">
        <FaSearch />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por clave o nombre" />
      </section>

      {message && <div className="config-min__message">{message}</div>}

      <section className="config-min__table-wrap">
        {loading ? (
          <div className="config-min__empty">Cargando areas...</div>
        ) : filtered.length === 0 ? (
          <div className="config-min__empty">No hay areas para mostrar.</div>
        ) : (
          <table className="config-min__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Clave</th>
                <th>Nombre</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((area) => (
                <tr key={area.id_area || area.idArea}>
                  <td>{getValue(area.id_area || area.idArea)}</td>
                  <td><strong>{getValue(area.clave)}</strong></td>
                  <td>{getValue(area.nombre || area.nombre_area)}</td>
                  <td>
                    <span className={area.activo === false ? 'config-min__badge is-off' : 'config-min__badge'}>
                      {area.activo === false ? 'Inactiva' : 'Activa'}
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

export default AreasPage;

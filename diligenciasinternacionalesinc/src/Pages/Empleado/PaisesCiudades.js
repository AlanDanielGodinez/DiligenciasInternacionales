import React, { useEffect, useMemo, useState } from 'react';
import { FaGlobeAmericas, FaRedo, FaSearch } from 'react-icons/fa';
import { getPaises } from '../../services/configuracion.service';

const getValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '' ? value : 'N/A';

const GestionPaisesCiudades = () => {
  const [paises, setPaises] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadPaises = async () => {
    setLoading(true);
    setMessage('');
    try {
      setPaises(await getPaises());
    } catch (error) {
      setMessage(error?.response?.data?.error?.message || 'No se pudieron cargar los paises.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaises();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return paises;
    return paises.filter((pais) =>
      [pais.nombre_pais, pais.nombre, pais.clave].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    );
  }, [paises, search]);

  return (
    <main className="config-min">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaGlobeAmericas /> Configuracion</span>
          <h1>Paises y ciudades</h1>
          <p>Consulta los países registrados. El listado de ciudades aún no está disponible.</p>
        </div>
        <button type="button" onClick={loadPaises}><FaRedo /> Actualizar</button>
      </header>

      <section className="config-min__search">
        <FaSearch />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pais" />
      </section>

      <div className="config-min__message">
        Por ahora solo se pueden consultar países; no se pueden crear, editar ni eliminar países o ciudades.
      </div>
      {message && <div className="config-min__message">{message}</div>}

      <section className="config-min__table-wrap">
        {loading ? (
          <div className="config-min__empty">Cargando paises...</div>
        ) : filtered.length === 0 ? (
          <div className="config-min__empty">No hay paises para mostrar.</div>
        ) : (
          <table className="config-min__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pais</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pais) => (
                <tr key={pais.id_pais || pais.idPais}>
                  <td>{getValue(pais.id_pais || pais.idPais)}</td>
                  <td><strong>{getValue(pais.nombre_pais || pais.nombre || pais.nombrePais)}</strong></td>
                  <td>
                    <span className={pais.activo === false ? 'config-min__badge is-off' : 'config-min__badge'}>
                      {pais.activo === false ? 'Inactivo' : 'Activo'}
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

export default GestionPaisesCiudades;

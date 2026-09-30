import React, { useEffect, useMemo, useState } from 'react';
import { FaRedo, FaSearch, FaUserTie } from 'react-icons/fa';
import { getEmpleados } from '../../services/configuracion.service';

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const getValue = (value) => (hasValue(value) ? value : 'N/A');

const buildName = (empleado = {}) =>
  [empleado.nombre, empleado.apellidos].filter(hasValue).join(' ') ||
  [empleado.nombreEmpleado, empleado.apellidoPaternoEmpleado, empleado.apellidoMaternoEmpleado]
    .filter(hasValue)
    .join(' ') ||
  'N/A';

const EmpleadosPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadEmpleados = async () => {
    setLoading(true);
    setMessage('');
    try {
      setEmpleados(await getEmpleados());
    } catch (error) {
      setMessage(error?.response?.data?.error?.message || 'No se pudieron cargar los empleados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpleados();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return empleados;
    return empleados.filter((empleado) =>
      [
        buildName(empleado),
        empleado.correo,
        empleado.correoEmpleado,
        empleado.area,
        empleado.rol,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [empleados, search]);

  return (
    <main className="config-min">
      <header className="config-min__header">
        <div>
          <span className="config-min__eyebrow"><FaUserTie /> Configuracion</span>
          <h1>Empleados</h1>
          <p>Consulta los empleados activos e inactivos. Por ahora no se pueden editar desde esta pantalla.</p>
        </div>
        <button type="button" onClick={loadEmpleados}><FaRedo /> Actualizar</button>
      </header>

      <section className="config-min__search">
        <FaSearch />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo, area o rol" />
      </section>

      {message && <div className="config-min__message">{message}</div>}

      <section className="config-min__table-wrap">
        {loading ? (
          <div className="config-min__empty">Cargando empleados...</div>
        ) : filtered.length === 0 ? (
          <div className="config-min__empty">No hay empleados para mostrar.</div>
        ) : (
          <table className="config-min__table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Correo</th>
                <th>Area</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((empleado) => (
                <tr key={empleado.id_empleado || empleado.idEmpleado || empleado.correo}>
                  <td><strong>{buildName(empleado)}</strong><small>#{getValue(empleado.id_empleado || empleado.idEmpleado)}</small></td>
                  <td>{getValue(empleado.correo || empleado.correoEmpleado)}</td>
                  <td>{getValue(empleado.area)}</td>
                  <td>{getValue(empleado.rol)}</td>
                  <td>
                    <span className={empleado.activo === false ? 'config-min__badge is-off' : 'config-min__badge'}>
                      {empleado.activo === false ? 'Inactivo' : 'Activo'}
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

export default EmpleadosPage;

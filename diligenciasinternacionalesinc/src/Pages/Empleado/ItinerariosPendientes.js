import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ItinerariosPendientes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [aerolineas, setAerolineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [form, setForm] = useState({
    fecha_salida: '',
    fecha_regreso: '',
    idAerolinea: '',
    numero_vuelo: '',
    hotel: '',
    direccion_hotel: '',
    contacto_hotel: ''
  });

  const [itinerariosRegistrados, setItinerariosRegistrados] = useState({});
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    fetchSolicitudes();
    fetchAerolineas();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/solicitudes/pendientes-itinerario', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSolicitudes(res.data);

      // buscar si ya tienen itinerario
      const itinerarios = {};
      for (const s of res.data) {
        try {
          const resIt = await axios.get(`http://localhost:5000/api/solicitudes/${s.idsolicitud}/itinerario`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resIt.data) itinerarios[s.idsolicitud] = resIt.data;
        } catch (err) {
          itinerarios[s.idsolicitud] = null;
        }
      }
      setItinerariosRegistrados(itinerarios);
    } catch (err) {
      console.error('Error al obtener solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAerolineas = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/aerolineas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAerolineas(res.data);
    } catch (err) {
      console.error('Error al obtener aerolíneas:', err);
    }
  };

  const abrirModal = (solicitud) => {
    const yaExiste = itinerariosRegistrados[solicitud.idsolicitud];
    if (yaExiste) {
      setForm({
        fecha_salida: yaExiste.fecha_salida.slice(0, 10),
        fecha_regreso: yaExiste.fecha_regreso.slice(0, 10),
        idAerolinea: yaExiste.idaerolinea || '',
        numero_vuelo: yaExiste.numero_vuelo || '',
        hotel: yaExiste.hotel || '',
        direccion_hotel: yaExiste.direccion_hotel || '',
        contacto_hotel: yaExiste.contacto_hotel || ''
      });
    } else {
      setForm({
        fecha_salida: '',
        fecha_regreso: '',
        idAerolinea: '',
        numero_vuelo: '',
        hotel: '',
        direccion_hotel: '',
        contacto_hotel: ''
      });
    }

    setSolicitudSeleccionada(solicitud);
    setModalVisible(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarItinerario = async () => {
    const token = localStorage.getItem('authToken');
    const idEmpleado = JSON.parse(localStorage.getItem('user'))?.id;

    if (!form.fecha_salida || !form.fecha_regreso || !idEmpleado) {
      return alert('Faltan campos obligatorios');
    }

    try {
      await axios.post(`http://localhost:5000/api/solicitudes/${solicitudSeleccionada.idsolicitud}/itinerario`,
        { ...form, idAerolinea: form.idAerolinea || null, idEmpleado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Itinerario guardado correctamente');
      setModalVisible(false);
      fetchSolicitudes();
    } catch (err) {
      console.error('Error al guardar itinerario:', err);
      alert('❌ Error al guardar itinerario');
    }
  };

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const texto = `${s.idsolicitud} ${s.nombrecliente} ${s.tipotramite} ${s.estado_actual}`.toLowerCase();
    const coincideBusqueda = texto.includes(search.toLowerCase());
    const coincideFiltro =
      filtro === 'todos' || s.estado_actual.toLowerCase() === filtro.toLowerCase();
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="metodos-pago-container">
      <h1 className="metodos-pago-title">Itinerarios Pendientes</h1>

      <div className="pp-filtros">
        <input
          type="text"
          placeholder="Buscar por ID, cliente, trámite..."
          className="pp-input-busqueda"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="pp-select-filtro"
        >
          <option value="todos">Todos</option>
          <option value="pendiente de itinerario">Pendiente de itinerario</option>
          <option value="itinerario establecido">Itinerario establecido</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : solicitudesFiltradas.length === 0 ? (
        <p>No hay resultados para mostrar</p>
      ) : (
        <table className="pp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Trámite</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudesFiltradas.map((s) => (
              <tr key={s.idsolicitud}>
                <td>{s.idsolicitud}</td>
                <td>{s.nombrecliente}</td>
                <td>{s.tipotramite}</td>
                <td>{s.estado_actual}</td>
                <td>{new Date(s.fecha_actualizacion).toLocaleDateString()}</td>
                <td>
                  <button
                    className="metodos-pago-add-button"
                    onClick={() => abrirModal(s)}
                  >
                    {itinerariosRegistrados[s.idsolicitud] ? 'Ver itinerario' : 'Agregar itinerario'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalVisible && (
        <div className="metodo-pago-modal-overlay">
          <div className="metodo-pago-modal">
            <h2 className="metodo-pago-modal-title">
              {itinerariosRegistrados[solicitudSeleccionada.idsolicitud] ? 'Ver / Editar Itinerario' : 'Agregar Itinerario'}
            </h2>

            <div className="metodo-pago-modal-input-container">
              <label>Fecha de salida</label>
              <input type="date" name="fecha_salida" value={form.fecha_salida} onChange={handleChange} className="metodo-pago-modal-input" />

              <label>Fecha de regreso</label>
              <input type="date" name="fecha_regreso" value={form.fecha_regreso} onChange={handleChange} className="metodo-pago-modal-input" />

              <label>Aerolínea</label>
              <select name="idAerolinea" value={form.idAerolinea} onChange={handleChange} className="metodo-pago-modal-input">
                <option value="">-- Seleccionar --</option>
                {aerolineas.map(a => (
                  <option key={a.idaerolinea} value={a.idaerolinea}>{a.nombreaerolinea}</option>
                ))}
              </select>

              <label>Número de vuelo</label>
              <input type="text" name="numero_vuelo" value={form.numero_vuelo} onChange={handleChange} className="metodo-pago-modal-input" />

              <label>Hotel</label>
              <input type="text" name="hotel" value={form.hotel} onChange={handleChange} className="metodo-pago-modal-input" />

              <label>Dirección del hotel</label>
              <input type="text" name="direccion_hotel" value={form.direccion_hotel} onChange={handleChange} className="metodo-pago-modal-input" />

              <label>Contacto del hotel</label>
              <input type="text" name="contacto_hotel" value={form.contacto_hotel} onChange={handleChange} className="metodo-pago-modal-input" />
            </div>

            <div className="metodo-pago-modal-buttons">
              <button onClick={() => setModalVisible(false)} className="metodo-pago-modal-cancel">Cancelar</button>
              <button onClick={guardarItinerario} className="metodo-pago-modal-save">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItinerariosPendientes;

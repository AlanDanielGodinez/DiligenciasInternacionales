import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Estados mapeados para coincidir con el backend
const estadosPorTramite = {
  'Grupo AMA Mexico': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de anticipo',
    'anticipo realizado',
    'pendiente de perfil',
    'falta informacion',
    'pendiente de pago',
    'pago validado',
    'llenado formulario',
    'cita programada',
    'confirmacion datos',
    'capacitacion realizada',
    'pendiente de itinerario',
    'itinerario establecido',
    'vuelo confirmado',
    'pendiente de entregar los documentos finales',
    'Vuelo y reencuentro',
    'finalizado'
  ],
  'Grupo AMA Guatemala': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de anticipo',
    'anticipo realizado',
    'pendiente de perfil',
    'falta informacion',
    'pendiente de pago',
    'pago validado',
    'llenado formulario',
    'cita programada',
    'confirmacion datos',
    'capacitacion realizada',
    'pendiente de itinerario',
    'itinerario establecido',
    'vuelo confirmado',
    'pendiente de entregar los documentos finales',
    'Vuelo y reencuentro',
    'finalizado'
  ],
  'Visa Americana': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de anticipo',
    'anticipo realizado',
    'pendiente de perfil',
    'falta informacion',
    'pendiente de pago',
    'pago validado',
    'llenado formulario',
    'pendiente pago visa',
    'cita programada',
    'confirmacion datos',
    'capacitacion realizada',
    'pendiente de entregar los documentos finales',
    'finalizado'
  ],
  'Visa Canadiense': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de anticipo',
    'anticipo realizado',
    'pendiente de perfil',
    'falta informacion',
    'pendiente de pago',
    'pago validado',
    'llenado aplicacion',
    'pendiente documentos',
    'espera carta biometricos',
    'cita programada',
    'entrega documentos',
    'espera resultado',
    'envio pasaporte',
    'entrega pasaporte',
    'finalizado'
  ],
  'Pasaporte Mexicano': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de pago',
    'anticipo realizado',
    'pendiente de perfil',
    'falta informacion',
    'pago validado',
    'cita agendada',
    'entrega pasaporte',
    'finalizado'
  ],
  'Pasaporte Guatemalteco': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de pago',
    'pago realizado',
    'pendiente de perfil',
    'falta informacion',
    'requisitos completos',
    'cita agendada',
    'entrega pasaporte',
    'finalizado'
  ],
  'Pasaporte EstadoUnidense': [
    'iniciado',
    'pendiente de documentos',
    'documentos entregados',
    'pendiente de anticipo',
    'anticipo realizado',
    'pendiente de perfil',
    'falta informacion',
    'ds pendiente',
    'ds realizada',
    'pendiente de pago',
    'pago validado',
    'pago derechos realizado',
    'cita agendada',
    'capacitacion agendada',
    'capacitacion realizada',
    'entrega pasaporte',
    'finalizado'
  ]
};

// Mapeo para mostrar nombres más descriptivos en la UI
const estadosDisplay = {
  'iniciado': 'Iniciado',
  'pendiente de documentos': 'En espera de documentos',
  'documentos entregados': 'Documentos entregados',
  'pendiente de anticipo': 'En espera de anticipo pago',
  'anticipo realizado': 'Anticipo realizado',
  'pendiente de perfil': 'Pendiente de perfil de aplicación',
  'falta informacion': 'Falta de información',
  'pendiente de pago': 'En espera de pago',
  'pago validado': 'Pago validado',
  // ... otros mapeos según necesidad
};

const AgregarSeguimientoModal = ({ isOpen, onClose, idSolicitud, tipoTramite, onSeguimientoAgregado }) => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('authToken');
      axios.get('http://localhost:5000/api/empleados', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setEmpleados(res.data))
        .catch(err => {
          console.error('Error al obtener empleados:', err);
          setError('No se pudieron cargar los empleados');
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!empleadoSeleccionado || !descripcion.trim() || !estado) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `http://localhost:5000/api/solicitudes/${idSolicitud}/seguimientos`,
        {
          idEmpleado: empleadoSeleccionado,
          descripcion,
          estado // Enviamos el valor interno (ej: "pendiente de pago")
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMensaje('Seguimiento agregado correctamente');
      onSeguimientoAgregado(res.data);
      onClose();
    } catch (err) {
      console.error('Error al agregar seguimiento:', err);
      setError(err.response?.data?.error || 'No se pudo agregar el seguimiento');
    }
  };

  if (!isOpen) return null;

  const opcionesEstado = estadosPorTramite[tipoTramite] || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Seguimiento</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Empleado Responsable:
            <select
              value={empleadoSeleccionado}
              onChange={e => setEmpleadoSeleccionado(e.target.value)}
              required
            >
              <option value="">-- Selecciona un empleado --</option>
              {empleados.map(emp => (
                <option key={emp.idEmpleado} value={emp.idEmpleado}>
                  {emp.nombreEmpleado} {emp.apellidoPaternoEmpleado} ({emp.nombreRol} - {emp.nombreArea})
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado:
            <select 
              value={estado} 
              onChange={e => setEstado(e.target.value)}
              required
            >
              <option value="">-- Selecciona un estado --</option>
              {opcionesEstado.map((est, idx) => (
                <option key={idx} value={est}>
                  {estadosDisplay[est] || est} {/* Muestra el nombre descriptivo */}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descripción del seguimiento:
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows="4"
              placeholder="Describe lo que se ha hecho o el cambio de estado"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Agregar Seguimiento</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarSeguimientoModal;
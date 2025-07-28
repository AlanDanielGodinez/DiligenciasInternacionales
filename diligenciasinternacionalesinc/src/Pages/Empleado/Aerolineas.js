import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const Aerolineas = () => {
  const [aerolineas, setAerolineas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newContacto, setNewContacto] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editContacto, setEditContacto] = useState('');

  useEffect(() => {
    fetchAerolineas();
  }, []);

  const fetchAerolineas = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/aerolineas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setAerolineas(res.data);
    } catch (err) {
      console.error('Error al cargar aerolíneas:', err);
      alert('Error al obtener aerolíneas');
    }
  };

  const filteredAerolineas = aerolineas.filter(a =>
    `${a.nombreaerolinea} ${a.contacto}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAerolinea = async () => {
    const nombre = newNombre.trim();
    if (!nombre) return alert('El nombre de la aerolínea es obligatorio');

    try {
      const res = await axios.post('http://localhost:5000/api/aerolineas', 
        { nombreAerolinea: nombre, contacto: newContacto.trim() }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setAerolineas([...aerolineas, res.data]);
      setNewNombre('');
      setNewContacto('');
      setShowModal(false);
    } catch (err) {
      console.error('Error al agregar aerolínea:', err);
      alert('No se pudo agregar la aerolínea');
    }
  };

  const startEditing = (id, nombre, contacto) => {
    setEditingId(id);
    setEditNombre(nombre);
    setEditContacto(contacto || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNombre('');
    setEditContacto('');
  };

  const saveEditing = async (id) => {
    const nombre = editNombre.trim();
    if (!nombre) return alert('El nombre no puede estar vacío');

    try {
      const res = await axios.put(`http://localhost:5000/api/aerolineas/${id}`,
        { nombreAerolinea: nombre, contacto: editContacto.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setAerolineas(aerolineas.map(a => a.idaerolinea === id ? res.data : a));
      cancelEditing();
    } catch (err) {
      console.error('Error al actualizar aerolínea:', err);
      alert('No se pudo actualizar la aerolínea');
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Deseas eliminar esta aerolínea?');
    if (!confirmar) return;
    try {
      await axios.delete(`http://localhost:5000/api/aerolineas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setAerolineas(aerolineas.filter(a => a.idaerolinea !== id));
    } catch (err) {
      console.error('Error al eliminar aerolínea:', err);
      alert('No se pudo eliminar la aerolínea');
    }
  };

  return (
    <div className="metodos-pago-container">
      <h1 className="metodos-pago-title">Aerolíneas</h1>

      <div className="metodos-pago-header">
        <div className="metodos-pago-search-container">
          <input
            type="text"
            placeholder="Buscar aerolínea o contacto..."
            className="metodos-pago-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="metodos-pago-search-icon" />
        </div>

        <button onClick={() => setShowModal(true)} className="metodos-pago-add-button">
          <FaPlus className="metodos-pago-add-icon" /> Agregar Aerolínea
        </button>
      </div>

      <div className="metodos-pago-grid">
        {filteredAerolineas.length > 0 ? (
          filteredAerolineas.map(a => (
            <div key={a.idaerolinea} className="metodo-pago-card">
              <div className="metodo-pago-card-header">
                {editingId === a.idaerolinea ? (
                  <div className="metodo-pago-edit-container">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      placeholder="Nombre"
                      className="metodo-pago-edit-input"
                    />
                    <input
                      type="text"
                      value={editContacto}
                      onChange={(e) => setEditContacto(e.target.value)}
                      placeholder="Contacto"
                      className="metodo-pago-edit-input"
                    />
                    <button onClick={() => saveEditing(a.idaerolinea)} className="metodo-pago-confirm-button">
                      <FaCheck />
                    </button>
                    <button onClick={cancelEditing} className="metodo-pago-cancel-button">
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="metodo-pago-name">{a.nombreaerolinea}</h3>
                      <p className="metodo-pago-contacto">{a.contacto || 'Sin contacto'}</p>
                    </div>
                    <button onClick={() => startEditing(a.idaerolinea, a.nombreaerolinea, a.contacto)} className="metodo-pago-edit-button">
                      <FaEdit />
                    </button>
                  </>
                )}
              </div>
              <div className="metodo-pago-actions">
                <button onClick={() => handleDelete(a.idaerolinea)} className="metodo-pago-delete-button">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="metodos-pago-empty">
            {searchTerm ? 'No se encontraron aerolíneas con ese término' : 'No hay aerolíneas registradas'}
          </div>
        )}
      </div>

      {showModal && (
        <div className="metodo-pago-modal-overlay">
          <div className="metodo-pago-modal">
            <h2 className="metodo-pago-modal-title">Agregar Aerolínea</h2>
            <div className="metodo-pago-modal-input-container">
              <label className="metodo-pago-modal-label">Nombre de la Aerolínea</label>
              <input
                type="text"
                className="metodo-pago-modal-input"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
              />
              <label className="metodo-pago-modal-label">Contacto</label>
              <input
                type="text"
                className="metodo-pago-modal-input"
                value={newContacto}
                onChange={(e) => setNewContacto(e.target.value)}
              />
            </div>
            <div className="metodo-pago-modal-buttons">
              <button onClick={() => setShowModal(false)} className="metodo-pago-modal-cancel">Cancelar</button>
              <button onClick={handleAddAerolinea} className="metodo-pago-modal-save">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aerolineas;

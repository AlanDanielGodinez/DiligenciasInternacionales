import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const MetodosPago = () => {
  const [metodos, setMetodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newMetodo, setNewMetodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Cargar métodos al iniciar
  useEffect(() => {
    fetchMetodos();
  }, []);

  const fetchMetodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/metodos-pago', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMetodos(response.data);
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      alert('Error al cargar los métodos de pago');
    }
  };

  const filteredMetodos = metodos.filter(metodo =>
    metodo.nombremetodo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMetodo = async () => {
    const nuevo = newMetodo.trim();
    if (!nuevo) return alert('El nombre no puede estar vacío');

    if (metodos.some(m => m.nombremetodo.toLowerCase() === nuevo.toLowerCase())) {
      return alert('Ese método ya existe');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/metodos-pago', 
        { nombreMetodo: nuevo },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setMetodos([...metodos, response.data]);
      setNewMetodo('');
      setShowModal(false);
    } catch (error) {
      console.error('Error al agregar método:', error);
      alert('Hubo un error al guardar el método');
    }
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEditing = async (id) => {
    const actualizado = editValue.trim();
    if (!actualizado) return alert('El nombre no puede estar vacío');

    if (metodos.some(m => m.idmetodopago !== id && m.nombremetodo.toLowerCase() === actualizado.toLowerCase())) {
      return alert('Ese método ya existe');
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/metodos-pago/${id}`, 
        { nombreMetodo: actualizado },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setMetodos(metodos.map(m => m.idmetodopago === id ? response.data : m));
      cancelEditing();
    } catch (error) {
      console.error('Error al actualizar método:', error);
      alert('No se pudo actualizar el método');
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este método de pago?');
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:5000/api/metodos-pago/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMetodos(metodos.filter(m => m.idmetodopago !== id));
    } catch (error) {
      console.error('Error al eliminar método:', error);
      alert('Error al eliminar el método');
    }
  };

  return (
    <div className="metodos-pago-container">
      <h1 className="metodos-pago-title">Métodos de Pago</h1>

      <div className="metodos-pago-header">
        <div className="metodos-pago-search-container">
          <input
            type="text"
            placeholder="Buscar métodos de pago..."
            className="metodos-pago-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="metodos-pago-search-icon" />
        </div>

        <button onClick={() => setShowModal(true)} className="metodos-pago-add-button">
          <FaPlus className="metodos-pago-add-icon" /> Agregar Método
        </button>
      </div>

      <div className="metodos-pago-grid">
        {filteredMetodos.length > 0 ? (
          filteredMetodos.map(metodo => (
            <div key={metodo.idmetodopago} className="metodo-pago-card">
              <div className="metodo-pago-card-header">
                {editingId === metodo.idmetodopago ? (
                  <div className="metodo-pago-edit-container">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEditing(metodo.idmetodopago)}
                      className="metodo-pago-edit-input"
                      autoFocus
                    />
                    <button onClick={() => saveEditing(metodo.idmetodopago)} className="metodo-pago-confirm-button">
                      <FaCheck />
                    </button>
                    <button onClick={cancelEditing} className="metodo-pago-cancel-button">
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="metodo-pago-name">{metodo.nombremetodo}</h3>
                    <button onClick={() => startEditing(metodo.idmetodopago, metodo.nombremetodo)} className="metodo-pago-edit-button">
                      <FaEdit />
                    </button>
                  </>
                )}
              </div>

              <div className="metodo-pago-actions">
                <button onClick={() => handleDelete(metodo.idmetodopago)} className="metodo-pago-delete-button">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="metodos-pago-empty">
            {searchTerm ? 'No se encontraron métodos con ese nombre' : 'No hay métodos de pago registrados'}
          </div>
        )}
      </div>

      {showModal && (
        <div className="metodo-pago-modal-overlay">
          <div className="metodo-pago-modal">
            <h2 className="metodo-pago-modal-title">Agregar Método de Pago</h2>
            <div className="metodo-pago-modal-input-container">
              <label className="metodo-pago-modal-label">Nombre del Método</label>
              <input
                type="text"
                className="metodo-pago-modal-input"
                value={newMetodo}
                onChange={(e) => setNewMetodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMetodo()}
                autoFocus
              />
            </div>
            <div className="metodo-pago-modal-buttons">
              <button onClick={() => setShowModal(false)} className="metodo-pago-modal-cancel">Cancelar</button>
              <button onClick={handleAddMetodo} className="metodo-pago-modal-save">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetodosPago;

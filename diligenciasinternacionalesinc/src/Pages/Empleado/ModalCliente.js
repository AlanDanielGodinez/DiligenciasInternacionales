import React from 'react';


const ModalCliente = ({ mostrar, cerrar, cliente, guardarCliente, manejarCambio }) => {
  if (!mostrar) return null;

  return (
    <div className="modal-cliente-overlay">
      <div className="modal-cliente">
        <h2>{cliente?.idCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>

        <form onSubmit={guardarCliente}>
          <div className="grupo-formulario">
            <label>Nombre:</label>
            <input type="text" name="nombreCliente" value={cliente.nombreCliente || ''} onChange={manejarCambio} required />
          </div>

          <div className="grupo-formulario">
            <label>Apellido Paterno:</label>
            <input type="text" name="apellidoPaternoCliente" value={cliente.apellidoPaternoCliente || ''} onChange={manejarCambio} required />
          </div>

          <div className="grupo-formulario">
            <label>Apellido Materno:</label>
            <input type="text" name="apellidoMaternoCliente" value={cliente.apellidoMaternoCliente || ''} onChange={manejarCambio} />
          </div>

          <div className="grupo-formulario">
            <label>Teléfono:</label>
            <input type="text" name="telefono" value={cliente.telefono || ''} onChange={manejarCambio} />
          </div>

          <div className="grupo-formulario">
            <label>Identificación Única Nacional:</label>
            <input type="text" name="identificacionunicanacional" value={cliente.identificacionunicanacional || ''} onChange={manejarCambio} />
          </div>

          <div className="acciones-modal">
            <button type="submit" className="btn-guardar">Guardar</button>
            <button type="button" className="btn-cancelar" onClick={cerrar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCliente;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/GrupoDetalle.css";

const GrupoDetalle = () => {
  const { idGrupo } = useParams();
  const [clientes, setClientes] = useState([]);
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [tramiteDetalle, setTramiteDetalle] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/grupos/${idGrupo}/clientes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(() => setClientes([]));
  }, [idGrupo]);

  const obtenerTramiteCliente = async (idTramite, idCliente) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tramites/${idTramite}/cliente/${idCliente}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await res.json();
      setTramiteDetalle(data);
    } catch {
      setTramiteDetalle(null);
    }
  };

  return (
    <div className="grupo-detalle-container">
      <h2>Clientes del Grupo {idGrupo}</h2>
      <div className="grupo-detalle-table-container">
        <table className="grupo-detalle-table">
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>No hay clientes en este grupo.</td>
              </tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.idcliente}>
                  <td>{cliente.identificacionunicanacional}</td>
                  <td>{cliente.nombrecliente}</td>
                  <td>{cliente.apellidopaternocliente}</td>
                  <td>{cliente.apellidomaternocliente}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <button
                      className="btn-ver"
                      title="Ver detalles"
                      onClick={() => {
                        setClienteDetalle(cliente);
                        obtenerTramiteCliente(idGrupo, cliente.idcliente);
                      }}
                    >
                      <span role="img" aria-label="ver">👁️</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {clienteDetalle && (
        <div className="modal-cliente">
          <div className="modal-content">
            <h3 style={{ color: "#2563eb" }}>Detalles del Cliente</h3>
            <ul>
              <li><b>Identificación:</b> {clienteDetalle.identificacionunicanacional || "No disponible"}</li>
              <li><b>Nombre:</b> {clienteDetalle.nombrecliente || "No disponible"}</li>
              <li><b>Apellido Paterno:</b> {clienteDetalle.apellidopaternocliente || "No disponible"}</li>
              <li><b>Apellido Materno:</b> {clienteDetalle.apellidomaternocliente || "No disponible"}</li>
              <li><b>Teléfono:</b> {clienteDetalle.telefono || "No disponible"}</li>
            </ul>
            <hr style={{margin: "18px 0"}} />
            <h4>Trámite</h4>
            {tramiteDetalle ? (
              <ul>
                <li><b>Tipo:</b> {tramiteDetalle.tipotramite || "No disponible"}</li>
                <li><b>Descripción:</b> {tramiteDetalle.descripcion || "No disponible"}</li>
                <li><b>Fecha de inicio:</b> {tramiteDetalle.fecha_inicio || "No disponible"}</li>
                <li><b>Estado:</b> {tramiteDetalle.estado || "No disponible"}</li>
              </ul>
            ) : (
              <p>Cargando información del trámite...</p>
            )}
            <hr style={{margin: "18px 0"}} />
            <h4>Solicitud</h4>
            {tramiteDetalle ? (
              <ul>
                <li><b>ID Solicitud:</b> {tramiteDetalle.idsolicitud || "No disponible"}</li>
                <li><b>Fecha de Solicitud:</b> {tramiteDetalle.fechasolicitud || "No disponible"}</li>
                <li><b>Motivo:</b> {tramiteDetalle.motivo || "No disponible"}</li>
                <li><b>Estado:</b> {tramiteDetalle.estadosolicitud || "No disponible"}</li>
                <li><b>Observaciones:</b> {tramiteDetalle.observaciones || "No disponible"}</li>
              </ul>
            ) : (
              <p>Cargando información de la solicitud...</p>
            )}
            <button className="btn-cerrar" onClick={() => { setClienteDetalle(null); setTramiteDetalle(null); }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoDetalle;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const HomeEmpleado = () => {
  const [gruposAMAData, setGruposAMAData] = useState([]);
  const [tramitesActivosData, setTramitesActivosData] = useState([]);
  const [clientesPaisData, setClientesPaisData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return console.error("Token no encontrado.");

    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [gruposRes, tramitesRes, paisesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/grupos-ama-activos', { headers }),
        axios.get('http://localhost:5000/api/dashboard/tramites-activos', { headers }),
        axios.get('http://localhost:5000/api/dashboard/clientes-por-pais', { headers })
      ]);

      setGruposAMAData(gruposRes.data);
      setTramitesActivosData(tramitesRes.data);
      setClientesPaisData(paisesRes.data);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#F24C4C'];

  return (
    <div className="dashboard-empleado-grid">
      {/* Sección 1: Grupos AMA */}
      <div className="dashboard-empleado-grupos">
        <h2>Grupos AMA activos</h2>
        <div className="dashboard-empleado-cards">
          {gruposAMAData.length === 0 ? (
            <p>No hay grupos activos.</p>
          ) : (
            gruposAMAData.map((grupo) => (
              <div
                className="dashboard-empleado-card"
                key={grupo.idtramite}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/grupos/${grupo.idtramite}`)}
              >
                <h4>{grupo.tipotramite}</h4>
                <p>Inicio: {new Date(grupo.fecha_inicio).toLocaleDateString()}</p>
                <p>Clientes: {grupo.totalclientes}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección 2: Trámites activos */}
      <div className="dashboard-empleado-tramites">
        <h2>Trámites activos</h2>
        {tramitesActivosData.length === 0 ? (
          <p>No hay datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tramitesActivosData}>
              <XAxis dataKey="tipotramite" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2c3e50" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sección 3: Clientes por país */}
      <div className="dashboard-empleado-paises">
        <h2>Clientes por país</h2>
        {clientesPaisData.length === 0 ? (
          <p>No hay datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={clientesPaisData}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="nombrepais" type="category" />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HomeEmpleado;
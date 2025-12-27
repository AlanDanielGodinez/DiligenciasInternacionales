import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt, FaUserTie, FaIdCard, FaPhone } from 'react-icons/fa';
import axios from 'axios';
// NUEVO: Import para API MongoDB
import API_ENDPOINTS from '../config/api';

const Login = () => {
  const [userType, setUserType] = useState('empleado'); // 'empleado' o 'cliente'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    identificacionunicanacional: '',
    telefono: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Verificar token al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      // COMENTADO - PostgreSQL API:
      // axios.get('http://localhost:5000/api/protected', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // })
      
      // NUEVO - MongoDB API:
      axios.get(API_ENDPOINTS.VERIFY, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(() => {
        const userData = JSON.parse(user);
        // Compatibilidad con ambos formatos (PostgreSQL y MongoDB)
        if (userData.rol === 'Administrador' || userData.role === 'admin') {
          navigate('/home');
        } else if (userData.rol === 'cliente' || userData.role === 'user') {
          navigate('/cliente/inicio');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let response;
      if (userType === 'empleado') {
        // COMENTADO - PostgreSQL API:
        // response = await axios.post('http://localhost:5000/api/login', {
        //   email: formData.email,
        //   password: formData.password
        // });

        // NUEVO - MongoDB API:
        response = await axios.post(API_ENDPOINTS.LOGIN, {
          email: formData.email,
          password: formData.password
        });

        // COMENTADO - PostgreSQL lógica:
        // if (response.data.tempPassword) {
        //   return navigate('/change-password', {
        //     state: { email: formData.email, requiresPasswordChange: true }
        //   });
        // }

        // NUEVO - MongoDB manejo de respuesta:
        if (response.data.token && response.data.user) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Verificar rol para navegación
          if (response.data.user.role === 'admin') {
            navigate('/home');
          } else {
            navigate('/dashboard');
          }
        }

        // COMENTADO - PostgreSQL storage:
        // localStorage.setItem('authToken', response.data.token);
        // localStorage.setItem('user', JSON.stringify(response.data.user));
        // navigate('/home');

      } else {
        // COMENTADO - PostgreSQL cliente login:
        // response = await axios.post('http://localhost:5000/api/clientes/login', {
        //   identificacionunicanacional: formData.identificacionunicanacional,
        //   telefono: formData.telefono
        // });

        // NUEVO - MongoDB cliente login (pendiente de implementar):
        response = await axios.post(API_ENDPOINTS.CLIENTE_LOGIN, {
          identificacionunicanacional: formData.identificacionunicanacional,
          telefono: formData.telefono
        });

        // COMENTADO - PostgreSQL cliente storage:
        // const token = response.data.token;
        // const userData = {
        //   rol: 'cliente',
        //   nombre: 'Cliente',
        // };
        // localStorage.setItem('authToken', token);
        // localStorage.setItem('userCliente', JSON.stringify(response.data.userCliente));

        // NUEVO - MongoDB cliente storage:
        if (response.data.token && response.data.user) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userCliente', JSON.stringify(response.data.user));
          navigate('/cliente/inicio');
        }
      }

    } catch (err) {
      // COMENTADO - PostgreSQL error handling:
      // setError(err.response?.data?.error || 'Error al iniciar sesión');
      
      // NUEVO - MongoDB error handling:
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Iniciar Sesión</h2>

          <div className="user-type-toggle">
            <button
              type="button"
              className={userType === 'empleado' ? 'active' : ''}
              onClick={() => setUserType('empleado')}
            >
              <FaUserTie /> Empleado
            </button>
            <button
              type="button"
              className={userType === 'cliente' ? 'active' : ''}
              onClick={() => setUserType('cliente')}
            >
              <FaIdCard /> Cliente
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {userType === 'empleado' ? (
            <>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <FaIdCard className="input-icon" />
                <input
                  type="text"
                  name="identificacionunicanacional"
                  placeholder="Identificación Única Nacional"
                  value={formData.identificacionunicanacional}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" disabled={isSubmitting} className="auth-button">
            {isSubmitting ? 'Ingresando...' : <><FaSignInAlt /> Ingresar</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

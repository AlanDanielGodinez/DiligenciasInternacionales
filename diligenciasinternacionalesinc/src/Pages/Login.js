import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt, FaUserTie, FaIdCard, FaPhone } from 'react-icons/fa';
import axios from 'axios';

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
      axios.get('http://localhost:5000/api/protected', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(() => {
        const userData = JSON.parse(user);
        if (userData.rol === 'Administrador') {
          navigate('/home');
        } else if (userData.rol === 'cliente') {
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
    
    // if (userType === 'empleado') {
    //   localStorage.setItem('authToken', 'dummy-token-empleado');
    //   localStorage.setItem('user', JSON.stringify({ rol: 'Administrador' }));
    //   navigate('/home');
    // } else {
    //   localStorage.setItem('authToken', 'fake-token-cliente');
    //   localStorage.setItem('userCliente', JSON.stringify({ rol: 'cliente', nombre: 'Cliente' }));
    //   navigate('/cliente/inicio');
    // }   setIsSubmitting(false); 
  

    try {
      let response;
      if (userType === 'empleado') {
        response = await axios.post('http://localhost:5000/api/login', {
          email: formData.email,
          password: formData.password
        });

        if (response.data.tempPassword) {
          return navigate('/change-password', {
            state: { email: formData.email, requiresPasswordChange: true }
          });
        }

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/home');

      } else {
        response = await axios.post('http://localhost:5000/api/clientes/login', {
          identificacionunicanacional: formData.identificacionunicanacional,
          telefono: formData.telefono
        });

        const token = response.data.token;
        const userData = {
          rol: 'cliente',
          nombre: 'Cliente',
        };

       localStorage.setItem('authToken', token);
      localStorage.setItem('userCliente', JSON.stringify(response.data.userCliente)); // o el nombre real que venga

        navigate('/cliente/inicio');
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
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

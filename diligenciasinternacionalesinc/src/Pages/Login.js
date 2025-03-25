import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

const Login = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si hay un token al cargar (para redirección automática)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  // Sincronizar con la ruta actual
  useEffect(() => {
    const path = location.pathname;
    setIsLogin(path === '/login');
  }, [location]);

  const toggleAuthMode = () => {
    const newPath = isLogin ? '/login/register' : '/login';
    navigate(newPath);
    setIsLogin(!isLogin);
    setError('');
  };

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

    if (isLogin) {
      try {
        // Enviar credenciales al backend
        const response = await axios.post('http://localhost:5000/api/login', {
          email: formData.email,
          password: formData.password
        });

        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirigir según el rol
        if (response.data.user.nombrerol === 'Administrador') {
          navigate('/home');
        } else {
          navigate('/dashboard');
        }

      } catch (err) {
        console.error('Error en login:', err);
        setError(err.response?.data?.error || 'Error al iniciar sesión');
        
        // Verificar si es el admin y mostrar mensaje específico
        if (formData.email === 'admin@example.com') {
          setError('Error en credenciales de administrador. Contacte al soporte.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Lógica de registro (opcional)
      setTimeout(() => {
        setIsSubmitting(false);
        alert('Registro completado');
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <div className={`auth-container ${isLogin ? 'light-theme' : 'dark-theme'}`}>
      <div className={`auth-card ${isLogin ? '' : 'register-mode'}`}>
        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="form-title">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {!isLogin && (
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <FaEnvelope className="input-icon" />
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
          
          <button type="submit" disabled={isSubmitting} className="auth-button">
            {isSubmitting ? (
              'Procesando...'
            ) : (
              <>
                {isLogin ? (
                  <>
                    <FaSignInAlt /> Iniciar Sesión
                  </>
                ) : (
                  <>
                    <FaUserPlus /> Registrarse
                  </>
                )}
              </>
            )}
          </button>
          
          <div className="auth-footer">
            <button type="button" onClick={toggleAuthMode} className="toggle-auth">
              {isLogin ? (
                '¿No tienes cuenta? Regístrate aquí'
              ) : (
                '¿Ya tienes cuenta? Inicia sesión aquí'
              )}
            </button>
          </div>
        </form>
        
        {/* Panel de bienvenida */}
        <div className="welcome-panel">
          <h2 className="welcome-title">
            {isLogin ? (
              '¡Bienvenido de nuevo!'
            ) : (
              '¡Únete a nosotros!'
            )}
          </h2>
          <p className="welcome-message">
            {isLogin ? (
              'Inicia sesión para acceder a tu cuenta y gestionar tus trámites.'
            ) : (
              'Regístrate para comenzar a utilizar nuestros servicios.'
            )}
          </p>
          <div className="welcome-icon">
            {isLogin ? (
              <FaSignInAlt size={80} />
            ) : (
              <FaUserPlus size={80} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
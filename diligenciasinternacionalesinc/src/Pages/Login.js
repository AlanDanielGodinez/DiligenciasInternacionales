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

  // Verificar token al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Verificar token con el backend
      axios.get('http://localhost:5000/api/protected', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(() => {
        const userData = JSON.parse(user);
        // Redirigir según el rol
        if (userData.rol === 'Administrador') {
          navigate('/home');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        console.error('Token verification failed:', error);
        // Limpiar datos inválidos
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      });
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
        console.log('Intentando login con:', { email: formData.email }); // Log de depuración
        
        const response = await axios.post('http://localhost:5000/api/login', {
          email: formData.email,
          password: formData.password
        });
  
        console.log('Respuesta del servidor:', response.data); // Log completo de la respuesta
        
        // Verificación detallada de los datos recibidos
        if (!response.data.token || !response.data.user) {
          console.error('Error: Respuesta del servidor incompleta');
          throw new Error('Datos de autenticación incompletos');
        }
  
        console.log('Login exitoso. Datos del usuario:', {
          id: response.data.user.id,
          nombre: response.data.user.nombre,
          email: response.data.user.email,
          rol: response.data.user.rol
        });
  
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
  
        // Verifica qué se guardó en localStorage
        console.log('Datos guardados en localStorage:', {
          token: localStorage.getItem('authToken'),
          user: localStorage.getItem('user')
        });
  
        // Redirigir según el rol
        if (response.data.user.rol === 'Administrador') {
          console.log('Redirigiendo a /home (Administrador)');
          navigate('/home');
        } else {
          console.log('Redirigiendo a /home (Empleado)');
          navigate('/home'); // Todos van a /home ahora
        }
  
      } catch (err) {
        console.error('Error en login:', {
          error: err,
          response: err.response,
          message: err.message
        });
        
        setError(err.response?.data?.error || 'Credenciales inválidas. Intente nuevamente.');
        setFormData(prev => ({ ...prev, password: '' }));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Lógica de registro (opcional)
      try {
        // Aquí iría la llamada al endpoint de registro
        // await axios.post('http://localhost:5000/api/register', formData);
        
        // Simulación de registro exitoso
        setTimeout(() => {
          setIsSubmitting(false);
          setError('');
          alert('Registro completado. Por favor inicie sesión.');
          navigate('/login');
        }, 1500);
      } catch (err) {
        console.error('Error en registro:', err);
        setError(err.response?.data?.error || 'Error en el registro');
        setIsSubmitting(false);
      }
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
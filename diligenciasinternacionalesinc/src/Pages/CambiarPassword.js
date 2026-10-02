import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { AUTH_TOKEN_KEY } from '../utils/authSession';
import { hasUsableSession } from '../utils/apiAuth';
import { getCurrentUser, saveCurrentUser } from '../utils/authUser';
import '../Styles/Login.css';

const MIN_LENGTH = 10;

const CambiarPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ actual: '', nueva: '', confirmacion: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const user = getCurrentUser();

  if (!hasUsableSession()) return <Navigate to="/login" replace />;

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.nueva.length < MIN_LENGTH) { setError(`La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`); return; }
    if (form.nueva !== form.confirmacion) { setError('La confirmación no coincide.'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/auth/cambiar-password', { password_actual: form.actual, password_nueva: form.nueva });
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      saveCurrentUser(data.user);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Cambiar contraseña</h2>
          {user.debe_cambiar_password && (
            <p>Por seguridad debe reemplazar su contraseña temporal antes de continuar.</p>
          )}
          {error && <div className="error-message" role="alert">{error}</div>}
          <div className="input-group">
            <input type="password" name="actual" placeholder="Contraseña actual" autoComplete="current-password"
              value={form.actual} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="password" name="nueva" placeholder={`Nueva contraseña (mín. ${MIN_LENGTH}, letras y números)`}
              autoComplete="new-password" value={form.nueva} onChange={handleChange} required minLength={MIN_LENGTH} />
          </div>
          <div className="input-group">
            <input type="password" name="confirmacion" placeholder="Confirmar nueva contraseña" autoComplete="new-password"
              value={form.confirmacion} onChange={handleChange} required minLength={MIN_LENGTH} />
          </div>
          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CambiarPassword;

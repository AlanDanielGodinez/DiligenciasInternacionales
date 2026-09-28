const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const normalizeAuthUser = (rawUser = {}) => {
  const empleado = rawUser.empleado || {};
  const idEmpleado = rawUser.id_empleado || rawUser.idEmpleado || empleado.id_empleado || empleado.idEmpleado || null;
  const idArea = rawUser.id_area || rawUser.idArea || empleado.id_area || empleado.idArea || null;
  const rol = rawUser.rol || rawUser.role || rawUser.nombreRol || rawUser.rol_nombre || empleado.rol || empleado.role || '';
  const area = rawUser.area || rawUser.area_actual || empleado.area || empleado.area_actual || '';
  const roles = Array.isArray(rawUser.roles)
    ? rawUser.roles.map((role) => role?.nombreRol || role?.nombre || role?.rol || role).filter(Boolean)
    : [rol].filter(Boolean);

  return {
    ...rawUser,
    id_usuario: rawUser.id_usuario || rawUser.id || rawUser._id || idEmpleado || null,
    id_empleado: idEmpleado ? Number(idEmpleado) : null,
    nombre: rawUser.nombre || rawUser.name || empleado.nombre || '',
    apellidos: rawUser.apellidos || empleado.apellidos || '',
    correo: rawUser.correo || rawUser.email || empleado.correo || '',
    email: rawUser.email || rawUser.correo || empleado.correo || '',
    rol,
    role: rawUser.role || rol,
    roles,
    area,
    id_area: idArea ? Number(idArea) : null,
  };
};

export const getCurrentUser = () => {
  try {
    return normalizeAuthUser(JSON.parse(localStorage.getItem('user')) || {});
  } catch {
    return normalizeAuthUser({});
  }
};

export const saveCurrentUser = (user) => {
  const normalized = normalizeAuthUser(user);
  localStorage.setItem('user', JSON.stringify(normalized));
  return normalized;
};

export const getCurrentEmployeeId = () => {
  const idEmpleado = getCurrentUser().id_empleado;
  return Number.isInteger(Number(idEmpleado)) && Number(idEmpleado) > 0 ? Number(idEmpleado) : null;
};

export const getCurrentRole = () => getCurrentUser().rol || getCurrentUser().role || '';

export const getCurrentAreaId = () => {
  const idArea = getCurrentUser().id_area;
  return Number.isInteger(Number(idArea)) && Number(idArea) > 0 ? Number(idArea) : null;
};

export const getAuthUserIssue = () => {
  const user = getCurrentUser();
  if (!user.id_empleado && normalizeText(user.rol) !== 'cliente') {
    return 'Tu sesión no tiene empleado asociado. Vuelve a iniciar sesión o solicita vincular tu usuario a un empleado.';
  }
  return '';
};

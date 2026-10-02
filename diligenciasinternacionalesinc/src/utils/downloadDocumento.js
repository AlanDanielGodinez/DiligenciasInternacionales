/**
 * Descarga autenticada de documentos de clientes. El endpoint
 * GET /api/documentos/:id/descargar exige sesión, por lo que no se puede abrir como enlace
 * directo (<a href> / window.open no envían el token). Se descarga como blob con el token.
 */
import api from '../lib/api';

const fileNameFromDisposition = (header) => {
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(String(header || ''));
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch (_) { return match[1]; }
};

export async function downloadDocumentoAutenticado(documento) {
  if (!documento?.id_documento) return;
  const response = await api.get(`/documentos/${documento.id_documento}/descargar`, { responseType: 'blob' });
  const fileName = fileNameFromDisposition(response.headers?.['content-disposition'])
    || documento.nombre_documento
    || `documento-${documento.id_documento}`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export const describeDownloadError = (error) => {
  const status = error?.response?.status;
  if (status === 403) return 'No tiene permiso para descargar este documento.';
  if (status === 401) return 'Su sesión expiró. Inicie sesión de nuevo.';
  if (status === 404) return 'El documento no existe.';
  return 'No se pudo descargar el documento.';
};

import React from 'react';

export const groupRequiredDocuments = (requirements = []) => {
  const groups = [];
  const positions = new Map();
  requirements.forEach((item) => {
    const key = item.grupo || `item:${item.clave}`;
    if (!positions.has(key)) { positions.set(key, groups.length); groups.push({ key, name: item.grupo_nombre || item.nombre, items: [] }); }
    groups[positions.get(key)].items.push(item);
  });
  return groups;
};

const DocumentItem = ({ item, uploading, onPick, onUpload, onPreview, onDownload, formatDate, showLabel }) => {
  const uploaded = item.estado === 'subido' && item.documento;
  return <div className="solicitudes-nuevo-required-document-item">
    <input id={`documento-requerido-input-${item.clave}`} type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={(event) => onUpload(item, event)} />
    {showLabel && <div><strong>{item.nombre}</strong>{item.obligatorio && <span className="solicitudes-nuevo-required-document-badge is-required">Requerido</span>}</div>}
    <p className={`solicitudes-nuevo-required-document-status ${uploaded ? 'is-uploaded' : 'is-pending'}`}>{uploaded ? 'Archivo cargado' : 'Pendiente'}</p>
    {uploaded && <small>{item.documento.nombre_documento}<span> • </span>{formatDate(item.documento.fecha_subida)}</small>}
    <div className="solicitudes-nuevo-required-document-actions"><button type="button" onClick={() => onPick(item.clave)} disabled={uploading}>{uploading ? 'Subiendo...' : uploaded ? 'Reemplazar' : 'Subir archivo'}</button>{uploaded && <><button type="button" onClick={() => onPreview(item.documento)}>Ver</button><button type="button" onClick={() => onDownload(item.documento)}>Descargar</button></>}</div>
  </div>;
};

export default function RequiredDocumentsPanel({ requirements = [], uploading = {}, onPick, onUpload, onPreview, onDownload, formatDate }) {
  return <div className="solicitudes-nuevo-required-documents-list">{groupRequiredDocuments(requirements).map((group) => { const loaded = group.items.filter((item) => item.estado === 'subido' && item.documento).length; const grouped = group.items.length > 1; return <article className={`solicitudes-nuevo-required-document ${grouped ? 'is-grouped' : ''}`} key={group.key}><div><strong>{group.name}</strong>{!grouped && <span className={`solicitudes-nuevo-required-document-badge ${group.items[0].obligatorio ? 'is-required' : 'is-optional'}`}>{group.items[0].obligatorio ? 'Requerido' : 'Opcional'}</span>}</div>{grouped && <span className="solicitudes-nuevo-required-document-group-count">{loaded}/{group.items.length} archivos</span>}{group.items.map((item) => <DocumentItem key={item.clave} item={item} uploading={Boolean(uploading[item.clave])} onPick={onPick} onUpload={onUpload} onPreview={onPreview} onDownload={onDownload} formatDate={formatDate} showLabel={grouped} />)}</article>; })}</div>;
}

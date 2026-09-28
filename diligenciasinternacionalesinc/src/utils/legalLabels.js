export const legalStateLabel={PENDIENTE_ASIGNACION:'Nuevo',EN_ANALISIS:'En proceso',ESPERANDO_INFORMACION:'Esperando información',ESPERANDO_CLIENTE:'Esperando cliente',RESUELTO:'Resuelto',CERRADO:'Terminado'};
export const legalResultLabel={CANDIDATO:'Candidato',NO_CANDIDATO:'No candidato',REQUIERE_NUEVO_TRAMITE:'Requiere nuevo trámite',REGRESA_ORIGEN:'Regresa al proceso de origen',OTRO:'Otro'};
export const legalOriginLabel={NEGADOS_GRUPOS:'Negados · AMA',NEGADOS_INDIVIDUALES:'Negados · Individuales',INFORMES:'Informes',DIRECTO:'Directo',AMA:'AMA',VISAS_INDIVIDUALES:'Visas individuales',VISA_CANADIENSE:'Visa canadiense'};
export const legalServiceLabel=(row={})=>row.servicio_legal||(row.tipo_caso==='ANALISIS_NEGADOS'?'Análisis de caso negado':String(row.tipo_caso||row.motivo_entrada||'').toUpperCase().includes('FOIA')?'Análisis FOIA':'Análisis legal');
export const legalPaymentLabel={NO_APLICA:'No aplica',PENDIENTE:'Pendiente',REGISTRADO:'Registrado',VALIDADO:'Validado'};

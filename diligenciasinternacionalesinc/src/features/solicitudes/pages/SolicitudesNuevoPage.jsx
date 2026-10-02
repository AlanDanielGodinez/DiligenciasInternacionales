import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaComments,
  FaDownload,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaFileAlt,
  FaFileDownload,
  FaFilter,
  FaFlag,
  FaFolderOpen,
  FaGlobeAmericas,
  FaHistory,
  FaInbox,
  FaMapMarkerAlt,
  FaPauseCircle,
  FaPhone,
  FaPlus,
  FaPlusCircle,
  FaQuestionCircle,
  FaSearch,
  FaTimes,
  FaUserCheck,
  FaUsers,
} from 'react-icons/fa';
import {
  getDocumentosBySolicitud,
  getDocumentosRequeridosBySolicitud,
  getResumenAvanceSolicitud,
  getSolicitudById,
  getSolicitudes,
  getEstadosDisponiblesSolicitud,
  getSeguimientosBySolicitud,
  createSeguimientoOperativo,
  uploadDocumentoRequerido,
  updateCliente,
  updateContacto,
  updateSolicitud,
  updateSolicitudResponsable,
} from '../../../services/solicitudes.service';
import {
  createPerfilSolicitud,
  descargarDocumentoPerfilPdf,
  generarPdfPerfilVersion,
  getPerfilBySolicitud,
  getPerfilVersiones,
  resolverPerfilPlantilla,
  updatePerfil,
} from '../../../services/perfiles.service';
import api from '../../../lib/api';
import { downloadDocumentoAutenticado, describeDownloadError } from '../../../utils/downloadDocumento';
import { shouldCommitSolicitudLoad } from '../../../utils/solicitudLoadGuard';
import SolicitudReviewNotes from '../../../Components/AreaBandeja/SolicitudReviewNotes';
import AmaSolicitudActivity from '../../../Components/AreaBandeja/AmaSolicitudActivity';
import ReapplicationIndicator from '../../../Components/Negados/ReapplicationIndicator';
import SatisfactionSurveyCard from '../../../Components/Surveys/SatisfactionSurveyCard';
import NegadosProcessCard from '../../../Components/Negados/NegadosProcessCard';
import LegalProcessCard from '../../../Components/Legales/LegalProcessCard';
import ProfileFormRenderer from '../../../Components/Profiles/ProfileFormRenderer';
import RequiredDocumentsPanel, { groupRequiredDocuments } from '../../../Components/Documents/RequiredDocumentsPanel';
import IndividualWorkspacePanel from '../../../Components/Individual/IndividualWorkspacePanel';
import AmaApplicantWorkspace from '../../../Components/AMA/AmaApplicantWorkspace';
import { getCurrentEmployeeId } from '../../../utils/authUser';
import './SolicitudesNuevoPage.css';

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const getValue = (value) => (hasValue(value) ? value : 'N/A');
const getQuickBooksResultCopy = (status) => ({
  synced: { title: 'Enviado a QuickBooks', detail: 'Contacto registrado correctamente.', tone: 'success' },
  pending: { title: 'SincronizaciÃ³n con QuickBooks pendiente', detail: 'El contacto quedÃ³ registrado correctamente.', tone: 'warning' },
  error: { title: 'No se pudo sincronizar con QuickBooks', detail: 'El registro no se perdiÃ³ y puede reintentarse.', tone: 'error' },
  not_configured: { title: 'QuickBooks todavÃ­a no estÃ¡ conectado', detail: 'El contacto quedÃ³ registrado correctamente.', tone: 'warning' },
  reconnect_required: { title: 'QuickBooks requiere reconexiÃ³n', detail: 'El contacto quedÃ³ registrado y puede sincronizarse despuÃ©s.', tone: 'error' },
}[status] || { title: 'SincronizaciÃ³n con QuickBooks pendiente', detail: 'El contacto quedÃ³ registrado correctamente.', tone: 'warning' });

const formatDate = (value) => {
  if (!hasValue(value)) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-MX');
};

const formatFileSize = (value) => {
  if (!hasValue(value)) return 'N/A';
  const size = Number(value);
  if (Number.isNaN(size)) return 'N/A';
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${size} B`;
};

const buildClientName = (solicitud = {}) => {
  const name = [
    solicitud.cliente_nombre,
    solicitud.cliente_apellido_paterno,
    solicitud.cliente_apellido_materno,
  ]
    .filter(hasValue)
    .map((part) => String(part).trim())
    .join(' ');

  return name || 'N/A';
};

const normalizeSearchValue = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const SEARCH_FIELDS = [
  'id_solicitud',
  'idSolicitud',
  'folio_solicitud',
  'folioSolicitud',
  'id_cliente',
  'cliente_id',
  'idCliente',
  'id_contacto',
  'contacto_id',
  'idContacto',
  'nombre_cliente',
  'cliente_nombre',
  'nombrecliente',
  'nombre_aplicante',
  'nombreAplicante',
  'aplicante',
  'cliente',
  'tipo_tramite',
  'tipoTramite',
  'tipo_nombre',
  'tramite',
  'estado',
  'estado_actual',
  'estado_actual_valor',
  'estado_actual_display',
  'correo',
  'correo_electronico',
  'email',
  'cliente_correo',
  'contacto_correo',
  'telefono',
  'telefono_1',
  'telefono_2',
  'cliente_telefono',
  'contacto_telefono',
  'telefono_emergencia',
];

const getClientInitials = (solicitud = {}) => {
  const name = buildClientName(solicitud);
  if (name === 'N/A') return 'NA';

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const getClientId = (solicitud = {}) => solicitud.id_cliente || solicitud.cliente_id;
const isWebUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());
// La descarga exige sesión: se hace como blob con el token (ver utils/downloadDocumento.js).
const descargarDocumento = (documento) =>
  downloadDocumentoAutenticado(documento).catch((error) => window.alert(describeDownloadError(error)));
const getPreviewUrl = (documento) =>
  documento?.drive_file_id
    ? `https://drive.google.com/file/d/${documento.drive_file_id}/preview`
    : null;

const openExternalLink = (url) => {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};

const getTodayInputValue = () => new Date().toISOString().slice(0, 10);

const getInitialCreateForm = () => ({
  contacto: {
    nombre: '',
    telefono: '',
    telefono_emergencia: '',
    correo: '',
    fecha_ingreso: getTodayInputValue(),
  },
  aplicantes: [
    {
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      telefono: '',
      correo: '',
      fecha_nacimiento: '',
      id_pais: '1',
      estado: '',
      ciudad: '',
      direccion: '',
      notas_generales: '',
      id_tipo_tramite: '',
      id_tipo_tramite_adicional: '',
      canal_contacto: '',
      fecha_inicio: getTodayInputValue(),
      observaciones: '',
      estado_actual: '',
      id_area_actual: '',
      fecha_cierre: '',
      id_empleado_responsable: '',
      responsable_display: '',
      area_actual_display: '',
      estado_actual_display: '',
      fecha_proximo_contacto: '',
      resultado: '',
      aplica_descuento: false,
      motivos_descuento: [],
    },
  ],
  resumen: null,
});

const getEmptyAplicanteForm = () => ({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  telefono: '',
  correo: '',
  fecha_nacimiento: '',
  id_pais: '1',
  estado: '',
  ciudad: '',
  direccion: '',
  notas_generales: '',
  id_tipo_tramite: '',
  id_tipo_tramite_adicional: '',
  canal_contacto: '',
  fecha_inicio: getTodayInputValue(),
  observaciones: '',
  estado_actual: '',
  id_area_actual: '',
  fecha_cierre: '',
  id_empleado_responsable: '',
  responsable_display: '',
  area_actual_display: '',
  estado_actual_display: '',
  fecha_proximo_contacto: '',
  resultado: '',
  aplica_descuento: false,
  motivos_descuento: [],
});

const getEditExpedienteForm = (solicitud = {}) => ({
  contacto: {
    nombre: solicitud.contacto_nombre || '',
    telefono: solicitud.contacto_telefono || '',
    telefono_emergencia: solicitud.contacto_telefono_emergencia || solicitud.telefono_emergencia || '',
    correo: solicitud.contacto_correo || '',
    fecha_ingreso: getTodayInputValue(),
  },
  aplicantes: [
    {
      nombre: solicitud.cliente_nombre || '',
      apellido_paterno: solicitud.cliente_apellido_paterno || '',
      apellido_materno: solicitud.cliente_apellido_materno || '',
      telefono: solicitud.cliente_telefono || '',
      correo: solicitud.cliente_correo || '',
      fecha_nacimiento: solicitud.fecha_nacimiento || solicitud.cliente_fecha_nacimiento || '',
      id_pais: String(solicitud.id_pais || 1),
      estado: solicitud.cliente_estado || solicitud.estado || '',
      ciudad: solicitud.cliente_ciudad || solicitud.ciudad || '',
      direccion: solicitud.cliente_direccion || solicitud.direccion || '',
      notas_generales: solicitud.notas_generales || solicitud.cliente_notas_generales || '',
      id_tipo_tramite: solicitud.id_tipo_tramite ? String(solicitud.id_tipo_tramite) : '',
      id_tipo_tramite_adicional: '',
      canal_contacto: solicitud.canal_contacto || '',
      fecha_inicio: solicitud.fecha_inicio || getTodayInputValue(),
      fecha_primera_aplicacion: solicitud.fecha_primera_aplicacion ? String(solicitud.fecha_primera_aplicacion).slice(0, 10) : '',
      observaciones: solicitud.observaciones || '',
      estado_actual: hasValue(solicitud.estado_actual) ? String(solicitud.estado_actual) : '',
      id_area_actual: hasValue(solicitud.id_area_actual) ? String(solicitud.id_area_actual) : '',
      fecha_cierre: solicitud.fecha_cierre ? String(solicitud.fecha_cierre).slice(0, 10) : '',
      id_empleado_responsable: hasValue(solicitud.id_empleado_responsable)
        ? String(solicitud.id_empleado_responsable)
        : '',
      responsable_display: getResponsableNombre(solicitud),
      area_actual_display: getAreaActual(solicitud),
      estado_actual_display: getEstadoActual(solicitud),
      fecha_proximo_contacto: solicitud.fecha_proximo_contacto
        ? String(solicitud.fecha_proximo_contacto).slice(0, 10)
        : '',
      resultado: solicitud.resultado || '',
      aplica_descuento: Boolean(solicitud.aplica_descuento),
      motivos_descuento: Array.isArray(solicitud.motivos_descuento) ? solicitud.motivos_descuento : [],
    },
  ],
  resumen: {
    contacto: {
      id_contacto: solicitud.id_contacto,
      nombre: solicitud.contacto_nombre,
    },
    aplicantes: [
      {
        id_cliente: getClientId(solicitud),
        nombre: solicitud.cliente_nombre,
        apellido_paterno: solicitud.cliente_apellido_paterno,
        apellido_materno: solicitud.cliente_apellido_materno,
      },
    ],
    solicitudes: [solicitud],
  },
});

const findTipoTramiteById = (tipoTramites = [], idTipoTramite) =>
  tipoTramites.find((tipo) => String(tipo.id_tipo_tramite) === String(idTipoTramite));

const isPasaporteTramite = (tipo = {}) => {
  const label = `${tipo.nombre_tramite || ''} ${tipo.clave || ''}`.toLowerCase();
  return label.includes('pasaporte');
};

const isPasaporteSeleccionado = (tipoTramites = [], idTipoTramite) => {
  const tipo = findTipoTramiteById(tipoTramites, idTipoTramite);
  return Boolean(tipo && isPasaporteTramite(tipo));
};

const getAplicanteTramites = (aplicante = {}, tipoTramites = []) => {
  const base = {
    canal_contacto: aplicante.canal_contacto || '',
    observaciones: aplicante.observaciones || '',
    fecha_inicio: aplicante.fecha_inicio || getTodayInputValue(),
  };
  const principalEsPasaporte = isPasaporteSeleccionado(tipoTramites, aplicante.id_tipo_tramite);
  const tramites = [
    {
      ...base,
      id_tipo_tramite: aplicante.id_tipo_tramite || '',
      tipo_registro: 'principal',
    },
  ];

  if (principalEsPasaporte && hasValue(aplicante.id_tipo_tramite_adicional)) {
    tramites.push({
      ...base,
      id_tipo_tramite: aplicante.id_tipo_tramite_adicional,
      tipo_registro: 'adicional',
    });
  }

  return tramites;
};

const getTramitePositionLabel = (index) =>
  index === 0 ? 'TrÃ¡mite principal' : 'TrÃ¡mite adicional';

const groupSolicitudesByAplicante = (solicitudes = []) =>
  solicitudes.reduce((groups, solicitud) => {
    const key = getClientId(solicitud) || `solicitud-${solicitud.id_solicitud}`;
    const existing = groups.find((group) => String(group.key) === String(key));
    if (existing) {
      existing.solicitudes.push(solicitud);
      return groups;
    }
    return [...groups, { key, aplicante: solicitud, solicitudes: [solicitud] }];
  }, []);

const normalizeArrayResponse = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;

const getAreaActual = (solicitud = {}) =>
  getValue(solicitud.area_actual_nombre || solicitud.area_actual_clave);

const getTipoTramite = (solicitud = {}) =>
  getValue(solicitud.nombre_tramite || solicitud.tipo_nombre);

const getEstadoActual = (solicitud = {}) =>
  getValue(solicitud.estado_actual_valor || solicitud.estado_actual);

const getResponsableNombre = (solicitud = {}) => {
  const nombre = [solicitud.empleado_responsable_nombre, solicitud.empleado_responsable_apellidos]
    .filter(hasValue)
    .map((part) => String(part).trim())
    .join(' ');
  return nombre || 'Sin asignar';
};

const getSeguimientoTitle = (seguimiento = {}) =>
  getValue(seguimiento.descripcion || seguimiento.origen);

const formatOrigen = (value) => {
  if (!hasValue(value)) return 'N/A';
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'frontend_nuevo') return 'Informes';
  if (normalized === 'migracion_google_sheets') return 'MigraciÃ³n inicial';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getAge = (birthDateValue) => {
  if (!hasValue(birthDateValue)) return null;
  const birthDate = new Date(`${birthDateValue}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const isAmaTramite = (tipo = {}) => {
  const label = `${tipo.nombre_tramite || ''} ${tipo.clave || ''}`.toLowerCase();
  return /\bama\b/.test(label);
};

const canSelectTramite = (aplicante, tipo) => {
  if (!isAmaTramite(tipo)) return true;
  const age = getAge(aplicante.fecha_nacimiento);
  return age !== null && age >= 57;
};

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const isClosedSolicitud = (solicitud) => {
  const status = normalizeStatus(getEstadoActual(solicitud));
  return status.includes('cerr') || status.includes('final') || status.includes('cancel');
};

const getSolicitudTone = (value) => {
  const status = normalizeStatus(value);
  if (!status) return 'neutral';
  if (status.includes('aprob') || status.includes('complet') || status.includes('final')) return 'success';
  if (status.includes('cancel') || status.includes('rechaz')) return 'danger';
  if (status.includes('pend') || status.includes('esper')) return 'warning';
  return 'info';
};

const getDocumentStatus = (documento) => {
  if (documento.drive_match_status === 'matched' && documento.drive_file_id) {
    return { label: 'Vinculado a Drive', tone: 'success' };
  }

  const statuses = {
    invalid_reference: { label: 'Referencia legacy', tone: 'warning' },
    invalid_path: { label: 'Referencia legacy', tone: 'warning' },
    folder_not_found: { label: 'Carpeta no localizada', tone: 'caution' },
    file_not_found: { label: 'Archivo no encontrado', tone: 'danger' },
    multiple_matches: { label: 'RevisiÃ³n manual', tone: 'review' },
  };

  return (
    statuses[documento.drive_match_status] || {
      label: documento.origen_documento === 'legacy_appsheet' ? 'Legado AppSheet' : 'Sin vincular',
      tone: 'neutral',
    }
  );
};

const getPerfilSections = (estructuraJson = {}) =>
  Number(estructuraJson?.schema_version) === 2
    ? (Array.isArray(estructuraJson?.sections) ? estructuraJson.sections : [])
    : (Array.isArray(estructuraJson?.secciones) ? estructuraJson.secciones : []);

const getPerfilFields = (estructuraJson = {}) =>
  getPerfilSections(estructuraJson).flatMap((section) =>
    Number(estructuraJson?.schema_version) === 2
      ? (Array.isArray(section?.fields) ? section.fields.filter((field) => field.type !== 'repeater') : [])
      : (Array.isArray(section?.campos) ? section.campos : [])
  );

const getPerfilFieldLabel = (estructuraJson = {}, fieldName) => {
  const field = getPerfilFields(estructuraJson).find((item) => (item?.name || item?.key) === fieldName);
  return field?.label || fieldName;
};

const isTechnicalPerfilKey = (key) =>
  ['source_id', 'frontend_nuevo', 'migracion_google_sheets'].includes(String(key).toLowerCase());

const getPerfilPdfFilename = (version) =>
  version?.pdf_nombre_archivo || `Perfil-version-${getValue(version?.id_version)}.pdf`;

const getPerfilTemplateJson = (perfil = {}, fallbackPlantilla = null) =>
  perfil?.estructura_json || fallbackPlantilla?.estructura_json || {};

const buildPerfilFormValues = (estructuraJson = {}, respuestasJson = {}) => {
  const values = { ...(respuestasJson || {}) };
  getPerfilFields(estructuraJson).forEach((field) => {
    const key = field?.name || field?.key;
    if (key && values[key] === undefined) values[key] = field.type === 'boolean' ? false : field.type === 'multiselect' ? [] : '';
  });
  return values;
};

const getFriendlyPerfilError = (error) => {
  const message = getApiErrorMessage(error, '');
  if (
    error?.code === 'ECONNABORTED' ||
    error?.response?.status >= 500 ||
    /timeout|terminated|connection/i.test(message)
  ) {
    return 'No se pudo cargar el perfil. Intenta nuevamente.';
  }
  return message || 'No se pudo cargar el perfil. Intenta nuevamente.';
};

const DetailField = ({ label, children, wide = false }) => (
  <div className={`solicitudes-nuevo-detail-field${wide ? ' solicitudes-nuevo-detail-field-wide' : ''}`}>
    <span>{label}</span>
    <strong>{children}</strong>
  </div>
);

const SolicitudesNuevoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const autoOpenedSolicitudRef = useRef(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exactSolicitud, setExactSolicitud] = useState(null);
  const [, setExactSearchLoading] = useState(false);
  const [exactSearchMessage, setExactSearchMessage] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentosRequeridosLoading, setDocumentosRequeridosLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailMessage, setDetailMessage] = useState('');
  const [documentsMessage, setDocumentsMessage] = useState('');
  const [documentosRequeridosMessage, setDocumentosRequeridosMessage] = useState('');
  const [documentosRequeridosUploading, setDocumentosRequeridosUploading] = useState({});
  const [resumenAvance, setResumenAvance] = useState(null);
  const [resumenAvanceLoading, setResumenAvanceLoading] = useState(false);
  const [resumenAvanceMessage, setResumenAvanceMessage] = useState('');
  const [historyMessage, setHistoryMessage] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [perfilSolicitud, setPerfilSolicitud] = useState(null);
  const solicitudLoadVersionRef = useRef(0);
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [perfilMessage, setPerfilMessage] = useState('');
  const [perfilModalMode, setPerfilModalMode] = useState(null);
  const [perfilPlantilla, setPerfilPlantilla] = useState(null);
  const [perfilFormValues, setPerfilFormValues] = useState({});
  const [perfilRepeaters, setPerfilRepeaters] = useState({});
  const [perfilValidationErrors, setPerfilValidationErrors] = useState([]);
  const [perfilSaving, setPerfilSaving] = useState(false);
  const [perfilModalMessage, setPerfilModalMessage] = useState('');
  const [perfilVersiones, setPerfilVersiones] = useState([]);
  const [perfilVersionesLoading, setPerfilVersionesLoading] = useState(false);
  const [perfilSelectedVersion, setPerfilSelectedVersion] = useState(null);
  const [perfilPdfActionByVersion, setPerfilPdfActionByVersion] = useState({});
  const [perfilActiveSectionIndex, setPerfilActiveSectionIndex] = useState(0);
  const [tipoTramites, setTipoTramites] = useState([]);
  const [tiposLoading, setTiposLoading] = useState(false);
  const [tiposLoaded, setTiposLoaded] = useState(false);
  const [paises, setPaises] = useState([]);
  const [paisesLoading, setPaisesLoading] = useState(false);
  const [paisesLoaded, setPaisesLoaded] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [empleadosLoading, setEmpleadosLoading] = useState(false);
  const [empleadosLoaded, setEmpleadosLoaded] = useState(false);
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areasLoaded, setAreasLoaded] = useState(false);
  const [estatusCatalogo, setEstatusCatalogo] = useState([]);
  const [estatusLoading, setEstatusLoading] = useState(false);
  const [estatusLoaded, setEstatusLoaded] = useState(false);
  const [responsableEditorOpen, setResponsableEditorOpen] = useState(false);
  const [responsableValue, setResponsableValue] = useState('');
  const [responsableSaving, setResponsableSaving] = useState(false);
  const [responsableMessage, setResponsableMessage] = useState('');
  const [seguimientoOperativoOpen, setSeguimientoOperativoOpen] = useState(false);
  const [estadosOperativos, setEstadosOperativos] = useState([]);
  const [estadosOperativosLoading, setEstadosOperativosLoading] = useState(false);
  const [seguimientoOperativoForm, setSeguimientoOperativoForm] = useState({
    estado_nuevo: '',
    descripcion: '',
    fecha_proximo_contacto: '',
  });
  const [seguimientoOperativoSaving, setSeguimientoOperativoSaving] = useState(false);
  const [seguimientoOperativoMessage, setSeguimientoOperativoMessage] = useState('');
  const [createForm, setCreateForm] = useState(getInitialCreateForm);
  const [createMode, setCreateMode] = useState('create');
  const [createStep, setCreateStep] = useState(1);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    let mounted = true;

    getSolicitudes({ limit: 500, offset: 0 })
      .then((data) => {
        if (mounted) setSolicitudes(data);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || 'No fue posible cargar las solicitudes.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (viewMode !== 'create' || tiposLoaded || tiposLoading) return;

    setTiposLoading(true);
    api
      .get('/tipos-tramite', { params: { limit: 500, offset: 0 } })
      .then((response) => setTipoTramites(normalizeArrayResponse(response.data, 'tipos_tramite')))
      .catch((requestError) => {
        setCreateError(getApiErrorMessage(requestError, 'No fue posible cargar los tipos de trÃ¡mite.'));
      })
      .finally(() => {
        setTiposLoaded(true);
        setTiposLoading(false);
      });
  }, [tiposLoaded, tiposLoading, viewMode]);

  useEffect(() => {
    if (viewMode !== 'create' || paisesLoaded || paisesLoading) return;

    setPaisesLoading(true);
    api
      .get('/catalogos/paises')
      .then((response) => setPaises(normalizeArrayResponse(response.data, 'paises')))
      .catch((requestError) => {
        setCreateError(getApiErrorMessage(requestError, 'No fue posible cargar los paises.'));
      })
      .finally(() => {
        setPaisesLoaded(true);
        setPaisesLoading(false);
      });
  }, [paisesLoaded, paisesLoading, viewMode]);

  useEffect(() => {
    if (!(responsableEditorOpen || (viewMode === 'create' && createMode === 'edit')) || empleadosLoaded || empleadosLoading) return;

    setEmpleadosLoading(true);
    api
      .get('/empleados')
      .then((response) => setEmpleados(normalizeArrayResponse(response.data, 'empleados')))
      .catch((requestError) => {
        setResponsableMessage(getApiErrorMessage(requestError, 'No fue posible cargar empleados.'));
      })
      .finally(() => {
        setEmpleadosLoaded(true);
        setEmpleadosLoading(false);
      });
  }, [createMode, empleadosLoaded, empleadosLoading, responsableEditorOpen, viewMode]);

  useEffect(() => {
    if (!(viewMode === 'create' && createMode === 'edit') || areasLoaded || areasLoading) return;

    setAreasLoading(true);
    api
      .get('/catalogos/areas')
      .then((response) => setAreas(normalizeArrayResponse(response.data, 'areas')))
      .catch((requestError) => {
        setCreateError(getApiErrorMessage(requestError, 'No fue posible cargar las Ã¡reas.'));
      })
      .finally(() => {
        setAreasLoaded(true);
        setAreasLoading(false);
      });
  }, [areasLoaded, areasLoading, createMode, viewMode]);

  useEffect(() => {
    if (!(viewMode === 'create' && createMode === 'edit') || estatusLoaded || estatusLoading) return;

    setEstatusLoading(true);
    api
      .get('/catalogos/estatus')
      .then((response) => setEstatusCatalogo(normalizeArrayResponse(response.data, 'estatus')))
      .catch((requestError) => {
        setCreateError(getApiErrorMessage(requestError, 'No fue posible cargar los estados.'));
      })
      .finally(() => {
        setEstatusLoaded(true);
        setEstatusLoading(false);
      });
  }, [createMode, estatusLoaded, estatusLoading, viewMode]);

  const filteredSolicitudes = useMemo(() => {
    const query = normalizeSearchValue(search);

    return solicitudes.filter((solicitud) => {
      const matchesSearch =
        !query ||
        SEARCH_FIELDS.some((field) => normalizeSearchValue(solicitud[field]).includes(query)) ||
        normalizeSearchValue(buildClientName(solicitud)).includes(query) ||
        normalizeSearchValue(getTipoTramite(solicitud)).includes(query) ||
        normalizeSearchValue(getEstadoActual(solicitud)).includes(query);
      const matchesType = !typeFilter || getTipoTramite(solicitud) === typeFilter;
      const matchesStatus = !statusFilter || getEstadoActual(solicitud) === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, solicitudes, statusFilter, typeFilter]);

  const displaySolicitudes =
    filteredSolicitudes.length > 0
      ? filteredSolicitudes
      : exactSolicitud
        ? [exactSolicitud]
        : [];
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(displaySolicitudes.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSolicitudes = displaySolicitudes.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const metrics = useMemo(() => {
    const active = solicitudes.filter((solicitud) => !isClosedSolicitud(solicitud)).length;
    const closed = solicitudes.filter(isClosedSolicitud).length;
    const withClient = solicitudes.filter(
      (solicitud) => buildClientName(solicitud) !== 'N/A'
    ).length;

    return [
      { label: 'Aplicantes cargados', value: solicitudes.length, caption: 'Expedientes registrados', icon: FaUsers, tone: 'teal' },
      { label: 'TrÃ¡mites activos', value: active, caption: `${active} en revisiÃ³n activa`, icon: FaInbox, tone: 'navy' },
      { label: 'Con expediente', value: withClient, caption: 'Aplicantes con datos vinculados', icon: FaFolderOpen, tone: 'blue' },
      { label: 'Requieren revisiÃ³n', value: closed, caption: 'Seguimiento prioritario', icon: FaPauseCircle, tone: 'amber' },
    ];
  }, [solicitudes]);

  const typeOptions = useMemo(
    () => [...new Set(solicitudes.map(getTipoTramite).filter((value) => value !== 'N/A'))].sort(),
    [solicitudes]
  );
  const statusOptions = useMemo(
    () => [...new Set(solicitudes.map(getEstadoActual).filter((value) => value !== 'N/A'))].sort(),
    [solicitudes]
  );

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmedSearch = search.trim();
    if (!trimmedSearch || filteredSolicitudes.length > 0) return;
    const isNumericSearch = /^\d+$/.test(trimmedSearch);
    if (!isNumericSearch) return;

    setExactSearchLoading(true);
    setExactSearchMessage('');
    setExactSolicitud(null);

    try {
      const solicitud = await getSolicitudById(trimmedSearch);
      if (solicitud?.id_solicitud) setExactSolicitud(solicitud);
      else setExactSearchMessage('No se encontrÃ³ la solicitud en la base de datos.');
    } catch (requestError) {
      setExactSearchMessage('No se encontrÃ³ la solicitud en la base de datos.');
    } finally {
      setExactSearchLoading(false);
    }
  };

  const resetPerfilState = () => {
    setPerfilSolicitud(null);
    setPerfilLoading(false);
    setPerfilMessage('');
    setPerfilModalMode(null);
    setPerfilPlantilla(null);
    setPerfilFormValues({});
    setPerfilRepeaters({});
    setPerfilValidationErrors([]);
    setPerfilSaving(false);
    setPerfilModalMessage('');
    setPerfilVersiones([]);
    setPerfilVersionesLoading(false);
    setPerfilSelectedVersion(null);
    setPerfilActiveSectionIndex(0);
  };

  const loadPerfilSolicitud = async (idSolicitud, loadVersion) => {
    setPerfilLoading(true);
    setPerfilMessage('');

    try {
      const perfil = await getPerfilBySolicitud(idSolicitud);
      if (shouldCommitSolicitudLoad(solicitudLoadVersionRef.current, loadVersion, idSolicitud, perfil?.id_solicitud)) {
        setPerfilSolicitud(perfil);
        if (!perfil) setPerfilMessage('');
      }
      return perfil;
    } catch (requestError) {
      if (loadVersion === solicitudLoadVersionRef.current) {
        setPerfilSolicitud(null);
        setPerfilMessage(getFriendlyPerfilError(requestError));
      }
      return null;
    } finally {
      if (loadVersion === solicitudLoadVersionRef.current) setPerfilLoading(false);
    }
  };

  const loadResumenAvanceSolicitud = async (idSolicitud, loadVersion = solicitudLoadVersionRef.current) => {
    setResumenAvanceLoading(true);
    setResumenAvanceMessage('');

    try {
      const resumen = await getResumenAvanceSolicitud(idSolicitud);
      if (loadVersion === solicitudLoadVersionRef.current) setResumenAvance(resumen);
      return resumen;
    } catch (requestError) {
      if (loadVersion === solicitudLoadVersionRef.current) {
        setResumenAvance(null);
        setResumenAvanceMessage('No fue posible consultar el avance del expediente.');
      }
      return null;
    } finally {
      if (loadVersion === solicitudLoadVersionRef.current) setResumenAvanceLoading(false);
    }
  };

  const handleOpenSolicitud = async (solicitud) => {
    const loadVersion = ++solicitudLoadVersionRef.current;
    setSelectedSolicitud(solicitud);
    setViewMode('profile');
    setDocumentos([]);
    setDocumentosRequeridos([]);
    setResumenAvance(null);
    setSeguimientos([]);
    setPerfilSolicitud(null);
    setDetailLoading(true);
    setDocumentsLoading(true);
    setDocumentosRequeridosLoading(true);
    setResumenAvanceLoading(true);
    setHistoryLoading(true);
    setPerfilLoading(true);
    setDetailMessage('');
    setDocumentsMessage('');
    setDocumentosRequeridosMessage('');
    setResumenAvanceMessage('');
    setHistoryMessage('');
    setPerfilMessage('');
    setPerfilModalMode(null);
    setPerfilPlantilla(null);
    setPerfilFormValues({});
    setPerfilRepeaters({});
    setPerfilValidationErrors([]);
    setPerfilVersiones([]);
    setPerfilSelectedVersion(null);
    setPerfilActiveSectionIndex(0);
    setResponsableEditorOpen(false);
    setResponsableMessage('');
    setSeguimientoOperativoOpen(false);
    setEstadosOperativos([]);
    setSeguimientoOperativoForm({
      estado_nuevo: '',
      descripcion: '',
      fecha_proximo_contacto: '',
    });
    setSeguimientoOperativoMessage('');

    const detailRequest = getSolicitudById(solicitud.id_solicitud)
      .then((detail) => {
        if (detail && loadVersion === solicitudLoadVersionRef.current) setSelectedSolicitud({ ...solicitud, ...detail });
      })
      .catch(() => { if (loadVersion === solicitudLoadVersionRef.current) setDetailMessage('Se muestra la informaciÃ³n disponible en el listado.'); })
      .finally(() => { if (loadVersion === solicitudLoadVersionRef.current) setDetailLoading(false); });

    const documentsRequest = getDocumentosBySolicitud(solicitud.id_solicitud)
      .then((items) => { if (loadVersion === solicitudLoadVersionRef.current) setDocumentos(items); })
      .catch(() => {
        if (loadVersion !== solicitudLoadVersionRef.current) return;
        setDocumentos([]);
        setDocumentsMessage('No fue posible consultar los documentos.');
      })
      .finally(() => { if (loadVersion === solicitudLoadVersionRef.current) setDocumentsLoading(false); });

    const documentosRequeridosRequest = getDocumentosRequeridosBySolicitud(solicitud.id_solicitud)
      .then((items) => { if (loadVersion === solicitudLoadVersionRef.current) setDocumentosRequeridos(items); })
      .catch(() => {
        if (loadVersion !== solicitudLoadVersionRef.current) return;
        setDocumentosRequeridos([]);
        setDocumentosRequeridosMessage('No fue posible consultar los documentos requeridos.');
      })
      .finally(() => { if (loadVersion === solicitudLoadVersionRef.current) setDocumentosRequeridosLoading(false); });

    const historyRequest = getSeguimientosBySolicitud(solicitud.id_solicitud)
      .then((items) => { if (loadVersion === solicitudLoadVersionRef.current) setSeguimientos(items); })
      .catch(() => {
        if (loadVersion !== solicitudLoadVersionRef.current) return;
        setSeguimientos([]);
        setHistoryMessage('No fue posible consultar el historial.');
      })
      .finally(() => { if (loadVersion === solicitudLoadVersionRef.current) setHistoryLoading(false); });

    const perfilRequest = loadPerfilSolicitud(solicitud.id_solicitud, loadVersion);
    const resumenAvanceRequest = loadResumenAvanceSolicitud(solicitud.id_solicitud, loadVersion);

    await Promise.allSettled([
      detailRequest,
      documentsRequest,
      documentosRequeridosRequest,
      resumenAvanceRequest,
      historyRequest,
      perfilRequest,
    ]);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idSolicitudParam = params.get('id_solicitud');
    const idSolicitud = Number(idSolicitudParam);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) return;
    if (autoOpenedSolicitudRef.current === idSolicitud) return;

    autoOpenedSolicitudRef.current = idSolicitud;
    setSearch(String(idSolicitud));
    setExactSearchMessage('');
    setExactSolicitud(null);

    const solicitudListado = solicitudes.find(
      (solicitud) => Number(solicitud.id_solicitud) === idSolicitud
    );

    if (solicitudListado) {
      handleOpenSolicitud(solicitudListado);
      return;
    }

    setExactSearchLoading(true);
    getSolicitudById(idSolicitud)
      .then((solicitud) => {
        if (!solicitud?.id_solicitud) {
          setExactSearchMessage(`No se encontro la solicitud #${idSolicitud}.`);
          return;
        }
        setExactSolicitud(solicitud);
        handleOpenSolicitud(solicitud);
      })
      .catch(() => {
        setExactSearchMessage(`No se encontro la solicitud #${idSolicitud}.`);
      })
      .finally(() => {
        setExactSearchLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, solicitudes]);

  const handleBackToList = () => {
    setViewMode('list');
    setCreateMode('create');
    setSelectedSolicitud(null);
    setDocumentos([]);
    setSeguimientos([]);
    setPreviewDocument(null);
    resetPerfilState();
    setDetailMessage('');
    setDocumentsMessage('');
    setHistoryMessage('');
  };
  const closeDetail = handleBackToList;

  const handleOpenCreate = () => {
    setViewMode('create');
    setCreateMode('create');
    setSelectedSolicitud(null);
    setDocumentos([]);
    setSeguimientos([]);
    setPreviewDocument(null);
    resetPerfilState();
    setDetailMessage('');
    setDocumentsMessage('');
    setHistoryMessage('');
    setCreateError('');
    setCreateSuccess('');
    setCreateForm(getInitialCreateForm());
    setCreateStep(1);
  };

  const handleOpenEditExpediente = () => {
    if (!selectedSolicitud) return;

    setViewMode('create');
    setCreateMode('edit');
    setCreateError('');
    setCreateSuccess('');
    setResponsableEditorOpen(false);
    setResponsableMessage('');
    setCreateForm(getEditExpedienteForm(selectedSolicitud));
    setCreateStep(1);
  };

  const handleCloseCreateFlow = () => {
    if (createMode === 'edit' && selectedSolicitud) {
      setViewMode('profile');
      setCreateError('');
      setCreateSuccess('');
      setCreateStep(1);
      return;
    }

    handleBackToList();
  };

  const handleContactoFieldChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({
      ...current,
      contacto: { ...current.contacto, [name]: value },
    }));
    setCreateError('');
    setCreateSuccess('');
  };

  const handleAplicanteFieldChange = (index, event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({
      ...current,
      aplicantes: current.aplicantes.map((aplicante, aplicanteIndex) =>
        aplicanteIndex === index
          ? (() => {
              const updatedAplicante = { ...aplicante, [name]: value };

              if (name === 'id_tipo_tramite') {
                const selectedTipo = findTipoTramiteById(tipoTramites, value);
                const shouldClearAdditional =
                  !selectedTipo ||
                  !isPasaporteTramite(selectedTipo) ||
                  String(updatedAplicante.id_tipo_tramite_adicional) === String(value);

                if (shouldClearAdditional) {
                  updatedAplicante.id_tipo_tramite_adicional = '';
                }
              }

              if (
                name === 'id_tipo_tramite_adicional' &&
                String(value) === String(updatedAplicante.id_tipo_tramite)
              ) {
                updatedAplicante.id_tipo_tramite_adicional = '';
              }

              return updatedAplicante;
            })()
          : aplicante
      ),
    }));
    setCreateError('');
    setCreateSuccess('');
  };

  const handleDiscountChange = (index, applies, reason = null, checked = false) => {
    setCreateForm((current) => ({
      ...current,
      aplicantes: current.aplicantes.map((aplicante, aplicanteIndex) => {
        if (aplicanteIndex !== index) return aplicante;
        if (!applies) return { ...aplicante, aplica_descuento: false, motivos_descuento: [] };
        const currentReasons = Array.isArray(aplicante.motivos_descuento) ? aplicante.motivos_descuento : [];
        const motivos_descuento = reason
          ? (checked ? [...new Set([...currentReasons, reason])] : currentReasons.filter((item) => item !== reason))
          : currentReasons;
        return { ...aplicante, aplica_descuento: true, motivos_descuento };
      }),
    }));
    setCreateError('');
  };

  const handleAddAplicante = () => {
    setCreateForm((current) => ({
      ...current,
      aplicantes: [...current.aplicantes, getEmptyAplicanteForm()],
    }));
    setCreateStep(2);
  };

  const handleRemoveAplicante = (index) => {
    setCreateForm((current) => ({
      ...current,
      aplicantes: current.aplicantes.filter((_, aplicanteIndex) => aplicanteIndex !== index),
    }));
  };

  const validateCreateStep = (step) => {
    if (step === 1) {
      if (createMode === 'create' && !createForm.contacto.nombre.trim()) {
        setCreateError('El nombre del contacto es obligatorio.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (createForm.aplicantes.length === 0) {
        setCreateError('Agrega al menos un aplicante.');
        return false;
      }
      if (createForm.aplicantes.some((aplicante) => !aplicante.nombre.trim())) {
        setCreateError('Cada aplicante debe tener nombre.');
        return false;
      }
      if (createMode === 'create' && createForm.aplicantes.some((aplicante) =>
        getAplicanteTramites(aplicante, tipoTramites).some((tramite) => !tramite.id_tipo_tramite)
      )) {
        setCreateError('Selecciona un tipo de trÃ¡mite para cada trÃ¡mite del aplicante.');
        return false;
      }
      if (createMode === 'create' && createForm.aplicantes.some((aplicante) => !aplicante.canal_contacto)) {
        setCreateError('Selecciona un canal de contacto para cada aplicante.');
        return false;
      }
      if (createForm.aplicantes.some((aplicante) => aplicante.aplica_descuento && (!Array.isArray(aplicante.motivos_descuento) || aplicante.motivos_descuento.length === 0))) {
        setCreateError('Selecciona al menos un motivo cuando el aplicante tiene descuento.');
        return false;
      }
      const hasInvalidAma = createForm.aplicantes.some((aplicante) => {
        return getAplicanteTramites(aplicante, tipoTramites).some((tramite) => {
          const selectedTipo = findTipoTramiteById(tipoTramites, tramite.id_tipo_tramite);
          return selectedTipo && !canSelectTramite(aplicante, selectedTipo);
        });
      });
      if (hasInvalidAma) {
        setCreateError('Este aplicante no cumple la edad mÃ­nima para trÃ¡mites AMA. Puede seleccionar otro tipo de trÃ¡mite.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextCreateStep = () => {
    setCreateError('');
    if (!validateCreateStep(createStep)) return;
    setCreateStep((step) => Math.min(3, step + 1));
  };

  const handlePreviousCreateStep = () => {
    setCreateError('');
    setCreateStep((step) => Math.max(1, step - 1));
  };

  const handleOpenCreatedSolicitud = async () => {
    const firstSolicitud = createForm.resumen?.solicitudes?.[0];
    if (firstSolicitud?.id_solicitud) {
      await handleOpenSolicitud(firstSolicitud);
    }
  };

  const handleOpenCreatePerfil = async () => {
    if (!selectedSolicitud?.id_solicitud) return;

    setPerfilModalMessage('');
    setPerfilMessage('');
    setPerfilSelectedVersion(null);

    if (!hasValue(selectedSolicitud.id_tipo_tramite) || !hasValue(selectedSolicitud.id_pais)) {
      setPerfilMessage('No hay datos suficientes para resolver la plantilla del perfil.');
      return;
    }

    setPerfilLoading(true);
    try {
      const plantilla = await resolverPerfilPlantilla({
        id_tipo_tramite: selectedSolicitud.id_tipo_tramite,
        id_pais: selectedSolicitud.id_pais,
      });

      if (!plantilla?.id_plantilla) {
        setPerfilMessage('No hay plantilla configurada para este trÃ¡mite y paÃ­s.');
        return;
      }

    setPerfilPlantilla(plantilla);
    setPerfilFormValues(buildPerfilFormValues(plantilla.estructura_json, {}));
      setPerfilRepeaters({});
      setPerfilValidationErrors([]);
      setPerfilActiveSectionIndex(0);
      setPerfilModalMode('create');
    } catch (requestError) {
      setPerfilMessage(getFriendlyPerfilError(requestError));
    } finally {
      setPerfilLoading(false);
    }
  };

  const handleOpenViewPerfil = () => {
    if (!perfilSolicitud || Number(perfilSolicitud.id_solicitud) !== Number(selectedSolicitud?.id_solicitud)) return;
    setPerfilPlantilla({
      id_plantilla: perfilSolicitud.id_plantilla,
      estructura_json: perfilSolicitud.estructura_json,
      nombre: perfilSolicitud.plantilla_nombre,
    });
    setPerfilFormValues(perfilSolicitud.respuestas_json || {});
    setPerfilRepeaters(perfilSolicitud.repeaters || {});
    setPerfilValidationErrors([]);
    setPerfilModalMessage('');
    setPerfilSelectedVersion(null);
    setPerfilActiveSectionIndex(0);
    setPerfilModalMode('view');
  };

  const handleOpenEditPerfil = () => {
    if (!perfilSolicitud || Number(perfilSolicitud.id_solicitud) !== Number(selectedSolicitud?.id_solicitud)) return;
    const estructuraJson = getPerfilTemplateJson(perfilSolicitud);
    setPerfilPlantilla({
      id_plantilla: perfilSolicitud.id_plantilla,
      estructura_json: estructuraJson,
      nombre: perfilSolicitud.plantilla_nombre,
    });
    setPerfilFormValues(buildPerfilFormValues(estructuraJson, perfilSolicitud.respuestas_json));
    setPerfilRepeaters(perfilSolicitud.repeaters || {});
    setPerfilValidationErrors([]);
    setPerfilModalMessage('');
    setPerfilSelectedVersion(null);
    setPerfilActiveSectionIndex(0);
    setPerfilModalMode('edit');
  };

  const autoPerfilRef = useRef(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('perfil');
    const key = String(selectedSolicitud?.id_solicitud) + ':' + mode;
    if (!['ver', 'editar'].includes(mode) || !perfilSolicitud || perfilLoading ||
        Number(params.get('id_solicitud')) !== Number(perfilSolicitud.id_solicitud) || autoPerfilRef.current === key) return;
    autoPerfilRef.current = key;
    if (mode === 'editar') handleOpenEditPerfil(); else handleOpenViewPerfil();
    // The URL action runs once after the requested profile finishes loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, selectedSolicitud?.id_solicitud, perfilSolicitud, perfilLoading]);

  const handleOpenPerfilVersiones = async () => {
    if (!perfilSolicitud?.id_perfil) return;
    setPerfilModalMessage('');
    setPerfilVersiones([]);
    setPerfilSelectedVersion(null);
    setPerfilPdfActionByVersion({});
    setPerfilPlantilla({
      id_plantilla: perfilSolicitud.id_plantilla,
      estructura_json: getPerfilTemplateJson(perfilSolicitud),
      nombre: perfilSolicitud.plantilla_nombre,
    });
    setPerfilVersionesLoading(true);
    setPerfilModalMode('versions');

    try {
      const versiones = await getPerfilVersiones(perfilSolicitud.id_perfil);
      setPerfilVersiones(versiones);
    } catch (requestError) {
      setPerfilModalMessage(getFriendlyPerfilError(requestError));
    } finally {
      setPerfilVersionesLoading(false);
    }
  };

  const handleClosePerfilModal = () => {
    setPerfilModalMode(null);
    setPerfilPlantilla(null);
    setPerfilFormValues({});
    setPerfilRepeaters({});
    setPerfilValidationErrors([]);
    setPerfilModalMessage('');
    setPerfilVersiones([]);
    setPerfilVersionesLoading(false);
    setPerfilSelectedVersion(null);
    setPerfilPdfActionByVersion({});
    setPerfilActiveSectionIndex(0);
  };

  const setPerfilPdfAction = (idVersion, action) => {
    setPerfilPdfActionByVersion((current) => ({
      ...current,
      [idVersion]: action,
    }));
  };

  const clearPerfilPdfAction = (idVersion) => {
    setPerfilPdfActionByVersion((current) => {
      const next = { ...current };
      delete next[idVersion];
      return next;
    });
  };

  const updatePerfilVersionPdfState = (idVersion, result) => {
    const documento = result?.documento || {};
    setPerfilVersiones((current) =>
      current.map((item) =>
        item.id_version === idVersion
          ? {
            ...item,
            id_documento_pdf: documento.id_documento || item.id_documento_pdf,
            pdf_drive_file_id: documento.drive_file_id || result?.pdf_drive_file_id || item.pdf_drive_file_id,
            pdf_generado_en: result?.pdf_generado_en || item.pdf_generado_en,
            pdf_nombre_archivo: result?.pdf_nombre_archivo || documento.nombre || item.pdf_nombre_archivo,
          }
          : item
      )
    );
  };

  const handleGenerarPdfVersion = async (version) => {
    if (!version?.id_version) return;
    const idVersion = version.id_version;
    setPerfilModalMessage('');
    setPerfilPdfAction(idVersion, 'generating');

    try {
      const result = await generarPdfPerfilVersion(idVersion);
      if (!result?.ok) throw new Error('PDF generation failed');
      updatePerfilVersionPdfState(idVersion, result);
      if (selectedSolicitud?.id_solicitud) await loadResumenAvanceSolicitud(selectedSolicitud.id_solicitud);
      setPerfilModalMessage('PDF generado correctamente.');
    } catch (requestError) {
      setPerfilModalMessage('No se pudo generar el PDF de esta versiÃ³n.');
    } finally {
      clearPerfilPdfAction(idVersion);
    }
  };

  const handleRegenerarPdfVersion = async (version) => {
    if (!version?.id_version) return;
    const shouldContinue = window.confirm(
      'Esto actualizarÃ¡ el PDF existente con la informaciÃ³n actual de esta versiÃ³n. Â¿Deseas continuar?'
    );
    if (!shouldContinue) return;

    const idVersion = version.id_version;
    setPerfilModalMessage('');
    setPerfilPdfAction(idVersion, 'regenerating');

    try {
      const result = await generarPdfPerfilVersion(idVersion, { force: true });
      if (!result?.ok) throw new Error('PDF regeneration failed');
      updatePerfilVersionPdfState(idVersion, result);
      if (selectedSolicitud?.id_solicitud) await loadResumenAvanceSolicitud(selectedSolicitud.id_solicitud);
      setPerfilModalMessage('PDF regenerado correctamente.');
    } catch (requestError) {
      setPerfilModalMessage('No se pudo regenerar el PDF.');
    } finally {
      clearPerfilPdfAction(idVersion);
    }
  };

  const handleDescargarPdfVersion = async (version) => {
    if (!version?.id_documento_pdf) return;
    const idVersion = version.id_version;
    setPerfilModalMessage('');
    setPerfilPdfAction(idVersion, 'downloading');

    try {
      const blob = await descargarDocumentoPerfilPdf(version.id_documento_pdf);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getPerfilPdfFilename(version);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setPerfilModalMessage('PDF descargado correctamente.');
    } catch (requestError) {
      setPerfilModalMessage('No se pudo descargar el PDF.');
    } finally {
      clearPerfilPdfAction(idVersion);
    }
  };

  const handleOpenPerfilVersionDetail = (version) => {
    const estructuraJson = getPerfilTemplateJson(perfilSolicitud, perfilPlantilla);
    setPerfilSelectedVersion(version);
    setPerfilPlantilla({
      id_plantilla: perfilSolicitud?.id_plantilla,
      estructura_json: estructuraJson,
      nombre: perfilSolicitud?.plantilla_nombre,
    });
    setPerfilFormValues(version?.respuestas_json || {});
    setPerfilRepeaters(version?.repetibles_snapshot_json || {});
    setPerfilValidationErrors([]);
    setPerfilModalMessage('');
    setPerfilModalMode('version-view');
  };

  const handlePerfilFieldChange = (fieldName, value) => {
    setPerfilFormValues((current) => ({ ...current, [fieldName]: value }));
    setPerfilModalMessage('');
  };

  const handleSavePerfil = async (event) => {
    event.preventDefault();
    if (!selectedSolicitud?.id_solicitud || !perfilModalMode) return;

    setPerfilSaving(true);
    setPerfilModalMessage('');

    try {
      if (perfilModalMode === 'create') {
        await createPerfilSolicitud(selectedSolicitud.id_solicitud, {
          id_plantilla: perfilPlantilla.id_plantilla,
          respuestas_json: perfilFormValues,
          creado_por: null,
        });
      } else if (perfilModalMode === 'edit' && perfilSolicitud?.id_perfil) {
        await updatePerfil(perfilSolicitud.id_perfil, {
          respuestas_json: perfilFormValues,
          motivo_cambio: 'ActualizaciÃ³n desde frontend',
          actualizado_por: null,
        });
      }

      await loadPerfilSolicitud(selectedSolicitud.id_solicitud);
      await loadResumenAvanceSolicitud(selectedSolicitud.id_solicitud);
      window.dispatchEvent(new Event('ama-actividad-actualizada'));
      setPerfilMessage('Perfil guardado correctamente.');
      handleClosePerfilModal();
    } catch (requestError) {
      setPerfilModalMessage(getFriendlyPerfilError(requestError));
    } finally {
      setPerfilSaving(false);
    }
  };

  const handleSavePerfilTabbed = async (event, options = {}) => {
    if (event?.preventDefault) event.preventDefault();
    if (!selectedSolicitud?.id_solicitud || !perfilModalMode) return;

    const { closeAfterSave = true, motivoCambio = 'Guardado completo del perfil', estado = 'borrador' } = options;
    setPerfilSaving(true);
    setPerfilModalMessage('');

    try {
      const currentPerfilId = perfilSolicitud?.id_perfil;

      if (perfilModalMode === 'create' && !currentPerfilId) {
        const nuevoPerfil = await createPerfilSolicitud(selectedSolicitud.id_solicitud, {
          id_plantilla: perfilPlantilla.id_plantilla,
          respuestas_json: perfilFormValues,
          repeaters: perfilRepeaters,
          estado,
          creado_por: getCurrentEmployeeId(),
        });
        if (nuevoPerfil?.id_perfil) {
          setPerfilSolicitud(nuevoPerfil);
          setPerfilModalMode('edit');
        }
      } else if ((perfilModalMode === 'edit' || currentPerfilId) && currentPerfilId) {
        const perfilActualizado = await updatePerfil(currentPerfilId, {
          respuestas_json: perfilFormValues,
          repeaters: perfilRepeaters,
          estado,
          motivo_cambio: motivoCambio,
          actualizado_por: getCurrentEmployeeId(),
        });
        if (perfilActualizado?.id_perfil) setPerfilSolicitud(perfilActualizado);
      }

      const perfilRecargado = await loadPerfilSolicitud(selectedSolicitud.id_solicitud);
      if (perfilRecargado?.id_perfil) setPerfilSolicitud(perfilRecargado);
      await loadResumenAvanceSolicitud(selectedSolicitud.id_solicitud);

      if (closeAfterSave) {
        window.dispatchEvent(new Event('ama-actividad-actualizada'));
      setPerfilMessage('Perfil guardado correctamente.');
        handleClosePerfilModal();
      } else {
        setPerfilModalMode('edit');
        setPerfilModalMessage('Avance guardado correctamente.');
      }
    } catch (requestError) {
      const errors = requestError?.response?.data?.error?.details?.errors;
      setPerfilValidationErrors(Array.isArray(errors) ? errors : []);
      setPerfilModalMessage(getFriendlyPerfilError(requestError));
    } finally {
      setPerfilSaving(false);
    }
  };

  const handleSaveResponsable = async () => {
    if (!selectedSolicitud?.id_solicitud) return;

    setResponsableSaving(true);
    setResponsableMessage('');

    try {
      const response = await updateSolicitudResponsable(selectedSolicitud.id_solicitud, {
        id_empleado_responsable: responsableValue ? Number(responsableValue) : null,
        descripcion: responsableValue
          ? 'Se asigno asesor responsable al tramite'
          : 'Se quito asesor responsable del tramite',
        origen: 'asesor_asignado',
      });
      const solicitudActualizada = response?.solicitud || response;
      if (solicitudActualizada?.id_solicitud) {
        setSelectedSolicitud((current) => ({ ...current, ...solicitudActualizada }));
        setSolicitudes((current) =>
          current.map((solicitud) =>
            solicitud.id_solicitud === solicitudActualizada.id_solicitud
              ? { ...solicitud, ...solicitudActualizada }
              : solicitud
          )
        );
      }
      const freshDetail = await getSolicitudById(selectedSolicitud.id_solicitud);
      if (freshDetail) {
        setSelectedSolicitud((current) => ({ ...current, ...freshDetail }));
        setSolicitudes((current) =>
          current.map((solicitud) =>
            solicitud.id_solicitud === freshDetail.id_solicitud ? { ...solicitud, ...freshDetail } : solicitud
          )
        );
      }
      const freshSeguimientos = await getSeguimientosBySolicitud(selectedSolicitud.id_solicitud);
      setSeguimientos(freshSeguimientos);
      setResponsableEditorOpen(false);
    } catch (requestError) {
      setResponsableMessage(getApiErrorMessage(requestError, 'No fue posible guardar el responsable.'));
    } finally {
      setResponsableSaving(false);
    }
  };

  const loadEstadosOperativos = async () => {
    if (!selectedSolicitud?.id_solicitud) return [];

    setEstadosOperativosLoading(true);
    setSeguimientoOperativoMessage('');
    try {
      const response = await getEstadosDisponiblesSolicitud(selectedSolicitud.id_solicitud);
      const estados = Array.isArray(response?.estados) ? response.estados : [];
      setEstadosOperativos(estados);
      return estados;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'No fue posible cargar los estados disponibles.');
      setSeguimientoOperativoMessage(message);
      setEstadosOperativos([]);
      return [];
    } finally {
      setEstadosOperativosLoading(false);
    }
  };

  const handleOpenSeguimientoOperativo = async () => {
    setSeguimientoOperativoOpen(true);
    setSeguimientoOperativoForm({
      estado_nuevo: '',
      descripcion: '',
      fecha_proximo_contacto: selectedSolicitud?.fecha_proximo_contacto
        ? String(selectedSolicitud.fecha_proximo_contacto).slice(0, 10)
        : '',
    });
    await loadEstadosOperativos();
  };

  const handleSaveSeguimientoOperativo = async () => {
    if (!selectedSolicitud?.id_solicitud) return;

    setSeguimientoOperativoSaving(true);
    setSeguimientoOperativoMessage('');
    try {
      const response = await createSeguimientoOperativo(selectedSolicitud.id_solicitud, {
        estado_nuevo: seguimientoOperativoForm.estado_nuevo
          ? Number(seguimientoOperativoForm.estado_nuevo)
          : null,
        descripcion: seguimientoOperativoForm.descripcion,
        id_empleado: selectedSolicitud.id_empleado_responsable || null,
        fecha_proximo_contacto: seguimientoOperativoForm.fecha_proximo_contacto || null,
      });

      const solicitudActualizada = response?.solicitud;
      if (solicitudActualizada?.id_solicitud) {
        setSelectedSolicitud((current) => ({ ...current, ...solicitudActualizada }));
        setSolicitudes((current) =>
          current.map((solicitud) =>
            solicitud.id_solicitud === solicitudActualizada.id_solicitud
              ? { ...solicitud, ...solicitudActualizada }
              : solicitud
          )
        );
      }

      const freshDetail = await getSolicitudById(selectedSolicitud.id_solicitud);
      if (freshDetail) {
        setSelectedSolicitud((current) => ({ ...current, ...freshDetail }));
        setSolicitudes((current) =>
          current.map((solicitud) =>
            solicitud.id_solicitud === freshDetail.id_solicitud ? { ...solicitud, ...freshDetail } : solicitud
          )
        );
      }
      const freshSeguimientos = await getSeguimientosBySolicitud(selectedSolicitud.id_solicitud);
      setSeguimientos(freshSeguimientos);
      await loadResumenAvanceSolicitud(selectedSolicitud.id_solicitud);
      setSeguimientoOperativoOpen(false);
      setSeguimientoOperativoMessage('Seguimiento operativo guardado correctamente.');
    } catch (requestError) {
      setSeguimientoOperativoMessage(getApiErrorMessage(requestError, 'No fue posible guardar el seguimiento operativo.'));
    } finally {
      setSeguimientoOperativoSaving(false);
    }
  };

  const handleCreateFlowSubmit = async (event) => {
    event.preventDefault();

    if (!validateCreateStep(1) || !validateCreateStep(2)) return;

    setCreateSaving(true);
    setCreateError('');

    const tramitesPorAplicante = createForm.aplicantes.map((aplicante) =>
      getAplicanteTramites(aplicante, tipoTramites)
    );
    const totalSolicitudesAcrear = tramitesPorAplicante.reduce(
      (total, tramites) => total + tramites.length,
      0
    );

    setCreateSuccess(`Creando contacto, aplicantes y ${totalSolicitudesAcrear} solicitud(es)...`);
    console.info('[SolicitudesNuevoPage] Solicitudes a crear por aplicante:', tramitesPorAplicante.map((tramites, index) => ({
      aplicante: index + 1,
      tramites: tramites.map((tramite, tramiteIndex) => ({
        posicion: getTramitePositionLabel(tramiteIndex),
        id_tipo_tramite: tramite.id_tipo_tramite,
        canal_contacto: tramite.canal_contacto || null,
      })),
    })));

    try {
      const sourceId = `FRONTEND_NUEVO_${Date.now()}`;
      const contactoResponse = await api.post('/contactos', cleanPayload({
        ...createForm.contacto,
        source_id: `${sourceId}_CONTACTO`,
      }));
      const contacto = contactoResponse.data;

      if (!contacto?.id_contacto) {
        throw new Error('El backend no devolviÃ³ el id_contacto creado.');
      }

      const aplicantesCreados = [];
      const solicitudesCreadas = [];

      for (const [index, aplicanteForm] of createForm.aplicantes.entries()) {
        const aplicanteResponse = await api.post(
          `/contactos/${contacto.id_contacto}/aplicantes`,
          cleanPayload({
            nombre: aplicanteForm.nombre,
            apellido_paterno: aplicanteForm.apellido_paterno,
            apellido_materno: aplicanteForm.apellido_materno,
            telefono: aplicanteForm.telefono,
            correo: aplicanteForm.correo,
            fecha_nacimiento: aplicanteForm.fecha_nacimiento,
            id_pais: Number(aplicanteForm.id_pais || 1),
            estado: aplicanteForm.estado,
            ciudad: aplicanteForm.ciudad,
            direccion: aplicanteForm.direccion,
            notas_generales: aplicanteForm.notas_generales,
            source_id: `${sourceId}_APLICANTE_${index + 1}`,
          })
        );
        const aplicante = aplicanteResponse.data;

        if (!aplicante?.id_cliente) {
          throw new Error('El backend no devolviÃ³ el id_cliente creado.');
        }

        aplicantesCreados.push(aplicante);

        const tramitesAplicante = tramitesPorAplicante[index] || getAplicanteTramites(aplicanteForm, tipoTramites);
        let solicitudOrigenId = null;

        for (const [tramiteIndex, tramiteForm] of tramitesAplicante.entries()) {
          const tramiteLabel = getTramitePositionLabel(tramiteIndex);

          try {
            const solicitudPayload = cleanPayload({
              id_tipo_tramite: Number(tramiteForm.id_tipo_tramite),
              id_empleado_responsable: null,
              estado_actual: 102,
              fecha_inicio: tramiteForm.fecha_inicio || getTodayInputValue(),
              canal_contacto: tramiteForm.canal_contacto,
              aplica_descuento: Boolean(aplicanteForm.aplica_descuento),
              motivos_descuento: aplicanteForm.aplica_descuento ? aplicanteForm.motivos_descuento : [],
              origen_registro: 'frontend_nuevo',
              observaciones: tramiteForm.tipo_registro === 'adicional'
                ? `${tramiteForm.observaciones || 'Solicitud creada desde informes'} | TrÃ¡mite adicional`
                : (tramiteForm.observaciones || 'Solicitud creada desde informes'),
              source_id: `${sourceId}_SOLICITUD_${index + 1}_${tramiteIndex + 1}`,
              id_solicitud_origen: tramiteForm.tipo_registro === 'adicional' ? solicitudOrigenId : null,
            });

            console.info('[SolicitudesNuevoPage] Creando solicitud', {
              aplicante: index + 1,
              id_cliente: aplicante.id_cliente,
              tramite: tramiteLabel,
              id_tipo_tramite: solicitudPayload.id_tipo_tramite,
              canal_contacto: solicitudPayload.canal_contacto || null,
            });

            const solicitudResponse = await api.post(
              `/clientes/${aplicante.id_cliente}/solicitudes`,
              solicitudPayload
            );
            const idSolicitud = solicitudResponse.data?.id_solicitud;
            if (idSolicitud && !solicitudOrigenId) solicitudOrigenId = idSolicitud;

            if (!idSolicitud) {
              throw new Error('El backend no devolviÃ³ el id_solicitud creado.');
            }

            await api.patch(`/solicitudes/${idSolicitud}/mover-area`, {
              area_destino: 'PAGOS',
              descripcion: 'Solicitud creada desde informes y enviada a finanzas para pago inicial',
              id_empleado_responsable: null,
              origen: 'enviado_a_finanzas',
            });

            const detailResponse = await api.get(`/solicitudes/${idSolicitud}`);
            solicitudesCreadas.push(detailResponse.data);
          } catch (solicitudError) {
            throw new Error(
              `FallÃ³ ${tramiteLabel} del aplicante ${index + 1}: ${getApiErrorMessage(
                solicitudError,
                'No fue posible crear la solicitud.'
              )}`
            );
          }
        }
      }

      let quickbooks = {
        status: 'pending',
        customer_id: null,
        message: 'SincronizaciÃƒÂ³n con QuickBooks pendiente.',
      };
      try {
        const authToken = localStorage.getItem('authToken');
        const quickbooksResponse = await api.post(
          `/integraciones/quickbooks/contactos/${contacto.id_contacto}/sincronizar`,
          {},
          authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined
        );
        quickbooks = quickbooksResponse.data?.quickbooks || quickbooks;
      } catch {
        quickbooks = {
          status: 'error',
          customer_id: null,
          message: 'El informe se guardÃ³, pero no fue posible sincronizar QuickBooks.',
        };
      }

      setCreateForm((current) => ({
        ...current,
        resumen: {
          contacto,
          aplicantes: aplicantesCreados,
          solicitudes: solicitudesCreadas,
          quickbooks,
        },
      }));
      setSolicitudes((current) => [...solicitudesCreadas, ...current]);
      setExactSolicitud(null);
      setSearch('');
      setCurrentPage(1);
      setCreateStep(3);
      setCreateSuccess('Contacto registrado correctamente y solicitud enviada a Finanzas / Pagos.');
    } catch (requestError) {
      setCreateError(getApiErrorMessage(requestError, 'No fue posible completar el flujo de nueva solicitud.'));
      setCreateSuccess('');
    } finally {
      setCreateSaving(false);
    }
  };

  const normalizePatchValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value).trim();
  };

  const setPayloadValueIfChanged = (payload, field, nextValue, currentValue, { numeric = false } = {}) => {
    const normalizedNext = normalizePatchValue(nextValue);
    const normalizedCurrent = normalizePatchValue(currentValue);

    if (normalizedNext === normalizedCurrent) return;

    if (numeric) {
      payload[field] = normalizedNext ? Number(normalizedNext) : null;
      return;
    }

    payload[field] = normalizedNext || null;
  };

  const handleUpdateExpedienteSubmit = async () => {
    if (!selectedSolicitud?.id_solicitud) return;
    const aplicanteForm = createForm.aplicantes[0] || {};
    const idContacto = selectedSolicitud.id_contacto;
    const idCliente = getClientId(selectedSolicitud);
    const idSolicitud = selectedSolicitud.id_solicitud;

    const contactoPayload = {};
    if (idContacto) {
      setPayloadValueIfChanged(contactoPayload, 'nombre', createForm.contacto.nombre, selectedSolicitud.contacto_nombre);
      setPayloadValueIfChanged(contactoPayload, 'telefono', createForm.contacto.telefono, selectedSolicitud.contacto_telefono);
      setPayloadValueIfChanged(contactoPayload, 'telefono_emergencia', createForm.contacto.telefono_emergencia, selectedSolicitud.contacto_telefono_emergencia || selectedSolicitud.telefono_emergencia);
      setPayloadValueIfChanged(contactoPayload, 'correo', createForm.contacto.correo, selectedSolicitud.contacto_correo);
    }

    const clientePayload = {};
    if (idCliente) {
      setPayloadValueIfChanged(clientePayload, 'nombre', aplicanteForm.nombre, selectedSolicitud.cliente_nombre);
      setPayloadValueIfChanged(clientePayload, 'apellido_paterno', aplicanteForm.apellido_paterno, selectedSolicitud.cliente_apellido_paterno);
      setPayloadValueIfChanged(clientePayload, 'apellido_materno', aplicanteForm.apellido_materno, selectedSolicitud.cliente_apellido_materno);
      setPayloadValueIfChanged(clientePayload, 'telefono', aplicanteForm.telefono, selectedSolicitud.cliente_telefono);
      setPayloadValueIfChanged(clientePayload, 'correo', aplicanteForm.correo, selectedSolicitud.cliente_correo);
      setPayloadValueIfChanged(clientePayload, 'fecha_nacimiento', aplicanteForm.fecha_nacimiento, selectedSolicitud.fecha_nacimiento || selectedSolicitud.cliente_fecha_nacimiento);
      setPayloadValueIfChanged(clientePayload, 'id_pais', aplicanteForm.id_pais, selectedSolicitud.id_pais, { numeric: true });
      setPayloadValueIfChanged(clientePayload, 'estado', aplicanteForm.estado, selectedSolicitud.cliente_estado || selectedSolicitud.estado);
      setPayloadValueIfChanged(clientePayload, 'ciudad', aplicanteForm.ciudad, selectedSolicitud.cliente_ciudad || selectedSolicitud.ciudad);
      setPayloadValueIfChanged(clientePayload, 'direccion', aplicanteForm.direccion, selectedSolicitud.cliente_direccion || selectedSolicitud.direccion);
      setPayloadValueIfChanged(clientePayload, 'notas_generales', aplicanteForm.notas_generales, selectedSolicitud.cliente_notas_generales || selectedSolicitud.notas_generales);
    }

    const solicitudPayload = {};
    setPayloadValueIfChanged(solicitudPayload, 'id_tipo_tramite', aplicanteForm.id_tipo_tramite, selectedSolicitud.id_tipo_tramite, { numeric: true });
    setPayloadValueIfChanged(solicitudPayload, 'estado_actual', aplicanteForm.estado_actual, selectedSolicitud.estado_actual, { numeric: true });
    setPayloadValueIfChanged(solicitudPayload, 'id_area_actual', aplicanteForm.id_area_actual, selectedSolicitud.id_area_actual, { numeric: true });
    setPayloadValueIfChanged(solicitudPayload, 'id_empleado_responsable', aplicanteForm.id_empleado_responsable, selectedSolicitud.id_empleado_responsable, { numeric: true });
    setPayloadValueIfChanged(solicitudPayload, 'canal_contacto', aplicanteForm.canal_contacto, selectedSolicitud.canal_contacto);
    setPayloadValueIfChanged(solicitudPayload, 'observaciones', aplicanteForm.observaciones, selectedSolicitud.observaciones);
    setPayloadValueIfChanged(solicitudPayload, 'fecha_proximo_contacto', aplicanteForm.fecha_proximo_contacto, selectedSolicitud.fecha_proximo_contacto);
    setPayloadValueIfChanged(solicitudPayload, 'fecha_primera_aplicacion', aplicanteForm.fecha_primera_aplicacion, selectedSolicitud.fecha_primera_aplicacion);
    setPayloadValueIfChanged(solicitudPayload, 'resultado', aplicanteForm.resultado, selectedSolicitud.resultado);
    setPayloadValueIfChanged(solicitudPayload, 'fecha_cierre', aplicanteForm.fecha_cierre, selectedSolicitud.fecha_cierre);
    const previousReasons = Array.isArray(selectedSolicitud.motivos_descuento) ? selectedSolicitud.motivos_descuento : [];
    const nextReasons = aplicanteForm.aplica_descuento ? aplicanteForm.motivos_descuento : [];
    if (Boolean(aplicanteForm.aplica_descuento) !== Boolean(selectedSolicitud.aplica_descuento) || JSON.stringify([...nextReasons].sort()) !== JSON.stringify([...previousReasons].sort())) {
      solicitudPayload.aplica_descuento = Boolean(aplicanteForm.aplica_descuento);
      solicitudPayload.motivos_descuento = nextReasons;
    }

    if (Object.prototype.hasOwnProperty.call(solicitudPayload, 'estado_actual')) {
      solicitudPayload.descripcion = 'Estado actualizado desde ediciÃ³n de expediente';
      solicitudPayload.origen = 'edicion_expediente';
    }

    if (
      Object.keys(contactoPayload).length === 0 &&
      Object.keys(clientePayload).length === 0 &&
      Object.keys(solicitudPayload).length === 0
    ) {
      setCreateSuccess('No hay cambios por guardar.');
      return;
    }

    setCreateSaving(true);
    setCreateError('');
    setCreateSuccess('Guardando expediente...');

    try {
      if (idContacto && Object.keys(contactoPayload).length > 0) {
        await updateContacto(idContacto, contactoPayload);
      }
      if (idCliente && Object.keys(clientePayload).length > 0) {
        await updateCliente(idCliente, clientePayload);
      }
      if (Object.keys(solicitudPayload).length > 0) {
        await updateSolicitud(idSolicitud, solicitudPayload);
      }

      const freshDetail = await getSolicitudById(idSolicitud);
      if (freshDetail) {
        setSelectedSolicitud(freshDetail);
        setSolicitudes((current) =>
          current.map((solicitud) =>
            solicitud.id_solicitud === freshDetail.id_solicitud ? { ...solicitud, ...freshDetail } : solicitud
          )
        );
      }

      const freshSeguimientos = await getSeguimientosBySolicitud(idSolicitud);
      setSeguimientos(freshSeguimientos);
      setCreateSuccess('Expediente actualizado correctamente.');
      setViewMode('profile');
      setCreateStep(1);
    } catch (requestError) {
      setCreateError(getApiErrorMessage(requestError, 'No fue posible guardar el expediente.'));
      setCreateSuccess('');
    } finally {
      setCreateSaving(false);
    }
  };

  const handleExpedienteFormSubmit = async (event) => {
    if (createMode === 'edit') {
      event.preventDefault();
      if (!validateCreateStep(1) || !validateCreateStep(2)) return;
      await handleUpdateExpedienteSubmit();
      return;
    }

    await handleCreateFlowSubmit(event);
  };

  const handleCreateFieldChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
    setCreateError('');
    setCreateSuccess('');
  };

  // eslint-disable-next-line no-unused-vars
  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const nombre = createForm.nombre.trim();
    const idTipoTramite = createForm.id_tipo_tramite;

    if (!nombre) {
      setCreateError('El nombre del aplicante es obligatorio.');
      return;
    }

    if (!idTipoTramite) {
      setCreateError('Selecciona un tipo de trÃ¡mite.');
      return;
    }

    setCreateSaving(true);
    setCreateError('');
    setCreateSuccess('Guardando aplicante y solicitud...');

    try {
      const sourceId = `FRONTEND_NUEVO_${Date.now()}`;
      const clientePayload = cleanPayload({
        nombre,
        apellido_paterno: createForm.apellido_paterno,
        apellido_materno: createForm.apellido_materno,
        telefono: createForm.telefono,
        correo: createForm.correo,
        fecha_nacimiento: createForm.fecha_nacimiento,
        estado: createForm.estado,
        ciudad: createForm.ciudad,
        direccion: createForm.direccion,
        notas_generales: createForm.notas_generales,
        source_id: sourceId,
      });

      const clienteResponse = await api.post('/clientes', clientePayload);
      const cliente = clienteResponse.data;

      if (!cliente?.id_cliente) {
        throw new Error('El backend no devolviÃ³ el id_cliente creado.');
      }

      const solicitudPayload = cleanPayload({
        id_cliente: cliente.id_cliente,
        id_tipo_tramite: Number(idTipoTramite),
        estado_actual: createForm.estado_actual ? Number(createForm.estado_actual) : null,
        fecha_inicio: createForm.fecha_inicio || getTodayInputValue(),
        origen_registro: 'frontend_nuevo',
        observaciones: createForm.observaciones,
        source_id: sourceId,
      });

      const solicitudResponse = await api.post('/solicitudes', solicitudPayload);
      const idSolicitud = solicitudResponse.data?.id_solicitud;

      if (!idSolicitud) {
        throw new Error('El backend no devolviÃ³ el id_solicitud creado.');
      }

      const detailResponse = await api.get(`/solicitudes/${idSolicitud}`);
      const solicitudCreada = detailResponse.data;

      setSolicitudes((current) => [solicitudCreada, ...current]);
      setExactSolicitud(null);
      setSearch('');
      setCurrentPage(1);
      setSelectedSolicitud(solicitudCreada);
      setDocumentos([]);
      setSeguimientos([]);
      setDetailMessage('Solicitud creada correctamente.');
      setDocumentsMessage('');
      setHistoryMessage('');
      setCreateSuccess('Solicitud creada correctamente.');
      setViewMode('profile');
    } catch (requestError) {
      setCreateError(getApiErrorMessage(requestError, 'No fue posible crear la solicitud.'));
      setCreateSuccess('');
    } finally {
      setCreateSaving(false);
    }
  };

  const renderPerfilFieldInput = (field) => {
    const value = perfilFormValues[field.name] ?? '';
    const commonProps = {
      id: `perfil-field-${field.name}`,
      name: field.name,
      value,
      required: Boolean(field.required),
      disabled: perfilSaving,
      onChange: (event) => handlePerfilFieldChange(field.name, event.target.value),
    };

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows="4" />;
    }

    if (field.type === 'select') {
      const options = Array.isArray(field.options) ? field.options : [];
      return (
        <select {...commonProps}>
          <option value="">Seleccione</option>
          {options.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            return (
              <option key={`${field.name}-${optionValue}`} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      );
    }

    return (
      <input
        {...commonProps}
        type={['date', 'number', 'text'].includes(field.type) ? field.type : 'text'}
      />
    );
  };

  const renderPerfilReadValue = (estructuraJson, fieldName, value) => (
    <div className="solicitudes-nuevo-perfil-read-field" key={fieldName}>
      <span>{getPerfilFieldLabel(estructuraJson, fieldName)}</span>
      <strong>{getValue(value)}</strong>
    </div>
  );

  const renderPerfilReadSections = (estructuraJson, respuestas = {}) => {
    const sections = getPerfilSections(estructuraJson);
    const renderedFieldNames = new Set();
    const visibleExtraEntries = Object.entries(respuestas || {}).filter(([key]) => !isTechnicalPerfilKey(key));

    if (sections.length === 0 && visibleExtraEntries.length === 0) {
      return <div className="solicitudes-nuevo-profile-empty">No hay respuestas registradas.</div>;
    }

    return (
      <div className="solicitudes-nuevo-perfil-read-sections">
        {sections.map((section, sectionIndex) => {
          const fields = (section.campos || []).filter((field) => field?.name && !isTechnicalPerfilKey(field.name));
          fields.forEach((field) => renderedFieldNames.add(field.name));

          return (
            <section className="solicitudes-nuevo-perfil-section" key={section.titulo || `perfil-read-section-${sectionIndex}`}>
              <h3>{section.titulo || `SecciÃ³n ${sectionIndex + 1}`}</h3>
              {fields.length === 0 ? (
                <div className="solicitudes-nuevo-profile-empty">Esta secciÃ³n no tiene campos configurados.</div>
              ) : (
                <div className="solicitudes-nuevo-perfil-read-grid">
                  {fields.map((field) => renderPerfilReadValue(estructuraJson, field.name, respuestas?.[field.name]))}
                </div>
              )}
            </section>
          );
        })}

        {visibleExtraEntries.some(([key]) => !renderedFieldNames.has(key)) && (
          <section className="solicitudes-nuevo-perfil-section">
            <h3>Otros datos</h3>
            <div className="solicitudes-nuevo-perfil-read-grid">
              {visibleExtraEntries
                .filter(([key]) => !renderedFieldNames.has(key))
                .map(([key, value]) => renderPerfilReadValue(estructuraJson, key, value))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const getDocumentosRequeridosPerfil = (estructuraJson = {}) => {
    const docs = estructuraJson?.documentos_requeridos;
    if (Array.isArray(docs)) return docs;
    if (Array.isArray(docs?.items)) return docs.items;
    return [];
  };

  const perfilSectionHasValues = (section = {}) =>
    (section.campos || [])
      .filter((field) => field?.name && !isTechnicalPerfilKey(field.name))
      .some((field) => hasValue(perfilFormValues[field.name]));

  const renderPerfilWorkspace = () => {
    if (!perfilModalMode || !selectedSolicitud) return null;

    const estructuraJson = getPerfilTemplateJson(perfilSolicitud, perfilPlantilla);
    const isV2 = Number(estructuraJson?.schema_version) === 2;
    const sections = getPerfilSections(estructuraJson);
    const documentosRequeridos = getDocumentosRequeridosPerfil(estructuraJson);
    const hasDocumentosTab = documentosRequeridos.length > 0;
    const totalPerfilTabs = sections.length + (hasDocumentosTab ? 1 : 0);
    const safeActiveSectionIndex = Math.min(perfilActiveSectionIndex, Math.max(totalPerfilTabs - 1, 0));
    const activeSection = sections[safeActiveSectionIndex];
    const activeSectionTitle = activeSection?.titulo || (hasDocumentosTab && safeActiveSectionIndex === sections.length ? 'Documentos requeridos' : 'SecciÃ³n');
    const isFormMode = perfilModalMode === 'create' || perfilModalMode === 'edit';
    const isVersionView = perfilModalMode === 'version-view';
    const workspaceTitle =
      perfilModalMode === 'create'
        ? 'Crear perfil'
        : perfilModalMode === 'edit'
          ? 'Editar perfil'
          : perfilModalMode === 'versions'
            ? 'Versiones del perfil'
            : isVersionView
              ? `VersiÃ³n ${getValue(perfilSelectedVersion?.version)}`
              : 'Perfil del aplicante';

    return (
      <main className="solicitudes-nuevo-perfil-workspace">
        <header className="solicitudes-nuevo-perfil-workspace-topbar">
          <button
            type="button"
            className="solicitudes-nuevo-profile-back"
            onClick={perfilModalMode === 'version-view' ? handleOpenPerfilVersiones : handleClosePerfilModal}
          >
            <FaArrowLeft />
            {perfilModalMode === 'version-view' ? 'Volver a versiones' : 'Volver al expediente'}
          </button>
          <button type="button" className="solicitudes-nuevo-perfil-pdf-button" disabled>
            <FaDownload /> PDF prÃ³ximamente
          </button>
        </header>

        <section className="solicitudes-nuevo-perfil-workspace-heading">
          <div>
            <span>Perfil dinÃ¡mico</span>
            <h1>{workspaceTitle}</h1>
            <p>
              Solicitud #{getValue(selectedSolicitud.id_solicitud)} Â· {getTipoTramite(selectedSolicitud)}
            </p>
          </div>
          <div className="solicitudes-nuevo-perfil-context-grid">
            <span><small>Aplicante</small>{buildClientName(selectedSolicitud)}</span>
            <span><small>TrÃ¡mite</small>{getTipoTramite(selectedSolicitud)}</span>
            <span><small>Estado del perfil</small>{getValue(perfilSolicitud?.estado || (perfilModalMode === 'create' ? 'borrador' : null))}</span>
            <span><small>VersiÃ³n actual</small>{getValue(perfilSolicitud?.version_actual)}</span>
          </div>
          {isV2 && (
            <div className="solicitudes-nuevo-perfil-context-grid" aria-label="InformaciÃ³n canÃ³nica precargada">
              <span><small>Fecha de nacimiento</small>{formatDate(selectedSolicitud.cliente_fecha_nacimiento)}</span>
              <span><small>TelÃ©fono</small>{getValue(selectedSolicitud.cliente_telefono)}</span>
              <span><small>Correo</small>{getValue(selectedSolicitud.cliente_correo)}</span>
              <span><small>PaÃ­s</small>{getValue(selectedSolicitud.pais_nombre)}</span>
              <span><small>Estado / ciudad</small>{[selectedSolicitud.cliente_estado, selectedSolicitud.cliente_ciudad].filter(hasValue).join(', ') || 'N/A'}</span>
              <span><small>Domicilio registrado</small>{getValue(selectedSolicitud.cliente_direccion)}</span>
            </div>
          )}
        </section>

        {isFormMode ? (
          <form className="solicitudes-nuevo-perfil-workspace-form" onSubmit={(event) => handleSavePerfilTabbed(event, {
            closeAfterSave: true,
            motivoCambio: isV2 ? 'Perfil marcado como completo' : 'Guardado completo del perfil',
            estado: isV2 ? 'completo' : 'borrador',
          })}>
            <div className="solicitudes-nuevo-perfil-form-surface">
              {isV2 ? (
                <ProfileFormRenderer
                  template={estructuraJson}
                  answers={perfilFormValues}
                  setAnswers={setPerfilFormValues}
                  repeaters={perfilRepeaters}
                  setRepeaters={setPerfilRepeaters}
                  errors={perfilValidationErrors}
                  disabled={perfilSaving}
                  completion={perfilSolicitud?.completitud_json}
                />
              ) : sections.length === 0 ? (
                <div className="solicitudes-nuevo-profile-empty">
                  La plantilla no tiene campos configurados.
                </div>
              ) : (
                <>
                  <div className="solicitudes-nuevo-perfil-tabs" role="tablist" aria-label="Secciones del perfil">
                    {sections.map((section, sectionIndex) => {
                      const sectionDone = perfilSectionHasValues(section);
                      const isActive = safeActiveSectionIndex === sectionIndex;
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          className={[
                            isActive ? 'solicitudes-nuevo-perfil-tab-active' : '',
                            sectionDone ? 'solicitudes-nuevo-perfil-tab-done' : 'solicitudes-nuevo-perfil-tab-pending',
                          ].filter(Boolean).join(' ')}
                          key={section.titulo || `perfil-tab-${sectionIndex}`}
                          onClick={() => setPerfilActiveSectionIndex(sectionIndex)}
                        >
                          <i>{sectionDone ? <FaCheck /> : null}</i>
                          <span>{section.titulo || `SecciÃ³n ${sectionIndex + 1}`}</span>
                        </button>
                      );
                    })}
                    {hasDocumentosTab && (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={safeActiveSectionIndex === sections.length}
                        className={safeActiveSectionIndex === sections.length ? 'solicitudes-nuevo-perfil-tab-active' : ''}
                        onClick={() => setPerfilActiveSectionIndex(sections.length)}
                      >
                        <i><FaFileAlt /></i>
                        <span>Documentos requeridos</span>
                      </button>
                    )}
                  </div>

                  {sections.map((section, sectionIndex) => (
                  <section
                    className={`solicitudes-nuevo-perfil-section ${safeActiveSectionIndex === sectionIndex ? 'solicitudes-nuevo-perfil-section-active' : 'solicitudes-nuevo-perfil-section-hidden'}`}
                    key={section.titulo || `perfil-section-${sectionIndex}`}
                  >
                    <h3>{section.titulo || `SecciÃ³n ${sectionIndex + 1}`}</h3>
                    <div className="solicitudes-nuevo-perfil-form-grid">
                      {(section.campos || [])
                        .filter((field) => field?.name && !isTechnicalPerfilKey(field.name))
                        .map((field) => (
                          <label
                            className={field.type === 'textarea' ? 'solicitudes-nuevo-perfil-field-wide' : ''}
                            key={field.name}
                            htmlFor={`perfil-field-${field.name}`}
                          >
                            <span>
                              {field.label || field.name}
                              {field.required ? ' *' : ''}
                            </span>
                            {renderPerfilFieldInput(field)}
                          </label>
                        ))}
                    </div>
                  </section>
                  ))}

                  {hasDocumentosTab && (
                    <section className={`solicitudes-nuevo-perfil-section solicitudes-nuevo-perfil-docs-section ${safeActiveSectionIndex === sections.length ? 'solicitudes-nuevo-perfil-section-active' : 'solicitudes-nuevo-perfil-section-hidden'}`}>
                      <h3>Documentos requeridos</h3>
                      <p>Los documentos se cargarÃ¡n desde el mÃ³dulo de Documentos del expediente.</p>
                      <div className="solicitudes-nuevo-perfil-docs-list">
                        {documentosRequeridos.map((documento, docIndex) => {
                          const label = typeof documento === 'object'
                            ? documento.nombre || documento.label || documento.name || `Documento ${docIndex + 1}`
                            : documento;
                          return (
                            <span key={`${label}-${docIndex}`}>
                              <FaFileAlt /> {getValue(label)}
                            </span>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <div className="solicitudes-nuevo-perfil-tab-navigation">
                    <button
                      type="button"
                      disabled={safeActiveSectionIndex === 0}
                      onClick={() => setPerfilActiveSectionIndex((current) => Math.max(0, current - 1))}
                    >
                      Anterior
                    </button>
                    <span>{activeSectionTitle}</span>
                    <button
                      type="button"
                      disabled={safeActiveSectionIndex >= totalPerfilTabs - 1}
                      onClick={() => setPerfilActiveSectionIndex((current) => Math.min(totalPerfilTabs - 1, current + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                </>
              )}

              {perfilModalMessage && (
                <div className={`solicitudes-nuevo-perfil-message ${perfilModalMessage.includes('correctamente') ? '' : 'solicitudes-nuevo-perfil-message-error'}`}>
                  {perfilModalMessage}
                </div>
              )}

              <div className="solicitudes-nuevo-perfil-save-actions">
              <button type="button" onClick={handleClosePerfilModal} disabled={perfilSaving}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={perfilSaving || sections.length === 0}
                onClick={() => handleSavePerfilTabbed(null, {
                  closeAfterSave: false,
                  estado: 'borrador',
                  motivoCambio: `Guardado de avance desde secciÃ³n: ${activeSectionTitle}`,
                })}
              >
                {perfilSaving ? 'Guardando...' : isV2 ? 'Guardar borrador' : 'Guardar avance'}
              </button>
              <button type="submit" disabled={perfilSaving || sections.length === 0}>
                {perfilSaving ? 'Guardando...' : isV2 ? 'Marcar completo' : 'Guardar perfil completo'}
              </button>
              </div>
            </div>
          </form>
        ) : perfilModalMode === 'versions' ? (
          <section className="solicitudes-nuevo-perfil-versiones-panel">
            {!perfilVersionesLoading && perfilModalMessage && (
              <div className={`solicitudes-nuevo-perfil-message ${perfilModalMessage.includes('correctamente') ? '' : 'solicitudes-nuevo-perfil-message-error'}`}>
                {perfilModalMessage}
              </div>
            )}
            {perfilVersionesLoading ? (
              <div className="solicitudes-nuevo-profile-empty">Cargando versiones...</div>
            ) : perfilVersiones.length === 0 ? (
              <div className="solicitudes-nuevo-profile-empty">Sin versiones registradas.</div>
            ) : (
              <div className="solicitudes-nuevo-perfil-versiones">
                {perfilVersiones.map((version) => {
                  const resumen = Object.entries(version.respuestas_json || {})
                    .filter(([key]) => !isTechnicalPerfilKey(key))
                    .slice(0, 6);
                  const pdfAction = perfilPdfActionByVersion[version.id_version];
                  const hasPdf = hasValue(version.id_documento_pdf);
                  const isGenerating = pdfAction === 'generating';
                  const isRegenerating = pdfAction === 'regenerating';
                  const isDownloading = pdfAction === 'downloading';

                  return (
                    <article key={version.id_version}>
                      <div>
                        <strong>VersiÃ³n {getValue(version.version)}</strong>
                        <span>{formatDate(version.creado_en)}</span>
                      </div>
                      <p>{getValue(version.motivo_cambio)}</p>
                      {resumen.length > 0 && (
                        <ul>
                          {resumen.map(([key, value]) => (
                            <li key={`${version.id_version}-${key}`}>
                              {getPerfilFieldLabel(estructuraJson, key)}: {getValue(value)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {hasPdf && (
                        <div className="solicitudes-nuevo-perfil-version-pdf-meta">
                          <span>{getPerfilPdfFilename(version)}</span>
                          <small>Generado: {formatDate(version.pdf_generado_en)}</small>
                        </div>
                      )}
                      <div className="solicitudes-nuevo-perfil-version-actions">
                        <button type="button" onClick={() => handleOpenPerfilVersionDetail(version)}>
                          <FaEye /> Ver versiÃ³n
                        </button>
                        {hasPdf ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDescargarPdfVersion(version)}
                              disabled={Boolean(pdfAction)}
                            >
                              <FaDownload /> {isDownloading ? 'Descargando...' : 'Descargar PDF'}
                            </button>
                            <button
                              type="button"
                              className="solicitudes-nuevo-perfil-version-secondary"
                              onClick={() => handleRegenerarPdfVersion(version)}
                              disabled={Boolean(pdfAction)}
                            >
                              <FaFileDownload /> {isRegenerating ? 'Regenerando...' : 'Regenerar PDF'}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerarPdfVersion(version)}
                            disabled={Boolean(pdfAction)}
                          >
                            <FaFileDownload /> {isGenerating ? 'Generando...' : 'Generar PDF'}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="solicitudes-nuevo-perfil-form-surface">
            {isVersionView && (
              <div className="solicitudes-nuevo-perfil-version-banner">
                <strong>VersiÃ³n {getValue(perfilSelectedVersion?.version)}</strong>
                <span>{formatDate(perfilSelectedVersion?.creado_en)}</span>
                <p>{getValue(perfilSelectedVersion?.motivo_cambio)}</p>
              </div>
            )}
            {isV2 ? (
              <ProfileFormRenderer
                template={estructuraJson}
                answers={perfilFormValues}
                setAnswers={setPerfilFormValues}
                repeaters={perfilRepeaters}
                setRepeaters={setPerfilRepeaters}
                disabled
                completion={isVersionView ? perfilSelectedVersion?.completitud_json : perfilSolicitud?.completitud_json}
              />
            ) : renderPerfilReadSections(estructuraJson, perfilFormValues)}
          </section>
        )}
      </main>
    );
  };

  const handleDocumentoRequeridoPicker = (clave) => {
    const input = document.getElementById(`documento-requerido-input-${clave}`);
    if (input) input.click();
  };

  const handleScrollToDocumentos = () => {
    const target = document.getElementById('solicitudes-documentos-requeridos');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUploadDocumentoRequerido = async (documentoRequerido, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedSolicitud?.id_solicitud || !documentoRequerido?.clave) return;

    setDocumentosRequeridosMessage('');
    setDocumentosRequeridosUploading((current) => ({
      ...current,
      [documentoRequerido.clave]: true,
    }));

    try {
      await uploadDocumentoRequerido(selectedSolicitud.id_solicitud, documentoRequerido.clave, file);
      const [requeridosActualizados, documentosActualizados] = await Promise.all([
        getDocumentosRequeridosBySolicitud(selectedSolicitud.id_solicitud),
        getDocumentosBySolicitud(selectedSolicitud.id_solicitud),
      ]);
      setDocumentosRequeridos(requeridosActualizados);
      setDocumentos(documentosActualizados);
      await loadResumenAvanceSolicitud(selectedSolicitud.id_solicitud);
      setDocumentosRequeridosMessage('Documento cargado correctamente.');
    } catch (requestError) {
      setDocumentosRequeridosMessage('No se pudo cargar el documento.');
    } finally {
      setDocumentosRequeridosUploading((current) => {
        const next = { ...current };
        delete next[documentoRequerido.clave];
        return next;
      });
    }
  };

  const handleDownloadDocumentoRequerido = (documento) => {
    if (!documento?.id_documento) return;
    descargarDocumento(documento);
  };

  const handlePreview = (documento) => {
    if (documento.drive_file_id) setPreviewDocument(documento);
    else if (documento.web_view_link) openExternalLink(documento.web_view_link);
  };

  return (
    <div className="solicitudes-nuevo-page">
        {perfilModalMode && selectedSolicitud ? (
          renderPerfilWorkspace()
        ) : viewMode === 'list' ? (
          <>
            <main className="solicitudes-nuevo-content">
          <section className="solicitudes-nuevo-page-heading">
            <div>
              <h1>GestiÃ³n de Aplicantes</h1>
              <p>Administra contactos, aplicantes, trÃ¡mites y expedientes migratorios.</p>
            </div>
            <div className="solicitudes-nuevo-heading-actions">
              <button type="button" className="solicitudes-nuevo-export-button">
                <FaFileDownload /> Exportar
              </button>
              <button type="button" onClick={handleOpenCreate}>
                <FaPlusCircle /> Nueva Solicitud
              </button>
            </div>
          </section>

          <section className="solicitudes-nuevo-summary-grid">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article className={`solicitudes-nuevo-summary-card solicitudes-nuevo-summary-${metric.tone}`} key={metric.label}>
                  <div className="solicitudes-nuevo-summary-icon"><Icon /></div>
                  <div>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.caption}</small>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="solicitudes-nuevo-applicants-card">
            <div className="solicitudes-nuevo-filter-row">
              <form className="solicitudes-nuevo-top-search" onSubmit={handleSearch}>
                <FaSearch />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                    setExactSolicitud(null);
                    setExactSearchMessage('');
                  }}
                  placeholder="Buscar por nombre, solicitud, aplicante, contacto o trÃ¡mite..."
                  aria-label="Buscar por nombre, solicitud, aplicante, contacto o trÃ¡mite"
                />
              </form>
              <label>
                <FaFilter />
                <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(1); }}>
                  <option value="">Tipo de trÃ¡mite: Todos</option>
                  {typeOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <FaPauseCircle />
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}>
                  <option value="">Estado: Todos</option>
                  {statusOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <span>
                Mostrando {paginatedSolicitudes.length} de {displaySolicitudes.length}
              </span>
            </div>

            {exactSearchMessage && <div className="solicitudes-nuevo-message">{exactSearchMessage}</div>}

            {loading ? (
              <div className="solicitudes-nuevo-empty">Cargando solicitudes...</div>
            ) : error ? (
              <div className="solicitudes-nuevo-empty solicitudes-nuevo-error">{error}</div>
            ) : displaySolicitudes.length === 0 ? (
              <div className="solicitudes-nuevo-empty">
                <FaSearch />
                <strong>No se encontraron coincidencias con la bÃºsqueda actual.</strong>
              </div>
            ) : (
              <div className="solicitudes-nuevo-table-wrap">
                <table className="solicitudes-nuevo-table">
                  <thead>
                    <tr>
                      <th>TrÃ¡mite</th>
                      <th>Fecha</th>
                      <th>Nombre del aplicante</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSolicitudes.map((solicitud) => (
                      <tr
                        key={solicitud.id_solicitud}
                        className="admin-clickable-row"
                        onClick={() => navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`)}
                      >
                        <td>
                          <span className="solicitudes-nuevo-visa-pill">
                            {getTipoTramite(solicitud)}
                          </span>
                        </td>
                        <td>
                          <span className="solicitudes-nuevo-id">{formatDate(solicitud.fecha_inicio)}</span>
                        </td>
                        <td>
                          <div className="solicitudes-nuevo-applicant-cell">
                            <div className="solicitudes-nuevo-applicant-avatar">
                              {buildClientName(solicitud).charAt(0)}
                            </div>
                            <div>
                              <strong>{buildClientName(solicitud)}</strong>
                              <span>
                                Solicitud #{getValue(solicitud.id_solicitud)}
                                {' Â· '}Aplicante #{getValue(getClientId(solicitud))}
                                {hasValue(solicitud.id_contacto) ? ` Â· Contacto #${solicitud.id_contacto}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`solicitudes-nuevo-status solicitudes-nuevo-status-${getSolicitudTone(getEstadoActual(solicitud))}`}>
                            <i />
                            {getEstadoActual(solicitud)}
                          </span>
                        </td>
                        <td>
                          <div className="solicitudes-nuevo-row-actions">
                          <button
                            type="button"
                            className="admin-action-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/empleado/solicitudes-nuevo?id_solicitud=${solicitud.id_solicitud}`);
                            }}
                            title="Ver expediente"
                          >
                            <FaEye />
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && displaySolicitudes.length > 0 && (
              <div className="solicitudes-nuevo-pagination">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <FaChevronLeft /> Anterior
                </button>
                <div>
                  {[1, 2, 3].filter((page) => page <= totalPages).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={safeCurrentPage === page ? 'solicitudes-nuevo-page-active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 4 && <span>...</span>}
                  {totalPages > 3 && (
                    <button
                      type="button"
                      className={safeCurrentPage === totalPages ? 'solicitudes-nuevo-page-active' : ''}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Siguiente <FaChevronRight />
                </button>
              </div>
            )}
          </section>
            </main>
          </>
        ) : viewMode === 'create' ? (
          <main className="solicitudes-nuevo-create-content">
            <header className="solicitudes-nuevo-create-topbar">
              <button
                type="button"
                className="solicitudes-nuevo-profile-back"
                onClick={handleCloseCreateFlow}
              >
                <FaArrowLeft />
                {createMode === 'edit' ? 'Volver al perfil' : 'Volver a Solicitudes'}
              </button>
              <div className="solicitudes-nuevo-create-admin">
                <button type="button" title="Notificaciones"><FaBell /></button>
                <button type="button" title="Ayuda"><FaQuestionCircle /></button>
                <div className="solicitudes-nuevo-avatar">AU</div>
              </div>
            </header>

            <section className="solicitudes-nuevo-create-heading">
              <div>
                <span>{createMode === 'edit' ? 'Editar expediente' : 'Nuevo expediente'}</span>
                <h1>{createMode === 'edit' ? buildClientName(selectedSolicitud) : 'Nuevo Aplicante'}</h1>
                <p>
                  {createMode === 'edit'
                    ? 'Revisa contacto, aplicante y trÃ¡mite desde el mismo formulario.'
                    : 'Registra un aplicante y crea su trÃ¡mite inicial.'}
                </p>
              </div>
              <div className="solicitudes-nuevo-create-status-card">
                <FaInbox />
                <span>{createMode === 'edit' ? 'Solicitud' : 'Origen'}</span>
                <strong>{createMode === 'edit' ? `#${getValue(selectedSolicitud?.id_solicitud)}` : 'Informes'}</strong>
              </div>
            </section>

            <form className="solicitudes-nuevo-create-form" onSubmit={handleExpedienteFormSubmit}>
              <div className="solicitudes-nuevo-create-steps">
                {['Contacto', 'Aplicantes y trÃ¡mites', 'Resumen'].map((label, index) => (
                  <button
                    type="button"
                    key={label}
                    className={createStep === index + 1 ? 'solicitudes-nuevo-create-step-active' : ''}
                    onClick={() => {
                      if (index + 1 < createStep || validateCreateStep(createStep)) {
                        setCreateStep(index + 1);
                      }
                    }}
                    disabled={createSaving}
                  >
                    <span>{index + 1}</span>
                    {label}
                  </button>
                ))}
              </div>

              {createStep === 1 && (
                <section className="solicitudes-nuevo-create-card">
                  <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-teal">
                    <h2>Contacto</h2>
                    <p>Registra el contacto inicial capturado por Informes.</p>
                  </div>
                  <div className="solicitudes-nuevo-create-grid">
                    <label>
                      <span>Nombre del contacto *</span>
                      <input name="nombre" value={createForm.contacto.nombre} onChange={handleContactoFieldChange} required />
                    </label>
                    <label>
                      <span>NÃºmero de contacto</span>
                      <input name="telefono" value={createForm.contacto.telefono} onChange={handleContactoFieldChange} />
                    </label>
                    <label>
                      <span>NÃºmero de emergencia</span>
                      <input name="telefono_emergencia" value={createForm.contacto.telefono_emergencia} onChange={handleContactoFieldChange} />
                    </label>
                    <label>
                      <span>Correo electrÃ³nico</span>
                      <input type="email" name="correo" value={createForm.contacto.correo} onChange={handleContactoFieldChange} />
                    </label>
                  </div>
                </section>
              )}

              {createStep === 2 && (
                <section className="solicitudes-nuevo-create-card">
                  <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-teal">
                    <h2>Aplicantes</h2>
                    <p>Agrega uno o varios aplicantes vinculados al contacto.</p>
                  </div>
                  <div className="solicitudes-nuevo-create-applicants">
                    {createForm.aplicantes.map((aplicante, index) => (
                      <div className="solicitudes-nuevo-create-applicant-card" key={`aplicante-${index}`}>
                        <div className="solicitudes-nuevo-create-applicant-title">
                          <strong>Aplicante {index + 1}</strong>
                          {createMode === 'create' && createForm.aplicantes.length > 1 && (
                            <button type="button" onClick={() => handleRemoveAplicante(index)} disabled={createSaving}>
                              Quitar
                            </button>
                          )}
                        </div>
                        <div className="solicitudes-nuevo-create-section-title">
                          <h3>Datos del aplicante</h3>
                          <span>InformaciÃ³n personal del aplicante.</span>
                        </div>
                        <div className="solicitudes-nuevo-create-grid">
                          <label><span>Nombre *</span><input name="nombre" value={aplicante.nombre} onChange={(event) => handleAplicanteFieldChange(index, event)} required /></label>
                          <label><span>Apellido paterno</span><input name="apellido_paterno" value={aplicante.apellido_paterno} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label><span>Apellido materno</span><input name="apellido_materno" value={aplicante.apellido_materno} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label><span>TelÃ©fono</span><input name="telefono" value={aplicante.telefono} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label><span>Correo</span><input type="email" name="correo" value={aplicante.correo} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label><span>Fecha de nacimiento</span><input type="date" name="fecha_nacimiento" value={aplicante.fecha_nacimiento} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label>
                            <span>PaÃ­s</span>
                            <select name="id_pais" value={aplicante.id_pais} onChange={(event) => handleAplicanteFieldChange(index, event)}>
                              <option value="1">
                                {paisesLoading ? 'Cargando paÃ­ses...' : 'MÃ©xico'}
                              </option>
                              {paises
                                .filter((pais) => String(pais.id_pais) !== '1')
                                .map((pais) => (
                                  <option key={pais.id_pais} value={pais.id_pais}>
                                    {pais.nombre_pais || `PaÃ­s ${pais.id_pais}`}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <label><span>Estado</span><input name="estado" value={aplicante.estado} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label><span>Ciudad</span><input name="ciudad" value={aplicante.ciudad} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label className="solicitudes-nuevo-create-wide"><span>DirecciÃ³n</span><input name="direccion" value={aplicante.direccion} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          <label className="solicitudes-nuevo-create-wide"><span>Notas generales</span><textarea name="notas_generales" value={aplicante.notas_generales} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                        </div>
                        <div className="solicitudes-nuevo-create-section-title solicitudes-nuevo-create-section-title-navy">
                          <h3>InformaciÃ³n del trÃ¡mite</h3>
                          <span>Documentos: prÃ³ximamente</span>
                        </div>
                        <div className="solicitudes-nuevo-create-tramite-grid">
                          <label>
                            <span>Tipo de trÃ¡mite principal *</span>
                            <select name="id_tipo_tramite" value={aplicante.id_tipo_tramite} onChange={(event) => handleAplicanteFieldChange(index, event)} required>
                              <option value="">{tiposLoading ? 'Cargando tipos...' : 'Seleccione el tipo de trÃ¡mite'}</option>
                              {tipoTramites.map((tipo) => {
                                const disabledByAge = !canSelectTramite(aplicante, tipo);
                                return (
                                  <option
                                    key={tipo.id_tipo_tramite}
                                    value={tipo.id_tipo_tramite}
                                    disabled={disabledByAge}
                                  >
                                    {tipo.nombre_tramite || `Tipo ${tipo.id_tipo_tramite}`}
                                    {disabledByAge ? ' - requiere 57 aÃ±os' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </label>
                          {isPasaporteSeleccionado(tipoTramites, aplicante.id_tipo_tramite) && (
                            <label>
                            <span>TrÃ¡mite adicional</span>
                            <select name="id_tipo_tramite_adicional" value={aplicante.id_tipo_tramite_adicional} onChange={(event) => handleAplicanteFieldChange(index, event)}>
                              <option value="">Sin trÃ¡mite adicional</option>
                              {tipoTramites
                                .filter((tipo) => String(tipo.id_tipo_tramite) !== String(aplicante.id_tipo_tramite))
                                .map((tipo) => {
                                const disabledByAge = !canSelectTramite(aplicante, tipo);
                                return (
                                  <option
                                    key={tipo.id_tipo_tramite}
                                    value={tipo.id_tipo_tramite}
                                    disabled={disabledByAge}
                                  >
                                    {tipo.nombre_tramite || `Tipo ${tipo.id_tipo_tramite}`}
                                    {disabledByAge ? ' - requiere 57 aÃ±os' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </label>
                          )}
                          {tipoTramites.some((tipo) => isAmaTramite(tipo)) &&
                            tipoTramites.some((tipo) => !canSelectTramite(aplicante, tipo)) && (
                              <div className="solicitudes-nuevo-create-age-warning">
                                Este aplicante no cumple la edad mÃ­nima para trÃ¡mites AMA. Puede seleccionar otro tipo de trÃ¡mite.
                              </div>
                            )}
                          <label>
                            <span>Canal de contacto *</span>
                            <select name="canal_contacto" value={aplicante.canal_contacto} onChange={(event) => handleAplicanteFieldChange(index, event)} required>
                              <option value="">Seleccione canal</option>
                              <option value="Walle">Walle</option>
                              <option value="Eva">Eva</option>
                              <option value="Banny">Banny</option>
                            </select>
                          </label>
                          <fieldset className="solicitudes-nuevo-create-wide">
                            <legend>Â¿Tiene descuento?</legend>
                            <label><input type="radio" name={`aplica-descuento-${index}`} checked={aplicante.aplica_descuento === true} onChange={() => handleDiscountChange(index, true)} /> SÃ­</label>
                            <label><input type="radio" name={`aplica-descuento-${index}`} checked={aplicante.aplica_descuento !== true} onChange={() => handleDiscountChange(index, false)} /> No</label>
                            {aplicante.aplica_descuento && <div><span>Motivo</span><label><input type="checkbox" checked={aplicante.motivos_descuento.includes('DISCAPACIDAD')} onChange={(event) => handleDiscountChange(index, true, 'DISCAPACIDAD', event.target.checked)} /> Persona con discapacidad</label><label><input type="checkbox" checked={aplicante.motivos_descuento.includes('ADULTO_MAYOR')} onChange={(event) => handleDiscountChange(index, true, 'ADULTO_MAYOR', event.target.checked)} /> Adulto mayor</label></div>}
                          </fieldset>
                          <label className="solicitudes-nuevo-create-wide"><span>Notas de trÃ¡mite / observaciones</span><textarea name="observaciones" value={aplicante.observaciones} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          {createMode === 'edit' && (
                            <>
                              <label>
                                <span>Estado</span>
                                <select name="estado_actual" value={aplicante.estado_actual} onChange={(event) => handleAplicanteFieldChange(index, event)} disabled={estatusLoading}>
                                  <option value="">{estatusLoading ? 'Cargando estados...' : 'Sin estado'}</option>
                                  {estatusCatalogo.map((estatus) => (
                                    <option key={estatus.id} value={estatus.id}>
                                      {estatus.valor || `Estado ${estatus.id}`}
                                    </option>
                                  ))}
                                  {!estatusCatalogo.some((estatus) => String(estatus.id) === String(aplicante.estado_actual)) &&
                                    hasValue(aplicante.estado_actual) && (
                                      <option value={aplicante.estado_actual}>
                                        {aplicante.estado_actual_display}
                                      </option>
                                    )}
                                </select>
                              </label>
                              <label>
                                <span>Ãrea actual</span>
                                <select name="id_area_actual" value={aplicante.id_area_actual} onChange={(event) => handleAplicanteFieldChange(index, event)} disabled={areasLoading}>
                                  <option value="">{areasLoading ? 'Cargando Ã¡reas...' : 'Sin Ã¡rea'}</option>
                                  {areas.map((area) => (
                                    <option key={area.id_area} value={area.id_area}>
                                      {area.nombre || area.clave || `Ãrea ${area.id_area}`}
                                    </option>
                                  ))}
                                  {!areas.some((area) => String(area.id_area) === String(aplicante.id_area_actual)) &&
                                    hasValue(aplicante.id_area_actual) && (
                                      <option value={aplicante.id_area_actual}>
                                        {aplicante.area_actual_display}
                                      </option>
                                    )}
                                </select>
                              </label>
                              <label>
                                <span>Encargado</span>
                                <select name="id_empleado_responsable" value={aplicante.id_empleado_responsable} onChange={(event) => handleAplicanteFieldChange(index, event)} disabled={empleadosLoading}>
                                  <option value="">{empleadosLoading ? 'Cargando empleados...' : 'Sin asignar'}</option>
                                  {empleados.map((empleado) => (
                                    <option key={empleado.id_empleado} value={empleado.id_empleado}>
                                      {[empleado.nombre, empleado.apellidos].filter(hasValue).join(' ') || `Empleado ${empleado.id_empleado}`}
                                      {empleado.area ? ` - ${empleado.area}` : ''}
                                    </option>
                                  ))}
                                  {!empleados.some((empleado) => String(empleado.id_empleado) === String(aplicante.id_empleado_responsable)) &&
                                    hasValue(aplicante.id_empleado_responsable) && (
                                      <option value={aplicante.id_empleado_responsable}>
                                        {aplicante.responsable_display}
                                      </option>
                                    )}
                                </select>
                              </label>
                              <label>
                                <span>PrÃ³ximo contacto</span>
                                <input type="date" name="fecha_proximo_contacto" value={aplicante.fecha_proximo_contacto} onChange={(event) => handleAplicanteFieldChange(index, event)} />
                              </label>
                              <label>
                                <span>Fecha de primera aplicaciÃ³n</span>
                                <input type="date" name="fecha_primera_aplicacion" value={aplicante.fecha_primera_aplicacion || ''} onChange={(event) => handleAplicanteFieldChange(index, event)} />
                              </label>
                              <label>
                                <span>Resultado</span>
                                <input name="resultado" value={aplicante.resultado} onChange={(event) => handleAplicanteFieldChange(index, event)} />
                              </label>
                              <label>
                                <span>Fecha de cierre</span>
                                <input type="date" name="fecha_cierre" value={aplicante.fecha_cierre} onChange={(event) => handleAplicanteFieldChange(index, event)} />
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {createMode === 'create' && (
                    <button type="button" className="solicitudes-nuevo-create-secondary" onClick={handleAddAplicante} disabled={createSaving}>
                      <FaPlus /> Agregar aplicante
                    </button>
                  )}
                </section>
              )}

              {false && createStep === 3 && (
                <section className="solicitudes-nuevo-create-card">
                  <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-navy">
                    <h2>TrÃ¡mite</h2>
                    <p>
                      {createMode === 'edit'
                        ? 'Revisa datos operativos del trÃ¡mite.'
                        : 'Selecciona el tipo de trÃ¡mite para cada aplicante. Estado inicial: 102.'}
                    </p>
                  </div>
                  <div className="solicitudes-nuevo-create-applicants">
                    {createForm.aplicantes.map((aplicante, index) => (
                      <div className="solicitudes-nuevo-create-applicant-card" key={`tramite-${index}`}>
                        <div className="solicitudes-nuevo-create-applicant-title">
                          <strong>{aplicante.nombre || `Aplicante ${index + 1}`}</strong>
                          <span>Documentos: prÃ³ximamente</span>
                        </div>
                        <div className="solicitudes-nuevo-create-grid">
                          <label>
                            <span>Tipo de trÃ¡mite *</span>
                            <select name="id_tipo_tramite" value={aplicante.id_tipo_tramite} onChange={(event) => handleAplicanteFieldChange(index, event)} required>
                              <option value="">{tiposLoading ? 'Cargando tipos...' : 'Seleccione el tipo de trÃ¡mite'}</option>
                              {tipoTramites.map((tipo) => {
                                const disabledByAge = !canSelectTramite(aplicante, tipo);
                                return (
                                  <option
                                    key={tipo.id_tipo_tramite}
                                    value={tipo.id_tipo_tramite}
                                    disabled={disabledByAge}
                                  >
                                    {tipo.nombre_tramite || `Tipo ${tipo.id_tipo_tramite}`}
                                    {disabledByAge ? ' - requiere 57 aÃ±os' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </label>
                          {tipoTramites.some((tipo) => isAmaTramite(tipo)) &&
                            tipoTramites.some((tipo) => !canSelectTramite(aplicante, tipo)) && (
                              <div className="solicitudes-nuevo-create-age-warning">
                                Este aplicante no cumple la edad mÃ­nima para trÃ¡mites AMA. Puede seleccionar otro tipo de trÃ¡mite.
                              </div>
                            )}
                          <label>
                            <span>Canal de contacto</span>
                            <select name="canal_contacto" value={aplicante.canal_contacto} onChange={(event) => handleAplicanteFieldChange(index, event)}>
                              <option value="">Seleccione canal</option>
                              <option value="Walle">Walle</option>
                              <option value="Eva">Eva</option>
                              <option value="Banny">Banny</option>
                            </select>
                          </label>
                          <label className="solicitudes-nuevo-create-wide"><span>Observaciones</span><textarea name="observaciones" value={aplicante.observaciones} onChange={(event) => handleAplicanteFieldChange(index, event)} /></label>
                          {createMode === 'edit' && (
                            <>
                              <label>
                                <span>Encargado</span>
                                <select name="id_empleado_responsable" value={aplicante.id_empleado_responsable} onChange={(event) => handleAplicanteFieldChange(index, event)} disabled={empleadosLoading}>
                                  <option value="">{empleadosLoading ? 'Cargando empleados...' : 'Sin asignar'}</option>
                                  {empleados.map((empleado) => (
                                    <option key={empleado.id_empleado} value={empleado.id_empleado}>
                                      {[empleado.nombre, empleado.apellidos].filter(hasValue).join(' ') || `Empleado ${empleado.id_empleado}`}
                                      {empleado.area ? ` - ${empleado.area}` : ''}
                                    </option>
                                  ))}
                                  {!empleados.some((empleado) => String(empleado.id_empleado) === String(aplicante.id_empleado_responsable)) &&
                                    hasValue(aplicante.id_empleado_responsable) && (
                                      <option value={aplicante.id_empleado_responsable}>
                                        {aplicante.responsable_display}
                                      </option>
                                    )}
                                </select>
                              </label>
                              <label>
                                <span>Ãrea actual</span>
                                <input name="area_actual_display" value={aplicante.area_actual_display} onChange={(event) => handleAplicanteFieldChange(index, event)} disabled />
                              </label>
                              <label>
                                <span>Estado</span>
                                <input name="estado_actual_display" value={aplicante.estado_actual_display} onChange={(event) => handleAplicanteFieldChange(index, event)} disabled />
                              </label>
                              <label>
                                <span>PrÃ³ximo contacto</span>
                                <input type="date" name="fecha_proximo_contacto" value={aplicante.fecha_proximo_contacto} onChange={(event) => handleAplicanteFieldChange(index, event)} />
                              </label>
                              <label>
                                <span>Resultado</span>
                                <input name="resultado" value={aplicante.resultado} onChange={(event) => handleAplicanteFieldChange(index, event)} />
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {createStep === 3 && (
                <section className="solicitudes-nuevo-create-card">
                  <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-teal">
                    <h2>Resumen</h2>
                    <p>
                      {createMode === 'edit'
                        ? 'Resumen del expediente cargado para ediciÃ³n.'
                        : 'Contacto, aplicantes y solicitudes creadas desde Informes.'}
                    </p>
                  </div>
                  {createForm.resumen ? (
                    <>
                      <div className="solicitudes-nuevo-create-summary">
                        <div><span>Contacto</span><strong>{getValue(createForm.resumen.contacto.nombre)}</strong><small>#{getValue(createForm.resumen.contacto.id_contacto)}</small></div>
                        <div><span>Aplicantes</span><strong>{createForm.resumen.aplicantes.length}</strong></div>
                        <div><span>Solicitudes</span><strong>{createForm.resumen.solicitudes.length}</strong></div>
                        <div><span>{createMode === 'edit' ? 'Ãrea actual' : 'Ãrea destino'}</span><strong>{createMode === 'edit' ? getAreaActual(selectedSolicitud) : 'PAGOS'}</strong></div>
                        <button type="button" className="solicitudes-nuevo-create-submit" onClick={handleOpenCreatedSolicitud}>
                          <FaEye /> {createMode === 'edit' ? 'Volver al perfil' : 'Abrir primer perfil'}
                        </button>
                      </div>
                      {createForm.resumen.quickbooks && (() => {
                        const quickbooksCopy = getQuickBooksResultCopy(createForm.resumen.quickbooks.status);
                        return (
                          <div className={`solicitudes-nuevo-qb-result is-${quickbooksCopy.tone}`} role="status">
                            <strong>{quickbooksCopy.title}</strong>
                            <span>{quickbooksCopy.detail}</span>
                          </div>
                        );
                      })()}
                      <div className="solicitudes-nuevo-create-result-list">
                        {groupSolicitudesByAplicante(createForm.resumen.solicitudes).map((group, index) => (
                          <article className="solicitudes-nuevo-create-result-item" key={group.key || `aplicante-creado-${index}`}>
                            <small>Aplicante</small>
                            <strong>{buildClientName(group.aplicante)}</strong>
                            <div className="solicitudes-nuevo-create-result-grid">
                              <span><small>PaÃ­s</small>{getValue(group.aplicante.pais_nombre)}</span>
                              <span><small>Solicitudes</small>{group.solicitudes.length}</span>
                            </div>
                            <div className="solicitudes-nuevo-create-result-tramites">
                              {group.solicitudes.map((solicitud, solicitudIndex) => (
                                <div key={solicitud.id_solicitud || `${group.key}-${getTipoTramite(solicitud)}`}>
                                  <span className="solicitudes-nuevo-create-result-tramite-name">
                                    <small>{getTramitePositionLabel(solicitudIndex)}</small>
                                    {getTipoTramite(solicitud)} | Canal: {getValue(solicitud.canal_contacto)}
                                  </span>
                                  <span><small>Estado</small>{getEstadoActual(solicitud)}</span>
                                  <span><small>Ãrea</small>{getAreaActual(solicitud)}</span>
                                </div>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="solicitudes-nuevo-profile-empty">
                      Revisa los datos y crea las solicitudes para ver el resumen.
                    </div>
                  )}
                </section>
              )}

              {(createError || createSuccess) && (
                <div className={`solicitudes-nuevo-create-message ${createError ? 'solicitudes-nuevo-create-message-error' : ''}`}>
                  {createError || createSuccess}
                </div>
              )}

              <div className="solicitudes-nuevo-create-actions">
                <button type="button" className="solicitudes-nuevo-create-cancel" onClick={createStep === 1 ? handleCloseCreateFlow : handlePreviousCreateStep} disabled={createSaving}>
                  {createStep === 1 ? (createMode === 'edit' ? 'Volver al perfil' : 'Cancelar') : 'Anterior'}
                </button>
                {createStep < 2 && (
                  <button type="button" className="solicitudes-nuevo-create-submit" onClick={handleNextCreateStep} disabled={createSaving}>
                    Siguiente <FaChevronRight />
                  </button>
                )}
                {createStep === 2 && createMode === 'create' && (
                  <button type="submit" className="solicitudes-nuevo-create-submit" disabled={createSaving || tiposLoading}>
                    <FaPlusCircle /> {createSaving ? 'Creando...' : 'Crear solicitudes'}
                  </button>
                )}
                {createStep === 2 && createMode === 'edit' && (
                  <button type="submit" className="solicitudes-nuevo-create-submit" disabled={createSaving || tiposLoading || empleadosLoading || areasLoading || estatusLoading}>
                    <FaCheck /> {createSaving ? 'Guardando...' : 'Guardar expediente'}
                  </button>
                )}
                {createStep === 3 && (
                  <button type="button" className="solicitudes-nuevo-create-submit" onClick={handleCloseCreateFlow}>
                    {createMode === 'edit' ? 'Volver al perfil' : 'Volver al listado'}
                  </button>
                )}
              </div>

              {false && (
              <>
              <section className="solicitudes-nuevo-create-card">
                <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-teal">
                  <h2>Datos del aplicante</h2>
                  <p>InformaciÃ³n bÃ¡sica para crear el cliente.</p>
                </div>
                <div className="solicitudes-nuevo-create-grid">
                  <label>
                    <span>Nombre *</span>
                    <input
                      name="nombre"
                      value={createForm.nombre}
                      onChange={handleCreateFieldChange}
                      placeholder="Nombre del aplicante"
                      required
                    />
                  </label>
                  <label>
                    <span>Apellido paterno</span>
                    <input
                      name="apellido_paterno"
                      value={createForm.apellido_paterno}
                      onChange={handleCreateFieldChange}
                      placeholder="Apellido paterno"
                    />
                  </label>
                  <label>
                    <span>Apellido materno</span>
                    <input
                      name="apellido_materno"
                      value={createForm.apellido_materno}
                      onChange={handleCreateFieldChange}
                      placeholder="Apellido materno"
                    />
                  </label>
                  <label>
                    <span>TelÃ©fono</span>
                    <input
                      name="telefono"
                      value={createForm.telefono}
                      onChange={handleCreateFieldChange}
                      placeholder="5550000000"
                    />
                  </label>
                  <label>
                    <span>Correo</span>
                    <input
                      type="email"
                      name="correo"
                      value={createForm.correo}
                      onChange={handleCreateFieldChange}
                      placeholder="correo@ejemplo.com"
                    />
                  </label>
                  <label>
                    <span>Fecha de nacimiento</span>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={createForm.fecha_nacimiento}
                      onChange={handleCreateFieldChange}
                    />
                  </label>
                  <label>
                    <span>Estado</span>
                    <input
                      name="estado"
                      value={createForm.estado}
                      onChange={handleCreateFieldChange}
                      placeholder="Chihuahua"
                    />
                  </label>
                  <label>
                    <span>Ciudad</span>
                    <input
                      name="ciudad"
                      value={createForm.ciudad}
                      onChange={handleCreateFieldChange}
                      placeholder="Chihuahua"
                    />
                  </label>
                  <label className="solicitudes-nuevo-create-wide">
                    <span>DirecciÃ³n</span>
                    <input
                      name="direccion"
                      value={createForm.direccion}
                      onChange={handleCreateFieldChange}
                      placeholder="DirecciÃ³n del aplicante"
                    />
                  </label>
                  <label className="solicitudes-nuevo-create-wide">
                    <span>Notas generales</span>
                    <textarea
                      name="notas_generales"
                      value={createForm.notas_generales}
                      onChange={handleCreateFieldChange}
                      rows="3"
                      placeholder="Notas internas del aplicante"
                    />
                  </label>
                </div>
              </section>

              <section className="solicitudes-nuevo-create-card">
                <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-navy">
                  <h2>InformaciÃ³n General de la Solicitud</h2>
                  <p>Datos mÃ­nimos para crear la solicitud vinculada al cliente.</p>
                </div>
                <div className="solicitudes-nuevo-create-grid">
                  <label>
                    <span>Tipo de trÃ¡mite *</span>
                    <select
                      name="id_tipo_tramite"
                      value={createForm.id_tipo_tramite}
                      onChange={handleCreateFieldChange}
                      required
                    >
                      <option value="">
                        {tiposLoading ? 'Cargando tipos...' : 'Seleccione el tipo de trÃ¡mite'}
                      </option>
                      {tipoTramites.map((tipo) => (
                        <option key={tipo.id_tipo_tramite} value={tipo.id_tipo_tramite}>
                          {tipo.nombre_tramite || `Tipo ${tipo.id_tipo_tramite}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Estado inicial</span>
                    <select
                      name="estado_actual"
                      value={createForm.estado_actual}
                      onChange={handleCreateFieldChange}
                    >
                      <option value="">Sin estado inicial</option>
                    </select>
                  </label>
                  <label>
                    <span>Fecha de inicio</span>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={createForm.fecha_inicio}
                      onChange={handleCreateFieldChange}
                    />
                  </label>
                  <label>
                    <span>Origen del registro</span>
                    <input value="frontend_nuevo" disabled />
                  </label>
                  <label className="solicitudes-nuevo-create-wide">
                    <span>Observaciones</span>
                    <textarea
                      name="observaciones"
                      value={createForm.observaciones}
                      onChange={handleCreateFieldChange}
                      rows="4"
                      placeholder="Ingrese observaciones detalladas sobre la solicitud..."
                    />
                  </label>
                </div>
              </section>

              <section className="solicitudes-nuevo-create-card">
                <div className="solicitudes-nuevo-create-card-title solicitudes-nuevo-create-card-title-teal">
                  <h2>Carga de Documentos</h2>
                  <p>Esta etapa queda preparada para la siguiente iteraciÃ³n.</p>
                </div>
                <div className="solicitudes-nuevo-create-upload-grid">
                  <div><FaFileAlt /><strong>Pasaporte</strong><span>PrÃ³ximamente</span></div>
                  <div><FaFileAlt /><strong>IdentificaciÃ³n</strong><span>PrÃ³ximamente</span></div>
                  <div><FaFileAlt /><strong>Comprobante</strong><span>PrÃ³ximamente</span></div>
                </div>
              </section>

              {(createError || createSuccess) && (
                <div className={`solicitudes-nuevo-create-message ${createError ? 'solicitudes-nuevo-create-message-error' : ''}`}>
                  {createError || createSuccess}
                </div>
              )}

              <div className="solicitudes-nuevo-create-actions">
                <button
                  type="button"
                  className="solicitudes-nuevo-create-cancel"
                  onClick={handleBackToList}
                  disabled={createSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="solicitudes-nuevo-create-submit"
                  disabled={createSaving || tiposLoading}
                >
                  <FaPlusCircle />
                  {createSaving ? 'Guardando...' : 'Crear Solicitud'}
                </button>
              </div>
              </>
              )}
            </form>
          </main>
        ) : (
          <main className="solicitudes-nuevo-profile-content">
            <div className="solicitudes-nuevo-profile-toolbar">
              <button
                type="button"
                className="solicitudes-nuevo-profile-back"
                onClick={handleBackToList}
              >
                <FaArrowLeft />
                Volver a Aplicantes
              </button>
              <button
                type="button"
                className="solicitudes-nuevo-profile-contact"
                onClick={() => {
                  if (hasValue(selectedSolicitud?.cliente_correo)) {
                    window.location.href = `mailto:${selectedSolicitud.cliente_correo}`;
                  }
                }}
                disabled={!hasValue(selectedSolicitud?.cliente_correo)}
              >
                <FaComments />
                Contactar Aplicante
              </button>
            </div>

            {selectedSolicitud ? (
              <>
                <section className="solicitudes-nuevo-profile-hero">
                  <div className="solicitudes-nuevo-profile-avatar">
                    {getClientInitials(selectedSolicitud)}
                    <span><FaCheck /></span>
                  </div>
                  <div className="solicitudes-nuevo-profile-identity">
                    <h1>{buildClientName(selectedSolicitud)}</h1>
                    <p>
                      Folio solicitud #{getValue(selectedSolicitud.id_solicitud)}
                      <span>â€¢</span>
                      Folio aplicante #{getValue(getClientId(selectedSolicitud))}
                      <span>â€¢</span>
                      Folio contacto #{getValue(selectedSolicitud.id_contacto)}
                    </p>
                    <div className="solicitudes-nuevo-profile-chips">
                      <span className={`solicitudes-nuevo-status solicitudes-nuevo-status-${getSolicitudTone(getEstadoActual(selectedSolicitud))}`}>
                        <i />
                        Estado: {getEstadoActual(selectedSolicitud)}
                      </span>
                      <span className="solicitudes-nuevo-profile-chip solicitudes-nuevo-profile-chip-blue">
                        TrÃ¡mite: {getTipoTramite(selectedSolicitud)}
                      </span>
                      <span className="solicitudes-nuevo-profile-chip">
                        <FaFlag />
                        Ãrea: {getAreaActual(selectedSolicitud)}
                      </span>
                      <span className="solicitudes-nuevo-profile-chip">
                        <FaUserCheck />
                        Responsable: {getResponsableNombre(selectedSolicitud)}
                      </span>
                    </div>
                  </div>
                </section>

                {(detailLoading || detailMessage) && (
                  <div className="solicitudes-nuevo-message">
                    {detailLoading ? 'Cargando detalle...' : detailMessage}
                  </div>
                )}

                {(Number(selectedSolicitud.id_area_actual) === 3 || /visa|pasaporte|eta|canad/i.test(getTipoTramite(selectedSolicitud))) && <IndividualWorkspacePanel
                  solicitud={selectedSolicitud}
                  resumen={resumenAvance}
                  perfil={perfilSolicitud}
                  seguimientos={seguimientos}
                  documentos={documentos}
                  onProfile={perfilSolicitud ? handleOpenEditPerfil : handleOpenCreatePerfil}
                  onDocuments={handleScrollToDocumentos}
                  onRefresh={() => handleOpenSolicitud(selectedSolicitud)}
                />}
                {Number(selectedSolicitud.id_area_actual) === 4 && <AmaApplicantWorkspace solicitud={selectedSolicitud} resumen={resumenAvance} perfil={perfilSolicitud} onProfile={perfilSolicitud ? handleOpenEditPerfil : handleOpenCreatePerfil} onDocuments={handleScrollToDocumentos}/>} 

                <div className="solicitudes-nuevo-profile-grid">
                  <div className="solicitudes-nuevo-profile-column">
                    <section className="solicitudes-nuevo-profile-card">
                      <header className="solicitudes-nuevo-profile-card-title">
                        <FaUserCheck />
                        <h2>InformaciÃ³n de Contacto</h2>
                      </header>
                      <div className="solicitudes-nuevo-contact-list">
                        <div>
                          <FaEnvelope />
                          <span><small>Email</small><strong>{getValue(selectedSolicitud.cliente_correo)}</strong></span>
                        </div>
                        <div>
                          <FaPhone />
                          <span><small>TelÃ©fono</small><strong>{getValue(selectedSolicitud.cliente_telefono)}</strong></span>
                        </div>
                        <div>
                          <FaMapMarkerAlt />
                          <span>
                            <small>Ciudad</small>
                            <strong>{getValue(selectedSolicitud.ciudad || selectedSolicitud.cliente_ciudad)}</strong>
                          </span>
                        </div>
                        <div>
                          <FaFlag />
                          <span><small>Estado</small><strong>{getValue(selectedSolicitud.estado || selectedSolicitud.cliente_estado)}</strong></span>
                        </div>
                        <div>
                          <FaGlobeAmericas />
                          <span><small>PaÃ­s</small><strong>{getValue(selectedSolicitud.pais_nombre)}</strong></span>
                        </div>
                        <div>
                          <FaUserCheck />
                          <span><small>Folio contacto</small><strong>#{getValue(selectedSolicitud.id_contacto)}</strong></span>
                        </div>
                        <div>
                          <FaInbox />
                          <span><small>Folio aplicante</small><strong>#{getValue(getClientId(selectedSolicitud))}</strong></span>
                        </div>
                      </div>
                    </section>

                    <section className="solicitudes-nuevo-profile-card">
                      <header className="solicitudes-nuevo-profile-card-title">
                        <FaInbox />
                        <h2>InformaciÃ³n del trÃ¡mite</h2>
                      </header>
                      <div className="solicitudes-nuevo-profile-actions-row">
                        <button
                          type="button"
                          className="solicitudes-nuevo-edit-responsable"
                          onClick={handleOpenEditExpediente}
                        >
                          <FaEdit /> Editar expediente
                        </button>
                      </div>
                      <div className="solicitudes-nuevo-tramite-summary">
                        <div>
                          <span>Folio solicitud</span>
                          <strong>#{getValue(selectedSolicitud.id_solicitud)}</strong>
                        </div>
                        <div>
                          <span>Tipo de trÃ¡mite</span>
                          <strong>{getTipoTramite(selectedSolicitud)}</strong>
                        </div>
                        <div>
                          <span>Estado</span>
                          <strong>{getEstadoActual(selectedSolicitud)}</strong>
                        </div>
                        <div>
                          <span>Ãrea actual</span>
                          <strong>{getAreaActual(selectedSolicitud)}</strong>
                        </div>
                        <div>
                          <span>Canal de contacto</span>
                          <strong>{getValue(selectedSolicitud.canal_contacto)}</strong>
                        </div>
                        <div>
                          <span>Fecha de inicio</span>
                          <strong>{formatDate(selectedSolicitud.fecha_inicio)}</strong>
                        </div>
                        <div>
                          <span>Ãšltimo movimiento</span>
                          <strong>{formatDate(selectedSolicitud.fecha_ultimo_movimiento)}</strong>
                        </div>
                        <div>
                          <span>PrÃ³ximo contacto</span>
                          <strong>{formatDate(selectedSolicitud.fecha_proximo_contacto)}</strong>
                        </div>
                        <div>
                          <span>Resultado</span>
                          <strong>{getValue(selectedSolicitud.resultado)}</strong>
                        </div>
                        <div>
                          <span>Fecha de primera aplicaciÃ³n</span>
                          <strong>{formatDate(selectedSolicitud.fecha_primera_aplicacion)}</strong>
                        </div>
                        {normalizeSearchValue(selectedSolicitud.resultado).includes('negado') && (
                          <div><span>ReaplicaciÃ³n</span><ReapplicationIndicator date={selectedSolicitud.fecha_primera_aplicacion} /></div>
                        )}
                        <div>
                          <span>Encargado</span>
                          <strong>{getResponsableNombre(selectedSolicitud)}</strong>
                        </div>
                      </div>
                      <p className="solicitudes-nuevo-responsable-note">
                        El responsable normalmente se asigna cuando el pago inicial queda validado y el expediente llega al Ã¡rea correspondiente.
                      </p>
                      {responsableEditorOpen && (
                        <div className="solicitudes-nuevo-responsable-editor">
                          <label>
                            <span>Encargado responsable</span>
                            <select
                              value={responsableValue}
                              onChange={(event) => {
                                setResponsableValue(event.target.value);
                                setResponsableMessage('');
                              }}
                              disabled={empleadosLoading || responsableSaving}
                            >
                              <option value="">
                                {empleadosLoading ? 'Cargando empleados...' : 'Sin asignar'}
                              </option>
                              {empleados.map((empleado) => (
                                <option key={empleado.id_empleado} value={empleado.id_empleado}>
                                  {[empleado.nombre, empleado.apellidos].filter(hasValue).join(' ') || `Empleado ${empleado.id_empleado}`}
                                  {empleado.area ? ` - ${empleado.area}` : ''}
                                </option>
                              ))}
                            </select>
                          </label>
                          {responsableMessage && (
                            <div className="solicitudes-nuevo-message solicitudes-nuevo-message-inline">
                              {responsableMessage}
                            </div>
                          )}
                          <div>
                            <button type="button" onClick={() => setResponsableEditorOpen(false)} disabled={responsableSaving}>
                              Cancelar
                            </button>
                            <button type="button" onClick={handleSaveResponsable} disabled={responsableSaving || empleadosLoading}>
                              {responsableSaving ? 'Guardando...' : 'Guardar responsable'}
                            </button>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="solicitudes-nuevo-profile-card solicitudes-nuevo-operativo-card">
                      <header className="solicitudes-nuevo-profile-card-title solicitudes-nuevo-profile-card-title-split">
                        <div>
                          <FaHistory />
                          <h2>Seguimiento operativo</h2>
                        </div>
                        <button type="button" className="solicitudes-nuevo-operativo-open" onClick={handleOpenSeguimientoOperativo}>
                          <FaPlus /> Agregar seguimiento
                        </button>
                      </header>
                      <div className="solicitudes-nuevo-operativo-summary">
                        <div>
                          <span>Estado actual</span>
                          <strong>{getEstadoActual(selectedSolicitud)}</strong>
                        </div>
                        <div>
                          <span>Ãrea actual</span>
                          <strong>{getAreaActual(selectedSolicitud)}</strong>
                        </div>
                        <div>
                          <span>Responsable</span>
                          <strong>{getResponsableNombre(selectedSolicitud)}</strong>
                        </div>
                        <div>
                          <span>Ãšltimo movimiento</span>
                          <strong>{formatDate(selectedSolicitud.fecha_ultimo_movimiento)}</strong>
                        </div>
                        <div>
                          <span>PrÃ³ximo contacto</span>
                          <strong>{formatDate(selectedSolicitud.fecha_proximo_contacto)}</strong>
                        </div>
                      </div>
                      {seguimientoOperativoMessage && (
                        <div className="solicitudes-nuevo-message solicitudes-nuevo-message-inline">
                          {seguimientoOperativoMessage}
                        </div>
                      )}
                      {seguimientoOperativoOpen && (
                        <div className="solicitudes-nuevo-operativo-form">
                          <label>
                            <span>Nuevo estado</span>
                            <select
                              value={seguimientoOperativoForm.estado_nuevo}
                              onChange={(event) => setSeguimientoOperativoForm((current) => ({
                                ...current,
                                estado_nuevo: event.target.value,
                              }))}
                              disabled={estadosOperativosLoading || seguimientoOperativoSaving}
                            >
                              <option value="">
                                {estadosOperativosLoading ? 'Cargando estados...' : 'Seleccionar estado'}
                              </option>
                              {estadosOperativos.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                  {estado.valor}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="solicitudes-nuevo-operativo-wide">
                            <span>DescripciÃ³n</span>
                            <textarea
                              value={seguimientoOperativoForm.descripcion}
                              onChange={(event) => setSeguimientoOperativoForm((current) => ({
                                ...current,
                                descripcion: event.target.value,
                              }))}
                              placeholder="Describe el avance realizado"
                              disabled={seguimientoOperativoSaving}
                            />
                          </label>
                          <label>
                            <span>PrÃ³ximo contacto</span>
                            <input
                              type="date"
                              value={seguimientoOperativoForm.fecha_proximo_contacto}
                              onChange={(event) => setSeguimientoOperativoForm((current) => ({
                                ...current,
                                fecha_proximo_contacto: event.target.value,
                              }))}
                              disabled={seguimientoOperativoSaving}
                            />
                          </label>
                          <div className="solicitudes-nuevo-operativo-actions">
                            <button
                              type="button"
                              onClick={() => setSeguimientoOperativoOpen(false)}
                              disabled={seguimientoOperativoSaving}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveSeguimientoOperativo}
                              disabled={
                                seguimientoOperativoSaving ||
                                estadosOperativosLoading ||
                                !seguimientoOperativoForm.estado_nuevo ||
                                !seguimientoOperativoForm.descripcion.trim()
                              }
                            >
                              {seguimientoOperativoSaving ? 'Guardando...' : 'Guardar seguimiento'}
                            </button>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="solicitudes-nuevo-profile-card">
                      <header className="solicitudes-nuevo-profile-card-title">
                        <FaHistory />
                        <h2>Historial de AplicaciÃ³n</h2>
                      </header>
                      {(historyLoading || historyMessage) && (
                        <div className="solicitudes-nuevo-message solicitudes-nuevo-message-inline">
                          {historyLoading ? 'Cargando historial...' : historyMessage}
                        </div>
                      )}
                      <div className="solicitudes-nuevo-history">
                        {!historyLoading && seguimientos.length === 0 && (
                          <div className="solicitudes-nuevo-profile-empty">
                            Sin seguimientos registrados.
                          </div>
                        )}
                        {seguimientos.map((seguimiento) => (
                          <article
                            className="solicitudes-nuevo-history-item solicitudes-nuevo-history-complete"
                            key={seguimiento.id_seguimiento || `${seguimiento.creado_en}-${seguimiento.origen}`}
                          >
                            <span><FaCheck /></span>
                            <div>
                              <strong>{getSeguimientoTitle(seguimiento)}</strong>
                              <p>
                                Origen: {formatOrigen(seguimiento.origen)}
                              </p>
                              <p>
                                Estado: {getValue(seguimiento.estado_anterior)} â†’ {getValue(seguimiento.estado_nuevo)}
                              </p>
                              <p>
                                Seguimiento: {formatDate(seguimiento.fecha_seguimiento)}
                                <span> â€¢ </span>
                                Creado: {formatDate(seguimiento.creado_en)}
                              </p>
                            </div>
                          </article>
                        ))}
                        {false && hasValue(selectedSolicitud.fecha_cierre) && (
                          <article className="solicitudes-nuevo-history-item solicitudes-nuevo-history-complete">
                            <span><FaCheck /></span>
                            <div>
                              <strong>Solicitud cerrada</strong>
                              <p>{formatDate(selectedSolicitud.fecha_cierre)}</p>
                            </div>
                          </article>
                        )}
                        {false && (
                        <article className="solicitudes-nuevo-history-item solicitudes-nuevo-history-current">
                          <span><FaEye /></span>
                          <div>
                            <strong>{getValue(selectedSolicitud.estado_actual)}</strong>
                            <p>Estado actual del trÃ¡mite</p>
                          </div>
                        </article>
                        )}
                        {false && (
                        <article className="solicitudes-nuevo-history-item solicitudes-nuevo-history-complete">
                          <span><FaCheck /></span>
                          <div>
                            <strong>Registro inicial</strong>
                            <p>{formatDate(selectedSolicitud.fecha_inicio || selectedSolicitud.creado_en)}</p>
                          </div>
                        </article>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="solicitudes-nuevo-profile-column">
                    <section className="solicitudes-nuevo-profile-card solicitudes-nuevo-progress-card">
                      <header className="solicitudes-nuevo-profile-card-title solicitudes-nuevo-profile-card-title-split">
                        <div><FaCheck /><h2>Avance del expediente</h2></div>
                        <span>{resumenAvanceLoading ? 'Calculando...' : `Solicitud #${getValue(selectedSolicitud.id_solicitud)}`}</span>
                      </header>

                      {resumenAvanceMessage && (
                        <div className="solicitudes-nuevo-message">
                          {resumenAvanceMessage}
                        </div>
                      )}

                      <div className="solicitudes-nuevo-progress-metrics">
                        <div>
                          <span>Perfil</span>
                          <strong>{getValue(resumenAvance?.perfil?.porcentaje_completado)}%</strong>
                          <div className="solicitudes-nuevo-progress-bar">
                            <i style={{ width: `${Math.min(100, Number(resumenAvance?.perfil?.porcentaje_completado || 0))}%` }} />
                          </div>
                          <small>
                            {getValue(resumenAvance?.perfil?.campos_llenados)} de {getValue(resumenAvance?.perfil?.campos_totales)} campos
                          </small>
                        </div>
                        <div>
                          <span>Documentos obligatorios</span>
                          <strong>{getValue(resumenAvance?.documentos?.porcentaje_obligatorios)}%</strong>
                          <div className="solicitudes-nuevo-progress-bar">
                            <i style={{ width: `${Math.min(100, Number(resumenAvance?.documentos?.porcentaje_obligatorios || 0))}%` }} />
                          </div>
                          <small>
                            {getValue(resumenAvance?.documentos?.obligatorios_subidos)} de {getValue(resumenAvance?.documentos?.obligatorios)} subidos
                          </small>
                        </div>
                      </div>

                      <div className="solicitudes-nuevo-progress-chips">
                        <span className={resumenAvance?.perfil?.porcentaje_completado === 100 ? 'is-success' : 'is-warning'}>
                          {resumenAvance?.perfil?.porcentaje_completado === 100 ? 'Perfil completo' : 'Perfil incompleto'}
                        </span>
                        <span className={resumenAvance?.perfil?.pdf_generado ? 'is-success' : 'is-warning'}>
                          {resumenAvance?.perfil?.pdf_generado ? 'PDF generado' : 'PDF pendiente'}
                        </span>
                        <span className={resumenAvance?.documentos?.porcentaje_obligatorios === 100 ? 'is-success' : 'is-warning'}>
                          {resumenAvance?.documentos?.porcentaje_obligatorios === 100 ? 'Documentos completos' : 'Documentos pendientes'}
                        </span>
                      </div>

                      {resumenAvance?.faltantes?.length > 0 && (
                        <p className="solicitudes-nuevo-progress-missing">
                          Faltan: {resumenAvance.faltantes.slice(0, 3).join(', ')}
                        </p>
                      )}

                      <button type="button" className="solicitudes-nuevo-progress-link" onClick={handleScrollToDocumentos}>
                        Ver documentos
                      </button>
                    </section>

                    <section className="solicitudes-nuevo-profile-card">
                      <header className="solicitudes-nuevo-profile-card-title solicitudes-nuevo-profile-card-title-split">
                        <div><FaFolderOpen /><h2>Documentos Cargados</h2></div>
                        <span>{documentos.filter((documento) => !documento.es_reemplazado).length} archivos</span>
                      </header>

                      {(documentsLoading || documentsMessage) && (
                        <div className="solicitudes-nuevo-message">
                          {documentsLoading ? 'Cargando documentos...' : documentsMessage}
                        </div>
                      )}

                      <div className="solicitudes-nuevo-required-documents" id="solicitudes-documentos-requeridos">
                        <div className="solicitudes-nuevo-required-documents-head">
                          <strong>Documentos requeridos</strong>
                          <span>{groupRequiredDocuments(documentosRequeridos).length} requisitos</span>
                        </div>
                        {(documentosRequeridosLoading || documentosRequeridosMessage) && (
                          <div className={`solicitudes-nuevo-message ${documentosRequeridosMessage.includes('correctamente') ? '' : 'solicitudes-nuevo-message-error'}`}>
                            {documentosRequeridosLoading ? 'Cargando documentos requeridos...' : documentosRequeridosMessage}
                          </div>
                        )}
                        {!documentosRequeridosLoading && documentosRequeridos.length === 0 ? (
                          <div className="solicitudes-nuevo-profile-empty">
                            No hay documentos requeridos configurados para este trÃ¡mite.
                          </div>
                        ) : (
                          <RequiredDocumentsPanel requirements={documentosRequeridos} uploading={documentosRequeridosUploading} onPick={handleDocumentoRequeridoPicker} onUpload={handleUploadDocumentoRequerido} onPreview={handlePreview} onDownload={handleDownloadDocumentoRequerido} formatDate={formatDate} />
                        )}
                      </div>

                      {!documentsLoading && documentos.length === 0 ? (
                        <div className="solicitudes-nuevo-profile-empty">
                          No hay documentos registrados para este trÃ¡mite.
                        </div>
                      ) : (
                        <div className="solicitudes-nuevo-profile-documents">
                          {documentos.map((documento) => {
                            const status = getDocumentStatus(documento);
                            const hasPreview = hasValue(documento.drive_file_id) || hasValue(documento.web_view_link);
                            const hasDownload = hasValue(documento.drive_file_id) || hasValue(documento.web_content_link);
                            const legacyReference = getValue(documento.url_archivo);

                            return (
                              <article className="solicitudes-nuevo-profile-document" key={documento.id_documento}>
                                <div className="solicitudes-nuevo-profile-document-icon"><FaFileAlt /></div>
                                <div className="solicitudes-nuevo-profile-document-copy">
                                  <strong>{getValue(documento.nombre_documento)}</strong>
                                  <p>
                                    {getValue(documento.mime_type || documento.tipo_documento)}
                                    <span>â€¢</span>
                                    {formatFileSize(documento.tamano_bytes)}
                                    <span>â€¢</span>
                                    {formatDate(documento.fecha_subida)}
                                  </p>
                                  <span className={`solicitudes-nuevo-document-status solicitudes-nuevo-document-status-${status.tone}`}>
                                    {status.label}
                                  </span>
                                  {!hasPreview && !hasDownload && legacyReference !== 'N/A' && !isWebUrl(legacyReference) && (
                                    <code title={legacyReference}>{legacyReference}</code>
                                  )}
                                </div>
                                <div className="solicitudes-nuevo-profile-document-actions">
                                  {hasPreview && (
                                    <button type="button" onClick={() => handlePreview(documento)} title="Ver documento">
                                      <FaEye />
                                    </button>
                                  )}
                                  {hasDownload && (
                                    <button
                                      type="button"
                                      title="Descargar documento"
                                      onClick={() =>
                                        documento.drive_file_id
                                          ? descargarDocumento(documento)
                                          : openExternalLink(documento.web_content_link)
                                      }
                                    >
                                      <FaDownload />
                                    </button>
                                  )}
                                  {!hasPreview && !hasDownload && isWebUrl(legacyReference) && (
                                    <button type="button" onClick={() => openExternalLink(legacyReference)} title="Abrir documento">
                                      <FaEye />
                                    </button>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="solicitudes-nuevo-profile-card">
                      <header className="solicitudes-nuevo-profile-card-title">
                        <FaFileAlt />
                        <h2>Perfil del aplicante</h2>
                      </header>
                      {perfilLoading ? (
                        <div className="solicitudes-nuevo-applicant-profile-empty">
                          <strong>Cargando perfil...</strong>
                          <p>Consultando el perfil dinÃ¡mico del expediente.</p>
                        </div>
                      ) : perfilSolicitud ? (
                        <div className="solicitudes-nuevo-applicant-profile-summary">
                          <strong>Perfil creado</strong>
                          <div className="solicitudes-nuevo-applicant-profile-meta">
                            <span><small>Estado</small>{getValue(perfilSolicitud.estado)}</span>
                            <span><small>VersiÃ³n actual</small>{getValue(perfilSolicitud.version_actual)}</span>
                            <span><small>Actualizado</small>{formatDate(perfilSolicitud.actualizado_en)}</span>
                          </div>
                          <div className="solicitudes-nuevo-profile-actions-row">
                            <button type="button" onClick={handleOpenViewPerfil}>
                              <FaEye /> Ver perfil
                            </button>
                            <button type="button" onClick={handleOpenEditPerfil}>
                              <FaEdit /> Editar perfil
                            </button>
                            <button type="button" onClick={handleOpenPerfilVersiones}>
                              <FaHistory /> Ver versiones
                            </button>
                            <button type="button" disabled>
                              <FaDownload /> PDF prÃ³ximamente
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="solicitudes-nuevo-applicant-profile-empty">
                          <strong>Sin perfil creado</strong>
                          <p>Completa el formulario dinÃ¡mico segÃºn el trÃ¡mite y paÃ­s del aplicante.</p>
                          <button type="button" onClick={handleOpenCreatePerfil} disabled={perfilLoading}>
                            <FaPlusCircle /> Crear perfil
                          </button>
                        </div>
                      )}
                      {perfilMessage && (
                        <div className="solicitudes-nuevo-perfil-message">
                          {perfilMessage}
                        </div>
                      )}
                    </section>

                    {normalizeSearchValue(selectedSolicitud.resultado).includes('negado') && <NegadosProcessCard solicitud={selectedSolicitud} />}
                    <LegalProcessCard solicitud={selectedSolicitud} />
                    <SatisfactionSurveyCard idSolicitud={selectedSolicitud.id_solicitud} idCliente={selectedSolicitud.id_cliente || selectedSolicitud.cliente_id} />

                    {Number(selectedSolicitud.id_area_actual) === 4 && <AmaSolicitudActivity idSolicitud={selectedSolicitud.id_solicitud} />}
                    <SolicitudReviewNotes key={selectedSolicitud.id_solicitud} solicitud={selectedSolicitud} />
                  </div>
                </div>
              </>
            ) : (
              <div className="solicitudes-nuevo-profile-empty">No hay una solicitud seleccionada.</div>
            )}
          </main>
        )}
      <button type="button" className="solicitudes-nuevo-chat-button" title="Soporte">
        <FaComments />
      </button>

      {false && selectedSolicitud && (
        <div className="solicitudes-nuevo-modal-layer">
          <section className="solicitudes-nuevo-detail-modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <span>Expediente del aplicante</span>
                <h2>{buildClientName(selectedSolicitud)}</h2>
                <p>Solicitud #{getValue(selectedSolicitud.id_solicitud)}</p>
              </div>
              <button type="button" onClick={closeDetail} title="Cerrar"><FaTimes /></button>
            </header>

            <div className="solicitudes-nuevo-detail-scroll">
              {(detailLoading || detailMessage) && (
                <div className="solicitudes-nuevo-message">
                  {detailLoading ? 'Cargando detalle...' : detailMessage}
                </div>
              )}

              <section className="solicitudes-nuevo-detail-section">
                <div className="solicitudes-nuevo-section-title">
                  <span>01</span><div><h3>Datos de solicitud</h3><p>InformaciÃ³n general del trÃ¡mite.</p></div>
                </div>
                <div className="solicitudes-nuevo-detail-grid">
                  <DetailField label="ID solicitud">#{getValue(selectedSolicitud.id_solicitud)}</DetailField>
                  <DetailField label="Tipo de trÃ¡mite">{getValue(selectedSolicitud.tipo_nombre)}</DetailField>
                  <DetailField label="Estado">
                    <span className={`solicitudes-nuevo-status solicitudes-nuevo-status-${getSolicitudTone(selectedSolicitud.estado_actual)}`}>
                      {getValue(selectedSolicitud.estado_actual)}
                    </span>
                  </DetailField>
                  <DetailField label="Fecha de inicio">{formatDate(selectedSolicitud.fecha_inicio)}</DetailField>
                  <DetailField label="Fecha de cierre">{formatDate(selectedSolicitud.fecha_cierre)}</DetailField>
                  <DetailField label="Origen">{getValue(selectedSolicitud.origen_registro)}</DetailField>
                  <DetailField label="Observaciones" wide>{getValue(selectedSolicitud.observaciones)}</DetailField>
                </div>
              </section>

              <section className="solicitudes-nuevo-detail-section">
                <div className="solicitudes-nuevo-section-title">
                  <span>02</span><div><h3>Datos del cliente</h3><p>Contacto asociado al expediente.</p></div>
                </div>
                <div className="solicitudes-nuevo-detail-grid">
                  <DetailField label="ID cliente">{getValue(getClientId(selectedSolicitud))}</DetailField>
                  <DetailField label="Nombre completo">{buildClientName(selectedSolicitud)}</DetailField>
                  <DetailField label="TelÃ©fono">{getValue(selectedSolicitud.cliente_telefono)}</DetailField>
                  <DetailField label="Correo">{getValue(selectedSolicitud.cliente_correo)}</DetailField>
                </div>
              </section>

              <section className="solicitudes-nuevo-detail-section">
                <div className="solicitudes-nuevo-section-title">
                  <span>03</span><div><h3>Documentos</h3><p>Archivos y vinculaciÃ³n con Google Drive.</p></div>
                </div>

                {(documentsLoading || documentsMessage) && (
                  <div className="solicitudes-nuevo-message">
                    {documentsLoading ? 'Cargando documentos...' : documentsMessage}
                  </div>
                )}

                {!documentsLoading && documentos.length === 0 ? (
                  <div className="solicitudes-nuevo-empty">No hay documentos registrados.</div>
                ) : (
                  <div className="solicitudes-nuevo-documents-grid">
                    {documentos.map((documento) => {
                      const status = getDocumentStatus(documento);
                      const hasPreview = hasValue(documento.drive_file_id) || hasValue(documento.web_view_link);
                      const hasDownload = hasValue(documento.drive_file_id) || hasValue(documento.web_content_link);
                      const legacyReference = getValue(documento.url_archivo);

                      return (
                        <article className="solicitudes-nuevo-document" key={documento.id_documento}>
                          <div className="solicitudes-nuevo-document-head">
                            <div><FaFileAlt /></div>
                            <span className={`solicitudes-nuevo-document-status solicitudes-nuevo-document-status-${status.tone}`}>
                              {status.label}
                            </span>
                          </div>
                          <h4>{getValue(documento.nombre_documento)}</h4>
                          <p>Documento #{getValue(documento.id_documento)}</p>
                          <div className="solicitudes-nuevo-document-meta">
                            <span>{getValue(documento.mime_type || documento.tipo_documento)}</span>
                            <span>{formatFileSize(documento.tamano_bytes)}</span>
                            <span>{formatDate(documento.fecha_subida)}</span>
                          </div>
                          {!hasPreview && !hasDownload && legacyReference !== 'N/A' && !isWebUrl(legacyReference) && (
                            <code>{legacyReference}</code>
                          )}
                          <div className="solicitudes-nuevo-document-actions">
                            {hasPreview && <button type="button" onClick={() => handlePreview(documento)}><FaEye /> Ver</button>}
                            {hasDownload && (
                              <button
                                type="button"
                                onClick={() =>
                                  documento.drive_file_id
                                    ? descargarDocumento(documento)
                                    : openExternalLink(documento.web_content_link)
                                }
                              >
                                <FaDownload /> Descargar
                              </button>
                            )}
                            {!hasPreview && !hasDownload && isWebUrl(legacyReference) && (
                              <button type="button" onClick={() => openExternalLink(legacyReference)}>
                                <FaEye /> Abrir
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      )}

      {false && perfilModalMode && selectedSolicitud && (() => {
        const estructuraJson = getPerfilTemplateJson(perfilSolicitud, perfilPlantilla);
        const sections = getPerfilSections(estructuraJson);
        const visibleEntries = Object.entries(perfilFormValues || {}).filter(
          ([key]) => !['source_id', 'frontend_nuevo', 'migracion_google_sheets'].includes(String(key).toLowerCase())
        );
        const isFormMode = perfilModalMode === 'create' || perfilModalMode === 'edit';
        const modalTitle =
          perfilModalMode === 'create'
            ? 'Crear perfil'
            : perfilModalMode === 'edit'
              ? 'Editar perfil'
              : perfilModalMode === 'versions'
                ? 'Versiones del perfil'
                : 'Perfil del aplicante';

        return (
          <div className="solicitudes-nuevo-modal-layer">
            <section className="solicitudes-nuevo-detail-modal solicitudes-nuevo-perfil-modal" role="dialog" aria-modal="true">
              <header>
                <div>
                  <span>Perfil dinÃ¡mico</span>
                  <h2>{modalTitle}</h2>
                  <p>Solicitud #{getValue(selectedSolicitud.id_solicitud)} Â· {getTipoTramite(selectedSolicitud)}</p>
                </div>
                <button type="button" onClick={handleClosePerfilModal} title="Cerrar"><FaTimes /></button>
              </header>

              {isFormMode ? (
                <form className="solicitudes-nuevo-perfil-form" onSubmit={handleSavePerfil}>
                  <div className="solicitudes-nuevo-detail-scroll">
                    {sections.length === 0 ? (
                      <div className="solicitudes-nuevo-profile-empty">
                        La plantilla no tiene campos configurados.
                      </div>
                    ) : (
                      sections.map((section, sectionIndex) => (
                  <section
                    className="solicitudes-nuevo-perfil-section"
                    key={section.titulo || `perfil-section-${sectionIndex}`}
                  >
                    <div className="solicitudes-nuevo-perfil-section-head">
                      <div>
                        <span>SecciÃ³n {sectionIndex + 1} de {sections.length}</span>
                        <h3>{section.titulo || `SecciÃ³n ${sectionIndex + 1}`}</h3>
                      </div>
                      <strong>{perfilSectionHasValues(section) ? 'Con datos capturados' : 'Pendiente'}</strong>
                    </div>
                          <div className="solicitudes-nuevo-perfil-form-grid">
                            {(section.campos || []).map((field) => (
                              <label
                                className={field.type === 'textarea' ? 'solicitudes-nuevo-perfil-field-wide' : ''}
                                key={field.name}
                                htmlFor={`perfil-field-${field.name}`}
                              >
                                <span>
                                  {field.label || field.name}
                                  {field.required ? ' *' : ''}
                                </span>
                                {renderPerfilFieldInput(field)}
                              </label>
                            ))}
                          </div>
                        </section>
                      ))
                    )}
                    {perfilModalMessage && (
                      <div className="solicitudes-nuevo-perfil-message solicitudes-nuevo-perfil-message-error">
                        {perfilModalMessage}
                      </div>
                    )}
                  </div>
                  <div className="solicitudes-nuevo-perfil-modal-actions">
                    <button type="button" onClick={handleClosePerfilModal} disabled={perfilSaving}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={perfilSaving || sections.length === 0}>
                      {perfilSaving ? 'Guardando...' : 'Guardar perfil'}
                    </button>
                  </div>
                </form>
              ) : perfilModalMode === 'versions' ? (
                <div className="solicitudes-nuevo-detail-scroll">
                  {perfilVersionesLoading ? (
                    <div className="solicitudes-nuevo-profile-empty">Cargando versiones...</div>
                  ) : perfilModalMessage ? (
                    <div className="solicitudes-nuevo-perfil-message solicitudes-nuevo-perfil-message-error">
                      {perfilModalMessage}
                    </div>
                  ) : perfilVersiones.length === 0 ? (
                    <div className="solicitudes-nuevo-profile-empty">Sin versiones registradas.</div>
                  ) : (
                    <div className="solicitudes-nuevo-perfil-versiones">
                      {perfilVersiones.map((version) => {
                        const resumen = Object.entries(version.respuestas_json || {})
                          .filter(([key]) => !['source_id', 'frontend_nuevo', 'migracion_google_sheets'].includes(String(key).toLowerCase()))
                          .slice(0, 4);
                        return (
                          <article key={version.id_version}>
                            <div>
                        <strong>VersiÃ³n {getValue(version.version)}</strong>
                              <span>{formatDate(version.creado_en)}</span>
                            </div>
                            <p>{getValue(version.motivo_cambio)}</p>
                            {resumen.length > 0 && (
                              <ul>
                                {resumen.map(([key, value]) => (
                                  <li key={`${version.id_version}-${key}`}>
                                    {getPerfilFieldLabel(estructuraJson, key)}: {getValue(value)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="solicitudes-nuevo-detail-scroll">
                  <div className="solicitudes-nuevo-perfil-read-grid">
                    {visibleEntries.length === 0 ? (
                      <div className="solicitudes-nuevo-profile-empty">No hay respuestas registradas.</div>
                    ) : (
                      visibleEntries.map(([key, value]) => renderPerfilReadValue(estructuraJson, key, value))
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        );
      })()}

      {previewDocument && (
        <div className="solicitudes-nuevo-modal-layer solicitudes-nuevo-preview-layer">
          <section className="solicitudes-nuevo-preview-modal" role="dialog" aria-modal="true">
            <header>
              <div><span>Vista previa</span><h2>{getValue(previewDocument.nombre_documento)}</h2></div>
              <button type="button" onClick={() => setPreviewDocument(null)} title="Cerrar"><FaTimes /></button>
            </header>
            {getPreviewUrl(previewDocument) ? (
              <iframe
                title={getValue(previewDocument.nombre_documento)}
                src={getPreviewUrl(previewDocument)}
                allow="autoplay"
              />
            ) : (
              <div className="solicitudes-nuevo-empty">No hay vista previa disponible.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default SolicitudesNuevoPage;

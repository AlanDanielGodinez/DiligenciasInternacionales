const SUPPORTED_TYPES = new Set([
  'text', 'textarea', 'number', 'date', 'select', 'boolean', 'radio',
  'multiselect', 'email', 'phone', 'time', 'repeater',
]);

const isV2Template = (template = {}) => Number(template?.schema_version) === 2;

const hasValue = (value) => {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const comparable = (value) => (typeof value === 'string' ? value.trim() : value);

function evaluateCondition(condition, values = {}) {
  if (!condition) return true;
  if (Array.isArray(condition.all)) return condition.all.every((item) => evaluateCondition(item, values));
  if (Array.isArray(condition.any)) return condition.any.some((item) => evaluateCondition(item, values));
  if (condition.not) return !evaluateCondition(condition.not, values);

  const actual = values?.[condition.field];
  const expected = condition.value;
  switch (condition.operator || 'eq') {
    case 'eq': return comparable(actual) === comparable(expected);
    case 'neq': return comparable(actual) !== comparable(expected);
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'not_in': return Array.isArray(expected) && !expected.includes(actual);
    case 'exists': return hasValue(actual);
    case 'not_exists': return !hasValue(actual);
    case 'gt': return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    default: return false;
  }
}

const isFieldVisible = (field, values, fieldsByKey, seen = new Set()) => {
  if (!field || seen.has(field.key)) return false;
  const next = new Set(seen).add(field.key);
  const visibleCondition = (condition) => {
    if (!condition) return true;
    if (Array.isArray(condition.all)) return condition.all.every(visibleCondition);
    if (Array.isArray(condition.any)) return condition.any.some(visibleCondition);
    if (condition.not) return !visibleCondition(condition.not);
    const parent = fieldsByKey?.get(condition.field);
    return (!parent || isFieldVisible(parent, values, fieldsByKey, next)) && evaluateCondition(condition, values);
  };
  return visibleCondition(field.show_if);
};
const isFieldRequired = (field, values) => Boolean(field?.required) || (
  Boolean(field?.required_if) && evaluateCondition(field.required_if, values)
);
const isFieldEditable = (field, values) => !field?.editable_if || evaluateCondition(field.editable_if, values);

function validateEditableChanges(template, currentAnswers = {}, nextAnswers = {}, currentRepeaters = {}, nextRepeaters = {}) {
  const errors = [];
  const fail = (path, sectionId) => errors.push({
    path,
    section_id: sectionId,
    code: 'not_editable',
    message: 'El campo no es editable según las reglas actuales.',
  });

  for (const [sectionIndex, section] of sectionsOf(template).entries()) {
    const sectionId = section.id || `section_${sectionIndex + 1}`;
    for (const field of fieldsOf(section)) {
      if (!field?.key) continue;
      if (field.type !== 'repeater') {
        if (
          field.editable_if &&
          !isFieldEditable(field, nextAnswers) &&
          !isDeepStrictEqual(currentAnswers?.[field.key], nextAnswers?.[field.key])
        ) fail(field.key, sectionId);
        continue;
      }

      const currentItems = Array.isArray(currentRepeaters?.[field.key]) ? currentRepeaters[field.key] : [];
      const nextItems = Array.isArray(nextRepeaters?.[field.key]) ? nextRepeaters[field.key] : [];
      if (field.editable_if && !isFieldEditable(field, nextAnswers) && !isDeepStrictEqual(currentItems, nextItems)) {
        fail(field.key, sectionId);
        continue;
      }

      const currentByUuid = new Map(currentItems.map((item) => [item?.item_uuid, item]));
      const nextByUuid = new Map(nextItems.map((item) => [item?.item_uuid, item]));
      const uuids = new Set([...currentByUuid.keys(), ...nextByUuid.keys()]);
      for (const uuid of uuids) {
        const currentItem = currentByUuid.get(uuid);
        const nextItem = nextByUuid.get(uuid);
        const currentData = currentItem?.data && typeof currentItem.data === 'object' ? currentItem.data : currentItem || {};
        const nextData = nextItem?.data && typeof nextItem.data === 'object' ? nextItem.data : nextItem || {};
        const conditionValues = nextItem ? nextData : currentData;
        const itemIndex = nextItem ? nextItems.indexOf(nextItem) : currentItems.indexOf(currentItem);
        for (const child of Array.isArray(field.fields) ? field.fields : []) {
          if (
            child?.key && child.editable_if && !isFieldEditable(child, conditionValues) &&
            !isDeepStrictEqual(currentData?.[child.key], nextData?.[child.key])
          ) fail(`${field.key}[${itemIndex}].${child.key}`, sectionId);
        }
      }
    }
  }
  return errors;
}

function validateFieldValue(field, value) {
  if (!hasValue(value)) return [];
  const errors = [];
  const type = String(field?.type || 'text').toLowerCase();
  const fail = (code, message) => errors.push({ code, message });

  if (!SUPPORTED_TYPES.has(type)) fail('unsupported_type', `Tipo de campo no soportado: ${type}`);
  if (type === 'number' && (typeof value === 'boolean' || !Number.isFinite(Number(value)))) {
    fail('invalid_number', 'Debe ser un número válido.');
  }
  if (type === 'boolean' && typeof value !== 'boolean') fail('invalid_boolean', 'Debe ser verdadero o falso.');
  if (type === 'multiselect' && !Array.isArray(value)) fail('invalid_multiselect', 'Debe ser una lista.');
  if (type === 'date') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    const parsed = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
    if (!match || parsed.getUTCFullYear() !== Number(match[1]) || parsed.getUTCMonth() !== Number(match[2]) - 1 || parsed.getUTCDate() !== Number(match[3])) {
      fail('invalid_date', 'Debe ser una fecha válida.');
    }
  }
  if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) fail('invalid_email', 'Debe ser un correo electrónico válido.');
  if (type === 'phone' && !/^\+?[0-9\s().-]{7,24}$/.test(String(value))) fail('invalid_phone', 'Debe ser un teléfono válido.');
  if (type === 'time' && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(String(value))) fail('invalid_time', 'Debe ser una hora válida.');

  const allowsCustom = type === 'select' && (field.allow_custom_value || field.allow_other_values);
  if (['select', 'radio'].includes(type) && Array.isArray(field.options) && !allowsCustom) {
    const allowed = field.options.map((option) => (typeof option === 'object' ? option.value : option));
    if (!allowed.includes(value)) fail('invalid_option', 'La opción seleccionada no es válida.');
  }
  if (type === 'multiselect' && Array.isArray(value) && Array.isArray(field.options) && !(field.allow_custom_value || field.allow_other_values)) {
    const allowed = field.options.map((option) => (typeof option === 'object' ? option.value : option));
    if (value.some((item) => !allowed.includes(item))) fail('invalid_option', 'Una o más opciones no son válidas.');
  }

  const numeric = Number(value);
  if (field.min !== undefined && type === 'number' && numeric < Number(field.min)) fail('min', `El valor mínimo es ${field.min}.`);
  if (field.max !== undefined && type === 'number' && numeric > Number(field.max)) fail('max', `El valor máximo es ${field.max}.`);
  if (field.min_length !== undefined && String(value).length < Number(field.min_length)) fail('min_length', `La longitud mínima es ${field.min_length}.`);
  if (field.max_length !== undefined && String(value).length > Number(field.max_length)) fail('max_length', `La longitud máxima es ${field.max_length}.`);
  if (field.pattern) {
    try {
      if (!new RegExp(field.pattern).test(String(value))) fail('pattern', field.pattern_message || 'El formato no es válido.');
    } catch {
      fail('invalid_pattern', 'La expresión de validación de la plantilla no es válida.');
    }
  }
  return errors;
}

const sectionsOf = (template) => Array.isArray(template?.sections) ? template.sections : [];
const fieldsOf = (section) => Array.isArray(section?.fields) ? section.fields : [];

function inspectProfile(template, answers = {}, repeaters = {}, { complete = false } = {}) {
  const errors = [];
  const sectionStats = [];
  const fieldsByKey = new Map(sectionsOf(template).flatMap(fieldsOf).filter(field => field?.key).map(field => [field.key, field]));

  for (const [sectionIndex, section] of sectionsOf(template).entries()) {
    let requiredTotal = 0;
    let requiredComplete = 0;
    const sectionId = section.id || `section_${sectionIndex + 1}`;

    for (const field of fieldsOf(section)) {
      if (!field?.key || !isFieldVisible(field, answers, fieldsByKey)) continue;
      const path = field.key;
      const label = field.label || field.key;

      if (field.type === 'repeater') {
        const items = Array.isArray(repeaters?.[field.key]) ? repeaters[field.key] : [];
        const minimum = Number(field.min_items || (isFieldRequired(field, answers) ? 1 : 0));
        if (minimum > 0) {
          requiredTotal += 1;
          if (items.length >= minimum) requiredComplete += 1;
          else if (complete) errors.push({ path, section_id: sectionId, code: 'min_items', message: `${label}: agrega al menos ${minimum} registro(s).` });
        }
        if (field.max_items !== undefined && field.max_items !== null && items.length > Number(field.max_items)) {
          errors.push({ path, section_id: sectionId, code: 'max_items', message: `${label}: permite máximo ${field.max_items} registro(s).` });
        }
        items.forEach((item, itemIndex) => {
          const itemValues = item?.data && typeof item.data === 'object' ? item.data : item;
          for (const child of Array.isArray(field.fields) ? field.fields : []) {
            if (!child?.key || !isFieldVisible(child, itemValues, new Map((field.fields || []).map(item => [item.key, item])))) continue;
            const childPath = `${path}[${itemIndex}].${child.key}`;
            const required = isFieldRequired(child, itemValues);
            if (required) {
              requiredTotal += 1;
              if (hasValue(itemValues?.[child.key])) requiredComplete += 1;
              else if (complete) errors.push({ path: childPath, section_id: sectionId, code: 'required', message: `${child.label || child.key} es obligatorio.` });
            }
            validateFieldValue(child, itemValues?.[child.key]).forEach((error) => errors.push({ ...error, path: childPath, section_id: sectionId }));
          }
        });
        continue;
      }

      const required = isFieldRequired(field, answers);
      if (required) {
        requiredTotal += 1;
        if (hasValue(answers?.[field.key])) requiredComplete += 1;
        else if (complete) errors.push({ path, section_id: sectionId, code: 'required', message: `${label} es obligatorio.` });
      }
      validateFieldValue(field, answers?.[field.key]).forEach((error) => errors.push({ ...error, path, section_id: sectionId }));
    }

    sectionStats.push({
      id: sectionId,
      label: section.label || sectionId,
      required_total: requiredTotal,
      required_complete: requiredComplete,
      percentage: requiredTotal === 0 ? 100 : Math.round((requiredComplete / requiredTotal) * 100),
    });
  }

  const total = sectionStats.reduce((sum, section) => sum + section.required_total, 0);
  const completed = sectionStats.reduce((sum, section) => sum + section.required_complete, 0);
  return {
    valid: errors.length === 0,
    errors,
    completion: {
      percentage: total === 0 ? 100 : Math.round((completed / total) * 100),
      required_total: total,
      required_complete: completed,
      sections: sectionStats,
    },
  };
}

const validateProfile = (template, answers, repeaters, options) => inspectProfile(template, answers, repeaters, options);
// Capture progress is distinct from required-field validation.  Optional visible
// inputs are still part of the work of capturing a profile.
function calculateCompletion(template, answers = {}, repeaters = {}) {
  let total = 0;
  let completed = 0;
  const sections = [];
  const fieldsByKey = new Map(sectionsOf(template).flatMap(fieldsOf).filter(field => field?.key).map(field => [field.key, field]));
  const count = (field, values, value, scope = fieldsByKey) => {
    if (!field?.key || !isFieldVisible(field, values, scope) || field.technical || field.informational || field.capture_exclude) return;
    if (field.type === 'repeater') {
      total += 1;
      const items = Array.isArray(value) ? value : [];
      if (items.length) completed += 1;
      items.forEach((item) => {
        const itemValues = item?.data || item || {};
        const childScope = new Map((field.fields || []).map(child => [child.key, child]));
        (field.fields || []).forEach((child) => count(child, itemValues, itemValues[child.key], childScope));
      });
      return;
    }
    if (!SUPPORTED_TYPES.has(String(field.type || 'text').toLowerCase())) return;
    total += 1;
    if (hasValue(value)) completed += 1;
  };
  sectionsOf(template).forEach((section, index) => {
    const beforeTotal = total;
    const beforeCompleted = completed;
    fieldsOf(section).forEach((field) => count(field, answers, field.type === 'repeater' ? repeaters[field.key] : answers[field.key]));
    const sectionTotal = total - beforeTotal;
    const sectionCompleted = completed - beforeCompleted;
    sections.push({ id: section.id || `section_${index + 1}`, label: section.label || section.id || `section_${index + 1}`, required_total: sectionTotal, required_complete: sectionCompleted, percentage: sectionTotal ? Math.round(sectionCompleted / sectionTotal * 100) : 0 });
  });
  return { percentage: total ? Math.round(completed / total * 100) : 0, required_total: total, required_complete: completed, sections };
}

module.exports = {
  SUPPORTED_TYPES,
  isV2Template,
  hasValue,
  evaluateCondition,
  isFieldVisible,
  isFieldRequired,
  isFieldEditable,
  validateEditableChanges,
  validateFieldValue,
  validateProfile,
  calculateCompletion,
};
const { isDeepStrictEqual } = require('node:util');

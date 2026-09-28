import React from 'react';
import './ProfileFormRenderer.css';

export const hasProfileValue = (value) => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);

export const evaluateProfileCondition = (condition, values = {}) => {
  if (!condition) return true;
  if (Array.isArray(condition.all)) return condition.all.every((item) => evaluateProfileCondition(item, values));
  if (Array.isArray(condition.any)) return condition.any.some((item) => evaluateProfileCondition(item, values));
  if (condition.not) return !evaluateProfileCondition(condition.not, values);
  const actual = values?.[condition.field];
  switch (condition.operator || 'eq') {
    case 'eq': return actual === condition.value;
    case 'neq': return actual !== condition.value;
    case 'in': return Array.isArray(condition.value) && condition.value.includes(actual);
    case 'not_in': return Array.isArray(condition.value) && !condition.value.includes(actual);
    case 'exists': return hasProfileValue(actual);
    case 'not_exists': return !hasProfileValue(actual);
    case 'gt': return Number(actual) > Number(condition.value);
    case 'gte': return Number(actual) >= Number(condition.value);
    case 'lt': return Number(actual) < Number(condition.value);
    case 'lte': return Number(actual) <= Number(condition.value);
    default: return false;
  }
};

export const isProfileFieldVisible = (field, values, fieldsByKey, seen = new Set()) => {
  if (!field || seen.has(field.key)) return false;
  const next = new Set(seen).add(field.key);
  const visibleCondition = (condition) => {
    if (!condition) return true;
    if (Array.isArray(condition.all)) return condition.all.every(visibleCondition);
    if (Array.isArray(condition.any)) return condition.any.some(visibleCondition);
    if (condition.not) return !visibleCondition(condition.not);
    const parent = fieldsByKey?.get(condition.field);
    return (!parent || isProfileFieldVisible(parent, values, fieldsByKey, next)) && evaluateProfileCondition(condition, values);
  };
  return visibleCondition(field.show_if);
};

const optionValue = (option) => (typeof option === 'object' ? option.value : option);
const optionLabel = (option) => (typeof option === 'object' ? option.label : option);

const ProfileField = ({ field, values, onChange, disabled, error, pathPrefix = '', fieldsByKey }) => {
  const [customOption, setCustomOption] = React.useState('');
  if (!isProfileFieldVisible(field, values, fieldsByKey)) return null;
  const value = values?.[field.key] ?? (field.type === 'boolean' ? false : field.type === 'multiselect' ? [] : '');
  const required = Boolean(field.required) || (field.required_if && evaluateProfileCondition(field.required_if, values));
  const editable = !field.editable_if || evaluateProfileCondition(field.editable_if, values);
  const suggestedOptions = field.suggestions || field.options || [];
  const allowsCustom = Boolean(field.allow_custom_value || field.allow_other_values);
  const id = `profile-v2-${pathPrefix}${field.key}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const common = { id, disabled: disabled || !editable, required, 'aria-invalid': Boolean(error), onChange };
  let control;

  if (field.type === 'textarea') control = <textarea {...common} rows="4" value={value} onChange={(e) => onChange(e.target.value)} />;
  else if (field.type === 'select' && allowsCustom) control = <><input {...common} list={`${id}-options`} value={value} onChange={(e) => onChange(e.target.value)} /><datalist id={`${id}-options`}>{suggestedOptions.map((option) => <option key={String(optionValue(option))} value={optionValue(option)} label={optionLabel(option)} />)}</datalist></>;
  else if (field.type === 'select') control = <select {...common} value={value} onChange={(e) => onChange(e.target.value)}><option value="">Seleccione</option>{(field.options || []).map((option) => <option key={String(optionValue(option))} value={optionValue(option)}>{optionLabel(option)}</option>)}</select>;
  else if (field.type === 'radio') control = <div className="profile-v2-options">{(field.options || []).map((option) => <label key={String(optionValue(option))}><input type="radio" name={id} value={optionValue(option)} checked={value === optionValue(option)} disabled={common.disabled} required={required} onChange={() => onChange(optionValue(option))} />{optionLabel(option)}</label>)}</div>;
  else if (field.type === 'boolean') control = <label className="profile-v2-toggle"><input id={id} aria-label={field.label || field.key} type="checkbox" checked={value === true} disabled={common.disabled} onChange={(e) => onChange(e.target.checked)} /><span>{value === true ? 'Sí' : 'No'}</span></label>;
  else if (field.type === 'multiselect') {
    const current = Array.isArray(value) ? value : [];
    const known = suggestedOptions.map(optionValue);
    control = <div className="profile-v2-options">{suggestedOptions.map((option) => { const optionKey = optionValue(option); return <label key={String(optionKey)}><input type="checkbox" checked={current.includes(optionKey)} disabled={common.disabled} onChange={(e) => onChange(e.target.checked ? [...current, optionKey] : current.filter((item) => item !== optionKey))} />{optionLabel(option)}</label>; })}
      {allowsCustom && <><div className="profile-v2-custom-options">{current.filter(item => !known.includes(item)).map(item => <button key={item} type="button" disabled={common.disabled} onClick={() => onChange(current.filter(valueItem => valueItem !== item))}>{item} ×</button>)}</div><input aria-label={`Otro valor para ${field.label || field.key}`} value={customOption} disabled={common.disabled} onChange={event => setCustomOption(event.target.value)} /><button type="button" disabled={common.disabled || !customOption.trim()} onClick={() => { const next = customOption.trim(); if (!current.includes(next)) onChange([...current, next]); setCustomOption(''); }}>Agregar</button></>}
    </div>;
  }
  else control = <input {...common} value={value} min={field.min} max={field.max} minLength={field.min_length} maxLength={field.max_length} pattern={field.pattern} type={['number', 'date', 'email', 'time'].includes(field.type) ? field.type : field.type === 'phone' ? 'tel' : 'text'} onChange={(e) => onChange(field.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value)} />;

  return <div className={`profile-v2-field ${field.type === 'textarea' ? 'is-wide' : ''}`}><label htmlFor={id}>{field.label || field.key}{required ? ' *' : ''}</label>{control}{!editable && <small>Campo de sólo lectura según las reglas actuales.</small>}{error && <small className="profile-v2-error">{error.message}</small>}</div>;
};

const RepeatableGroup = ({ field, items, setItems, disabled, errors }) => {
  const fieldsByKey = new Map((field.fields || []).map((child) => [child.key, child]));
  const add = () => setItems([...items, { item_uuid: window.crypto?.randomUUID?.() || `draft-${Date.now()}-${items.length}`, data: {} }]);
  return <div className="profile-v2-repeater">
    <div className="profile-v2-repeater-head"><div><strong>{field.label || field.key}</strong><small>{field.min_items ? `Mínimo ${field.min_items}` : 'Opcional'}</small></div><button type="button" disabled={disabled || (field.max_items != null && items.length >= field.max_items)} onClick={add}>+ Agregar</button></div>
    {errors[field.key] && <small className="profile-v2-error">{errors[field.key].message}</small>}
    {!items.length && <p>Sin registros.</p>}
    <div className="profile-v2-repeater-list">{items.map((item, index) => {
      const data = item.data || {};
      return <article key={item.item_uuid || index}><header><strong>Registro {index + 1}</strong><button type="button" disabled={disabled} onClick={() => setItems(items.filter((_, current) => current !== index))}>Eliminar</button></header><div className="profile-v2-grid">{(field.fields || []).map((child) => {
        const path = `${field.key}[${index}].${child.key}`;
        return <ProfileField key={child.key} field={child} values={data} fieldsByKey={fieldsByKey} pathPrefix={`${field.key}-${index}-`} disabled={disabled} error={errors[path]} onChange={(value) => setItems(items.map((current, currentIndex) => currentIndex === index ? { ...current, data: { ...(current.data || {}), [child.key]: value } } : current))} />;
      })}</div></article>;
    })}</div>
  </div>;
};

const ProfileFormRenderer = ({ template, answers, setAnswers, repeaters, setRepeaters, errors = [], disabled = false, completion }) => {
  const errorsByPath = Object.fromEntries(errors.map((error) => [error.path, error]));
  const fieldsByKey = new Map((template.sections || []).flatMap((section) => section.fields || []).map((field) => [field.key, field]));
  return <div className="profile-v2-renderer">{(template.sections || []).map((section) => {
    const stat = completion?.sections?.find((item) => item.id === section.id);
    return <section className="profile-v2-section" key={section.id}><header><div><span>Sección</span><h3>{section.label || section.id}</h3></div>{stat && <strong>{stat.percentage}%</strong>}</header><div className="profile-v2-grid">{(section.fields || []).map((field) => field.type === 'repeater' ? (isProfileFieldVisible(field, answers, fieldsByKey) ? <RepeatableGroup key={field.key} field={field} items={repeaters[field.key] || []} setItems={(items) => setRepeaters((current) => ({ ...current, [field.key]: items }))} disabled={disabled} errors={errorsByPath} /> : null) : <ProfileField key={field.key} field={field} values={answers} fieldsByKey={fieldsByKey} disabled={disabled} error={errorsByPath[field.key]} onChange={(value) => setAnswers((current) => ({ ...current, [field.key]: value }))} />)}</div></section>;
  })}</div>;
};

export default ProfileFormRenderer;

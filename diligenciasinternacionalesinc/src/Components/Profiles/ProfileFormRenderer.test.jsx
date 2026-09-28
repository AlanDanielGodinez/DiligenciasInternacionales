import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProfileFormRenderer, { evaluateProfileCondition, isProfileFieldVisible } from './ProfileFormRenderer';

const template = {
  schema_version: 2,
  sections: [{ id: 'demo', label: 'Demo', fields: [
    { key: 'text', label: 'Texto', type: 'text' },
    { key: 'long', label: 'Área de texto', type: 'textarea' },
    { key: 'number', label: 'Número', type: 'number' },
    { key: 'date', label: 'Fecha', type: 'date' },
    { key: 'select', label: 'Selección', type: 'select', options: ['A', 'B'] },
    { key: 'boolean', label: 'Booleano', type: 'boolean' },
    { key: 'radio', label: 'Radio', type: 'radio', options: ['Uno', 'Dos'] },
    { key: 'multi', label: 'Múltiple', type: 'multiselect', options: ['X', 'Y'] },
    { key: 'email', label: 'Correo', type: 'email' },
    { key: 'phone', label: 'Teléfono', type: 'phone' },
    { key: 'time', label: 'Hora', type: 'time' },
    { key: 'conditional', label: 'Condicional', type: 'text', show_if: { field: 'boolean', operator: 'eq', value: true }, required_if: { field: 'boolean', operator: 'eq', value: true } },
    { key: 'locked', label: 'Bloqueado', type: 'text', editable_if: { field: 'boolean', operator: 'eq', value: true } },
    { key: 'family', label: 'Familiares', type: 'repeater', fields: [{ key: 'name', label: 'Nombre familiar', type: 'text', required: true }] },
  ] }],
};

const Harness = () => {
  const [answers, setAnswers] = useState({ boolean: false, locked: 'conservado' });
  const [repeaters, setRepeaters] = useState({});
  return <ProfileFormRenderer template={template} answers={answers} setAnswers={setAnswers} repeaters={repeaters} setRepeaters={setRepeaters} />;
};

test('renders every V2 field type and applies show/editable conditions', () => {
  render(<Harness />);
  expect(screen.getByLabelText('Texto')).toBeInTheDocument();
  expect(screen.getByLabelText('Área de texto')).toBeInTheDocument();
  expect(screen.getByLabelText('Número')).toHaveAttribute('type', 'number');
  expect(screen.getByLabelText('Fecha')).toHaveAttribute('type', 'date');
  expect(screen.getByLabelText('Selección')).toBeInTheDocument();
  expect(screen.getByLabelText('Correo')).toHaveAttribute('type', 'email');
  expect(screen.getByLabelText('Teléfono')).toHaveAttribute('type', 'tel');
  expect(screen.getByLabelText('Hora')).toHaveAttribute('type', 'time');
  expect(screen.getByLabelText(/Bloqueado/)).toBeDisabled();
  expect(screen.queryByLabelText(/Condicional/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: /Booleano/ }));
  expect(screen.getByLabelText(/Condicional/)).toBeRequired();
  expect(screen.getByLabelText(/Bloqueado/)).not.toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '+ Agregar' }));
  expect(screen.getByLabelText(/Nombre familiar/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Nombre familiar/), { target: { value: 'Juan' } });
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
  expect(screen.queryByLabelText(/Nombre familiar/)).not.toBeInTheDocument();
});

test('condition evaluator supports compound and comparison operators', () => {
  expect(evaluateProfileCondition({ all: [{ field: 'a', operator: 'gte', value: 2 }, { field: 'b', operator: 'in', value: ['x'] }] }, { a: 3, b: 'x' })).toBe(true);
  expect(evaluateProfileCondition({ field: 'missing', operator: 'not_exists' }, {})).toBe(true);
});

test('chained hidden fields stay hidden when their prior answers are retained', () => {
  const fields = new Map([
    ['a', { key: 'a' }],
    ['b', { key: 'b', show_if: { field: 'a', value: 'Sí' } }],
    ['c', { key: 'c', show_if: { field: 'b', value: 'Sí' } }],
  ]);
  expect(isProfileFieldVisible(fields.get('c'), { a: 'No', b: 'Sí', c: 'Guardado' }, fields)).toBe(false);
  expect(isProfileFieldVisible(fields.get('c'), { a: 'Sí', b: 'Sí', c: 'Guardado' }, fields)).toBe(true);
  fields.set('d', { key: 'd', show_if: { any: [{ field: 'b', value: 'Sí' }, { field: 'a', value: 'No' }] } });
  expect(isProfileFieldVisible(fields.get('d'), { a: 'No', b: 'Sí' }, fields)).toBe(true);
});

test('related repeater appears immediately and keeps records when hidden', () => {
  const relatedTemplate={schema_version:2,sections:[{id:'family',fields:[
    {key:'has_family',label:'Familiares directos',type:'select',options:['Sí','No']},
    {key:'family',label:'Familiares en Estados Unidos',type:'repeater',show_if:{field:'has_family',value:'Sí'},fields:[{key:'name',label:'Nombre familiar',type:'text'}]},
  ]}]};
  const RelatedHarness=()=>{
    const [answers,setAnswers]=useState({has_family:'No'});
    const [repeaters,setRepeaters]=useState({});
    return <ProfileFormRenderer template={relatedTemplate} answers={answers} setAnswers={setAnswers} repeaters={repeaters} setRepeaters={setRepeaters} />;
  };
  render(<RelatedHarness />);
  expect(screen.queryByText('Familiares en Estados Unidos')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Familiares directos'),{target:{value:'Sí'}});
  fireEvent.click(screen.getByRole('button',{name:'+ Agregar'}));
  fireEvent.change(screen.getByLabelText('Nombre familiar'),{target:{value:'Juan'}});
  fireEvent.change(screen.getByLabelText('Familiares directos'),{target:{value:'No'}});
  expect(screen.queryByLabelText('Nombre familiar')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Familiares directos'),{target:{value:'Sí'}});
  expect(screen.getByLabelText('Nombre familiar')).toHaveValue('Juan');
});

test('select with documented free values accepts a custom social network', () => {
  const socialTemplate={schema_version:2,sections:[{id:'social',fields:[
    {key:'network',label:'Red social',type:'select',suggestions:['Facebook','X'],allow_custom_value:true},
  ]}]};
  const SocialHarness=()=>{
    const [answers,setAnswers]=useState({});
    const [repeaters,setRepeaters]=useState({});
    return <ProfileFormRenderer template={socialTemplate} answers={answers} setAnswers={setAnswers} repeaters={repeaters} setRepeaters={setRepeaters} />;
  };
  render(<SocialHarness />);
  fireEvent.change(screen.getByLabelText('Red social'),{target:{value:'Nueva red'}});
  expect(screen.getByLabelText('Red social')).toHaveValue('Nueva red');
});

test('multiselect with open values adds and removes a custom choice', () => {
  const languageTemplate={schema_version:2,sections:[{id:'languages',fields:[
    {key:'languages',label:'Idiomas',type:'multiselect',suggestions:['Español'],allow_custom_value:true},
  ]}]};
  const LanguageHarness=()=>{
    const [answers,setAnswers]=useState({});
    const [repeaters,setRepeaters]=useState({});
    return <ProfileFormRenderer template={languageTemplate} answers={answers} setAnswers={setAnswers} repeaters={repeaters} setRepeaters={setRepeaters} />;
  };
  render(<LanguageHarness />);
  fireEvent.change(screen.getByLabelText('Otro valor para Idiomas'),{target:{value:'Nueva lengua'}});
  fireEvent.click(screen.getByRole('button',{name:'Agregar'}));
  expect(screen.getByRole('button',{name:'Nueva lengua ×'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Nueva lengua ×'}));
  expect(screen.queryByRole('button',{name:'Nueva lengua ×'})).not.toBeInTheDocument();
});

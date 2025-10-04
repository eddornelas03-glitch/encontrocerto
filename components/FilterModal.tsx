import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserPreferences } from '../types';
import {
  OBJETIVO_OPTIONS,
  SIGNOS,
  RELIGIOES,
  PORTE_FISICO_OPTIONS,
  PREF_FUMANTE_OPTIONS,
  PREF_CONSUMO_ALCOOL_OPTIONS,
} from '../constants';

interface FilterModalProps {
  onClose: () => void;
  onSave: (newPreferences: UserPreferences) => void;
}

const Label: React.FC<{
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ htmlFor, children, className }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-300 mb-2 ${className}`}
  >
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
  />
);

const CheckboxGroup: React.FC<{
    title: string;
    options: readonly string[];
    selected: string[];
    onChange: (option: string) => void;
}> = ({ title, options, selected, onChange }) => (
  <div>
    <Label className="mb-2">{title}</Label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`text-sm py-2 px-3 rounded-full border transition-colors ${
            selected.includes(option)
              ? 'bg-pink-500 border-pink-500 text-white'
              : 'bg-gray-800 border-gray-600 hover:border-pink-500'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export const FilterModal: React.FC<FilterModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  if (!user) return null;

  const [prefs, setPrefs] = useState<UserPreferences>({
    ...user.preferences, // Start with user's saved preferences
    // Reset fields with "Indiferente" option to default state on open
    porteFisicoDesejado: ['Indiferente'],
    fumanteDesejado: ['Indiferente'],
    consumoAlcoolDesejado: ['Indiferente'],
    signoDesejado: ['Indiferente'],
    religiaoDesejada: ['Indiferente'],
    petsDesejado: 'Indiferente',
    pcdDesejado: 'Indiferente',
    objetivoDesejado: ['Indiferente'],
  });

  const handleSave = () => {
    onSave(prefs);
  };

  const handleMultiSelectChange = (
    field: keyof UserPreferences,
    value: string,
  ) => {
    setPrefs((prev) => {
      const currentValues = (prev[field] as string[]) || [];
      let newValues: string[];

      if (value === 'Indiferente') {
        newValues = currentValues.includes('Indiferente') ? [] : ['Indiferente'];
      } else {
        const valuesWithoutIndiferente = currentValues.filter(
          (item) => item !== 'Indiferente',
        );
        if (valuesWithoutIndiferente.includes(value)) {
          newValues = valuesWithoutIndiferente.filter((item) => item !== value);
        } else {
          newValues = [...valuesWithoutIndiferente, value];
        }
      }
      
      if (newValues.length === 0) {
        newValues = ['Indiferente'];
      }
      return { ...prev, [field]: newValues };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]:
        name.includes('idade') ||
        name.includes('distancia') ||
        name.includes('altura')
          ? Number(value)
          : value,
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end sm:items-center z-40"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-white rounded-t-2xl sm:rounded-2xl shadow-lg w-full max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
          <button onClick={onClose} className="text-lg text-gray-300">
            Fechar
          </button>
          <h1 className="text-xl font-bold">Filtros de Busca</h1>
          <button onClick={handleSave} className="text-lg font-bold text-pink-500">
            Aplicar
          </button>
        </header>

        <main className="overflow-y-auto p-6 space-y-6">
          <div>
            <Label htmlFor="nomeDesejado">Buscar por nome</Label>
            <Input
              type="text"
              name="nomeDesejado"
              id="nomeDesejado"
              value={prefs.nomeDesejado}
              onChange={handleInputChange}
              placeholder="Digite um nome ou apelido..."
            />
            <p className="text-xs text-gray-500 mt-1 px-1">
              A busca por nome funciona apenas para perfis públicos.
            </p>
          </div>

          <div>
            <Label htmlFor="generoDesejado">Mostrar perfis de</Label>
            <Select
              id="generoDesejado"
              name="generoDesejado"
              value={prefs.generoDesejado}
              onChange={handleInputChange}
            >
              <option value="Todos">Todos</option>
              <option value="Homens">Homens</option>
              <option value="Mulheres">Mulheres</option>
            </Select>
          </div>

          <div>
            <Label>
              Distância Máxima:{' '}
              <span className="font-bold text-pink-400">
                {prefs.distanciaMaxima} km
              </span>
            </Label>
            <input
              id="distanciaMaxima"
              name="distanciaMaxima"
              type="range"
              min="1"
              max="500"
              value={prefs.distanciaMaxima}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          <div>
            <Label>Faixa de Idade</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                name="idadeMinima"
                value={prefs.idadeMinima}
                onChange={handleInputChange}
                className="text-center"
              />
              <span className="text-gray-400">até</span>
              <Input
                type="number"
                name="idadeMaxima"
                value={prefs.idadeMaxima}
                onChange={handleInputChange}
                className="text-center"
              />
            </div>
          </div>

          <div>
            <Label>Faixa de Altura (cm)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                name="alturaMinima"
                placeholder="Mínima"
                value={prefs.alturaMinima}
                onChange={handleInputChange}
                className="text-center"
              />
              <span className="text-gray-400">até</span>
              <Input
                type="number"
                name="alturaMaxima"
                placeholder="Máxima"
                value={prefs.alturaMaxima}
                onChange={handleInputChange}
                className="text-center"
              />
            </div>
          </div>

          <CheckboxGroup
            title="Objetivo no Relacionamento"
            options={OBJETIVO_OPTIONS}
            selected={prefs.objetivoDesejado}
            onChange={(v) => handleMultiSelectChange('objetivoDesejado', v)}
          />
          <CheckboxGroup
            title="Porte Físico"
            options={PORTE_FISICO_OPTIONS}
            selected={prefs.porteFisicoDesejado}
            onChange={(v) => handleMultiSelectChange('porteFisicoDesejado', v)}
          />
          <CheckboxGroup
            title="Hábito de Fumar"
            options={PREF_FUMANTE_OPTIONS}
            selected={prefs.fumanteDesejado}
            onChange={(v) => handleMultiSelectChange('fumanteDesejado', v)}
          />
          <CheckboxGroup
            title="Consumo de Álcool"
            options={PREF_CONSUMO_ALCOOL_OPTIONS}
            selected={prefs.consumoAlcoolDesejado}
            onChange={(v) => handleMultiSelectChange('consumoAlcoolDesejado', v)}
          />
          <CheckboxGroup
            title="Signo"
            options={SIGNOS}
            selected={prefs.signoDesejado}
            onChange={(v) => handleMultiSelectChange('signoDesejado', v)}
          />
          <CheckboxGroup
            title="Religião"
            options={RELIGIOES}
            selected={prefs.religiaoDesejada}
            onChange={(v) => handleMultiSelectChange('religiaoDesejada', v)}
          />

          <div>
            <Label htmlFor="petsDesejado">Tem Pets?</Label>
            <Select
              id="petsDesejado"
              name="petsDesejado"
              value={prefs.petsDesejado}
              onChange={handleInputChange}
            >
              <option value="Indiferente">Indiferente</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="pcdDesejado">PCD (Pessoa com Deficiência)</Label>
            <Select
              id="pcdDesejado"
              name="pcdDesejado"
              value={prefs.pcdDesejado}
              onChange={handleInputChange}
            >
              <option value="Indiferente">Indiferente</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </Select>
          </div>
        </main>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserPreferences, UserProfile } from '../types';
import {
  OBJETIVO_OPTIONS,
  SIGNOS,
  RELIGIOES,
  PORTE_FISICO_OPTIONS,
  PREF_FUMANTE_OPTIONS,
  PREF_CONSUMO_ALCOOL_OPTIONS,
} from '../constants';
import {
  BRAZILIAN_STATES,
} from '../data/brazilianLocations';

interface FilterModalProps {
  onClose: () => void;
  onSave: (newPreferences: UserPreferences) => void;
  allProfiles: UserProfile[];
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
    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-gray-700 border-gray-600 hover:border-red-500'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export const FilterModal: React.FC<FilterModalProps> = ({
  onClose,
  onSave,
  allProfiles,
}) => {
  const { user } = useAuth();
  if (!user) return null;

  const [prefs, setPrefs] = useState<UserPreferences>({ ...user.preferences });
  const [cities, setCities] = useState<string[]>([]);

  const availableStates = useMemo(() => {
    if (!allProfiles) return [];
    const statesWithUsers = [...new Set(allProfiles.map(p => p.state))];
    return BRAZILIAN_STATES
      .filter(state => statesWithUsers.includes(state.uf))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [allProfiles]);

  useEffect(() => {
    if (prefs.estadoDesejado && prefs.estadoDesejado !== 'Indiferente') {
      const citiesWithUsers = [
        ...new Set(
          allProfiles
            .filter((p) => p.state === prefs.estadoDesejado)
            .map((p) => p.city),
        ),
      ].sort();
      setCities(citiesWithUsers);
    } else {
      setCities([]);
    }
  }, [prefs.estadoDesejado, allProfiles]);

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

    // Handle special cases with cascading updates first
    if (name === 'estadoDesejado') {
      setPrefs((prev) => ({
        ...prev,
        estadoDesejado: value,
        cidadeDesejada: 'Indiferente', // Reset city when state changes
      }));
      return;
    }

    if (name === 'distanciaMaxima') {
      setPrefs((prev) => ({
        ...prev,
        distanciaMaxima: Number(value),
        estadoDesejado: 'Indiferente', // Reset location if distance is used
        cidadeDesejada: 'Indiferente',
      }));
      return;
    }

    // Handle generic case for all other fields
    const isNumber = [
      'idadeMinima',
      'idadeMaxima',
      'alturaMinima',
      'alturaMaxima',
    ].includes(name);
    const parsedValue = isNumber ? Number(value) : value;

    setPrefs((prev) => ({
      ...prev,
      [name]: parsedValue,
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
          <button onClick={handleSave} className="text-lg font-bold text-red-500">
            Aplicar
          </button>
        </header>

        <main className="overflow-y-auto p-6 space-y-6 no-scrollbar">
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

          {(!prefs.estadoDesejado || prefs.estadoDesejado === 'Indiferente') && (
            <>
              <div className="space-y-2">
                <Label>
                  Distância Máxima:{' '}
                  <span className="font-bold text-red-400">
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
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div className="text-center text-gray-400 my-2">ou</div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estadoDesejado">Estado</Label>
              <Select
                id="estadoDesejado"
                name="estadoDesejado"
                value={prefs.estadoDesejado}
                onChange={handleInputChange}
              >
                <option value="Indiferente">Todos</option>
                {availableStates.map((state) => (
                  <option key={state.uf} value={state.uf}>
                    {state.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="cidadeDesejada">Cidade</Label>
              <Select
                id="cidadeDesejada"
                name="cidadeDesejada"
                value={prefs.cidadeDesejada}
                onChange={handleInputChange}
                disabled={
                  !prefs.estadoDesejado ||
                  prefs.estadoDesejado === 'Indiferente'
                }
              >
                <option value="Indiferente">Todas</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500 px-1 -mt-4">
            Filtre por distância ou por cidade. Selecionar um estado irá ocultar
            o filtro de distância.
          </p>

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

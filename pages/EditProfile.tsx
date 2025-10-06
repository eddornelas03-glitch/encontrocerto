import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileEditor } from '../hooks/useProfileEditor';
import {
  ALL_INTERESTS,
  SIGNOS,
  RELIGIOES,
  FUMANTE_OPTIONS,
  CONSUMO_ALCOOL_OPTIONS,
  OBJETIVO_OPTIONS,
  PORTE_FISICO_OPTIONS,
  PREF_FUMANTE_OPTIONS,
  PREF_CONSUMO_ALCOOL_OPTIONS,
} from '../constants';

interface EditProfileProps {}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-red-500 border-b border-red-500/30 pb-2 mb-4">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Label: React.FC<{
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ htmlFor, children, className }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-300 mb-1 ${className}`}
  >
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
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

export const EditProfile: React.FC<EditProfileProps> = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    profile,
    preferences,
    isSaving,
    bioError,
    imageError,
    isAnalyzingImage,
    availableStates,
    availableCities,
    handleProfileChange,
    handleCheckboxChange,
    handleInterestToggle,
    handlePreferenceChange,
    handleMultiSelectPreferenceChange,
    handleImageUpload,
    handleRemoveImage,
    handleSave,
  } = useProfileEditor(() => navigate('/my-profile'));

  const onCancel = () => navigate(-1);

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col">
      <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 flex justify-between items-center p-4 border-b border-gray-700">
        <button onClick={onCancel} className="text-lg text-red-500">
          Cancelar
        </button>
        <h1 className="text-xl font-bold">Editar Perfil</h1>
        <button
          onClick={handleSave}
          disabled={isSaving || !!bioError}
          className="text-lg font-bold text-red-500 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </header>

      <main className="overflow-y-auto p-6 pb-24">
        <FormSection title="Fotos">
          <div className="grid grid-cols-3 gap-3">
            {profile.images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`Foto ${i + 1}`}
                  className="aspect-square w-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remover foto ${i + 1}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ))}
            {profile.images.length < 10 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzingImage}
                className="aspect-square w-full flex flex-col items-center justify-center bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:hover:text-current disabled:hover:border-gray-600"
                aria-label="Adicionar nova foto"
              >
                {isAnalyzingImage ? (
                  <>
                    <svg
                      className="animate-spin h-8 w-8 text-white mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-xs">Verificando...</span>
                  </>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
          {imageError && (
            <p className="text-red-500 text-sm mt-2">{imageError}</p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            disabled={isAnalyzingImage}
          />
        </FormSection>

        <FormSection title="Sobre Mim">
          <div>
            <Label htmlFor="apelido">Apelido</Label>
            <Input
              id="apelido"
              name="apelido"
              value={profile.apelido}
              onChange={handleProfileChange}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              rows={4}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 text-white ${
                bioError
                  ? 'border-red-500 ring-red-500'
                  : 'border-gray-600 focus:ring-red-500'
              }`}
            />
            {bioError && (
              <p className="text-red-500 text-xs mt-1">{bioError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Eu sou</Label>
              <Select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleProfileChange}
              >
                <option>Homem</option>
                <option>Mulher</option>
                <option>Outro</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                type="number"
                id="altura"
                name="altura"
                value={profile.altura}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <Label htmlFor="porteFisico">Porte Físico</Label>
              <Select
                id="porteFisico"
                name="porteFisico"
                value={profile.porteFisico}
                onChange={handleProfileChange}
              >
                <option>Atlético</option>
                <option>Normal</option>
                <option>Robusto</option>
                <option>Prefiro não dizer</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="fumante">Fumante</Label>
              <Select
                id="fumante"
                name="fumante"
                value={profile.fumante}
                onChange={handleProfileChange}
              >
                {FUMANTE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="consumoAlcool">Consumo de Álcool</Label>
              <Select
                id="consumoAlcool"
                name="consumoAlcool"
                value={profile.consumoAlcool}
                onChange={handleProfileChange}
              >
                {CONSUMO_ALCOOL_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="signo">Signo</Label>
              <Select
                id="signo"
                name="signo"
                value={profile.signo}
                onChange={handleProfileChange}
              >
                {SIGNOS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="religiao">Religião</Label>
              <Select
                id="religiao"
                name="religiao"
                value={profile.religiao}
                onChange={handleProfileChange}
              >
                {RELIGIOES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="pets">Tem pets?</Label>
              <Select
                id="pets"
                name="pets"
                value={profile.pets}
                onChange={handleProfileChange}
              >
                <option>Sim</option>
                <option>Não</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="relationshipGoal">Objetivo</Label>
              <Select
                id="relationshipGoal"
                name="relationshipGoal"
                value={profile.relationshipGoal}
                onChange={handleProfileChange}
              >
                <option>Relacionamento sério</option>
                <option>Algo casual</option>
                <option>Amizade</option>
                <option>Não tenho certeza</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="interesseEm">Tenho interesse em</Label>
              <Select
                id="interesseEm"
                name="interesseEm"
                value={profile.interesseEm}
                onChange={handleProfileChange}
              >
                <option>Homens</option>
                <option>Mulheres</option>
                <option>Todos</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
            <div>
              <Label htmlFor="pcd">PCD (Pessoa com Deficiência)</Label>
              <Select
                id="pcd"
                name="pcd"
                value={profile.pcd}
                onChange={handleProfileChange}
              >
                <option>Não</option>
                <option>Sim</option>
                <option>Prefiro não dizer</option>
              </Select>
            </div>
            {profile.pcd === 'Sim' && (
              <div className="transition-all duration-300 ease-in-out">
                <Label htmlFor="pcdTipo">Tipo de deficiência</Label>
                <Select
                  id="pcdTipo"
                  name="pcdTipo"
                  value={profile.pcdTipo || 'Física'}
                  onChange={handleProfileChange}
                >
                  <option>Física</option>
                  <option>Mental</option>
                  <option>Ambas</option>
                  <option>Prefiro não dizer</option>
                </Select>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Meus Interesses">
          <div>
            <Label htmlFor="interests">Selecione seus interesses</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`text-sm py-2 px-4 rounded-full border transition-colors ${
                    profile.interests.includes(interest)
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-gray-700 border-gray-600 hover:border-red-500'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Preferências para o Par Perfeito">
          <div>
            <Label htmlFor="generoDesejado">Mostrar perfis de</Label>
            <Select
              id="generoDesejado"
              name="generoDesejado"
              value={preferences.generoDesejado}
              onChange={handlePreferenceChange}
            >
              <option value="Todos">Todos</option>
              <option value="Homens">Homens</option>
              <option value="Mulheres">Mulheres</option>
            </Select>
          </div>

          {(!preferences.estadoDesejado ||
            preferences.estadoDesejado === 'Indiferente') && (
            <>
              <div className="space-y-2">
                <Label>
                  Distância Máxima:{' '}
                  <span className="font-bold text-red-500">
                    {preferences.distanciaMaxima} km
                  </span>
                </Label>
                <input
                  id="distanciaMaxima"
                  name="distanciaMaxima"
                  type="range"
                  min="1"
                  max="500"
                  value={preferences.distanciaMaxima}
                  onChange={handlePreferenceChange}
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
                value={preferences.estadoDesejado}
                onChange={handlePreferenceChange}
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
                value={preferences.cidadeDesejada}
                onChange={handlePreferenceChange}
                disabled={
                  !preferences.estadoDesejado ||
                  preferences.estadoDesejado === 'Indiferente'
                }
              >
                <option value="Indiferente">Todas</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500 px-1">
            Filtre por distância ou por cidade. Selecionar um estado irá ocultar
            o filtro de distância.
          </p>

          <div>
            <Label>Faixa de Idade</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                name="idadeMinima"
                value={preferences.idadeMinima}
                onChange={handlePreferenceChange}
                className="text-center"
              />
              <span className="text-gray-400">até</span>
              <Input
                type="number"
                name="idadeMaxima"
                value={preferences.idadeMaxima}
                onChange={handlePreferenceChange}
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
                value={preferences.alturaMinima}
                onChange={handlePreferenceChange}
                className="text-center"
              />
              <span className="text-gray-400">até</span>
              <Input
                type="number"
                name="alturaMaxima"
                placeholder="Máxima"
                value={preferences.alturaMaxima}
                onChange={handlePreferenceChange}
                className="text-center"
              />
            </div>
          </div>

          <CheckboxGroup
            title="Busca por Objetivo"
            options={OBJETIVO_OPTIONS}
            selected={preferences.objetivoDesejado}
            onChange={(v) => handleMultiSelectPreferenceChange('objetivoDesejado', v)}
          />
          <CheckboxGroup
            title="Porte Físico"
            options={PORTE_FISICO_OPTIONS}
            selected={preferences.porteFisicoDesejado}
            onChange={(v) =>
              handleMultiSelectPreferenceChange('porteFisicoDesejado', v)
            }
          />
          <CheckboxGroup
            title="Hábito de Fumar"
            options={PREF_FUMANTE_OPTIONS}
            selected={preferences.fumanteDesejado}
            onChange={(v) => handleMultiSelectPreferenceChange('fumanteDesejado', v)}
          />
          <CheckboxGroup
            title="Consumo de Álcool"
            options={PREF_CONSUMO_ALCOOL_OPTIONS}
            selected={preferences.consumoAlcoolDesejado}
            onChange={(v) =>
              handleMultiSelectPreferenceChange('consumoAlcoolDesejado', v)
            }
          />
          <CheckboxGroup
            title="Signo"
            options={SIGNOS}
            selected={preferences.signoDesejado}
            onChange={(v) => handleMultiSelectPreferenceChange('signoDesejado', v)}
          />
          <CheckboxGroup
            title="Religião"
            options={RELIGIOES}
            selected={preferences.religiaoDesejada}
            onChange={(v) => handleMultiSelectPreferenceChange('religiaoDesejada', v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="petsDesejado">Tem Pets?</Label>
              <Select
                id="petsDesejado"
                name="petsDesejado"
                value={preferences.petsDesejado}
                onChange={handlePreferenceChange}
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
                value={preferences.pcdDesejado}
                onChange={handlePreferenceChange}
              >
                <option value="Indiferente">Indiferente</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Funcionalidades">
          <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <div>
              <Label htmlFor="enableMessageSuggestions">
                Sugestões de Mensagem por IA
              </Label>
              <p className="text-xs text-gray-400 mt-1 pr-2">
                Receba sugestões inteligentes da IA para iniciar ou continuar
                conversas.
              </p>
            </div>
            <input
              type="checkbox"
              id="enableMessageSuggestions"
              name="enableMessageSuggestions"
              checked={preferences.enableMessageSuggestions}
              onChange={handlePreferenceChange}
              className="h-5 w-5 rounded text-red-500 bg-gray-700 border-gray-600 focus:ring-red-600 flex-shrink-0 ml-4"
            />
          </div>
        </FormSection>

        <FormSection title="Privacidade">
          <div>
            <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <Label htmlFor="isPubliclySearchable">
                Aparecer em buscas públicas
              </Label>
              <input
                type="checkbox"
                id="isPubliclySearchable"
                name="isPubliclySearchable"
                checked={profile.isPubliclySearchable}
                onChange={(e) =>
                  handleCheckboxChange('isPubliclySearchable', e.target.checked)
                }
                className="h-5 w-5 rounded text-red-500 bg-gray-700 border-gray-600 focus:ring-red-600"
              />
            </div>
            {profile.isPubliclySearchable && (
              <p className="text-xs text-gray-400 mt-2 px-1">
                Ao tornar seu perfil público, você poderá ser descoberto por
                outros usuários através da busca por nome.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <Label htmlFor="showLikes">Mostrar número de curtidas</Label>
            <input
              type="checkbox"
              id="showLikes"
              name="showLikes"
              checked={profile.showLikes}
              onChange={(e) => handleCheckboxChange('showLikes', e.target.checked)}
              className="h-5 w-5 rounded text-red-500 bg-gray-700 border-gray-600 focus:ring-red-600"
            />
          </div>
        </FormSection>
      </main>
    </div>
  );
};
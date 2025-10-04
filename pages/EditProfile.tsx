import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserPreferences } from '../types';
import { isTextOffensive } from '../services/geminiService';

interface EditProfileProps {
    onSave: () => void;
    onCancel: () => void;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-pink-400 border-b border-pink-400/30 pb-2 mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-300 mb-1 ${className}`}>{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white" />
);

const CheckboxGroup: React.FC<{ title: string; options: readonly string[]; selected: string[]; onChange: (option: string) => void; }> = ({ title, options, selected, onChange }) => (
    <div>
        <Label className="mb-2">{title}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`text-sm py-2 px-3 rounded-full border transition-colors ${selected.includes(option) ? 'bg-pink-500 border-pink-500 text-white' : 'bg-gray-800 border-gray-600 hover:border-pink-500'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export const EditProfile: React.FC<EditProfileProps> = ({ onSave, onCancel }) => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    if (!user) {
        return <div>Carregando...</div>;
    }

    const [profile, setProfile] = useState<UserProfile>(user.profile);
    const [preferences, setPreferences] = useState<UserPreferences>({
        ...user.preferences,
        // Ao entrar na tela de edição, reseta os filtros de múltipla escolha para 'Indiferente',
        // para uma experiência de edição limpa e consistente com a modal de filtros.
        porteFisicoDesejado: ['Indiferente'],
        fumanteDesejado: ['Indiferente'],
        consumoAlcoolDesejado: ['Indiferente'],
        signoDesejado: ['Indiferente'],
        religiaoDesejada: ['Indiferente'],
        petsDesejado: 'Indiferente',
        pcdDesejado: 'Indiferente',
        objetivoDesejado: ['Indiferente'],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [bioError, setBioError] = useState('');

    const allInterests = ['Viagens', 'Música', 'Cinema', 'Cozinhar', 'Esportes', 'Leitura', 'Tecnologia', 'Arte', 'Fotografia', 'Natureza'];
    const signos = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes', 'Indiferente'];
    const religioes = ['Católica', 'Evangélica', 'Espírita', 'Ateu(a)', 'Agnóstico(a)', 'Outra', 'Indiferente'];
    const fumanteOptions: UserProfile['fumante'][] = ['Não', 'Socialmente', 'Sim', 'Prefiro não dizer'];
    const consumoAlcoolOptions: UserProfile['consumoAlcool'][] = ['Não bebe', 'Socialmente', 'Frequentemente', 'Prefiro não dizer'];
    
    // Options for preferences
    const objetivoOptions: UserPreferences['objetivoDesejado'] = ['Relacionamento sério', 'Algo casual', 'Amizade', 'Não tenho certeza', 'Indiferente'];
    const porteFisicoOptions = ['Atlético', 'Normal', 'Robusto', 'Indiferente'];
    const prefFumanteOptions = ['Não', 'Socialmente', 'Sim', 'Indiferente'];
    const prefConsumoAlcoolOptions = ['Não bebe', 'Socialmente', 'Frequentemente', 'Indiferente'];

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'altura' || name === 'numLikes' ? Number(value) : value }));
    };
    
    const handleInterestToggle = (interest: string) => {
        setProfile(prev => {
            const interests = prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest];
            return { ...prev, interests };
        });
    };
    
    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ ...prev, [name]: (name.includes('idade') || name.includes('distancia') || name.includes('altura')) ? Number(value) : value }));
    };

    const handleMultiSelectPreferenceChange = (field: keyof UserPreferences, value: string) => {
        setPreferences(prev => {
            const currentValues = (prev[field] as string[]) || [];
            let newValues: string[];

            if (value === 'Indiferente') {
                newValues = currentValues.includes('Indiferente') ? [] : ['Indiferente'];
            } else {
                const valuesWithoutIndiferente = currentValues.filter(item => item !== 'Indiferente');
                if (valuesWithoutIndiferente.includes(value)) {
                    newValues = valuesWithoutIndiferente.filter(item => item !== value);
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

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        setBioError('');

        const isBioOffensive = await isTextOffensive(profile.bio);

        if (isBioOffensive) {
            setBioError('Sua bio viola as diretrizes da comunidade. Por favor, revise o texto.');
            setIsSaving(false);
            return;
        }

        updateUser({ ...user, profile, preferences });
        onSave();
        setIsSaving(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && profile.images.length < 10) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        }
        // Reset file input to allow uploading the same file again
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setProfile(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    return (
        <div className="h-full w-full bg-gray-900 text-white flex flex-col">
            <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 flex justify-between items-center p-4 border-b border-gray-700">
                <button onClick={onCancel} className="text-lg text-gray-300">Cancelar</button>
                <h1 className="text-xl font-bold">Editar Perfil</h1>
                <button onClick={handleSave} disabled={isSaving || !!bioError} className="text-lg font-bold text-pink-500 disabled:text-gray-500 disabled:cursor-not-allowed">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </header>
            
            <main className="overflow-y-auto p-6 pb-24">
                <FormSection title="Fotos">
                    <div className="grid grid-cols-3 gap-3">
                        {profile.images.map((img, i) => (
                             <div key={i} className="relative group">
                                <img src={img} alt={`Foto ${i+1}`} className="aspect-square w-full object-cover rounded-lg" />
                                <button
                                    onClick={() => handleRemoveImage(i)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remover foto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                             </div>
                        ))}
                        {profile.images.length < 10 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square w-full flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg hover:border-pink-500 hover:text-pink-500 transition-colors"
                                aria-label="Adicionar foto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                </FormSection>

                <FormSection title="Sobre Mim">
                     <div>
                        <Label htmlFor="apelido">Apelido</Label>
                        <Input id="apelido" name="apelido" value={profile.apelido} onChange={handleProfileChange} />
                    </div>
                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <textarea 
                            id="bio" 
                            name="bio" 
                            value={profile.bio} 
                            onChange={handleProfileChange} 
                            rows={4} 
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 text-white ${bioError ? 'border-red-500 ring-red-500' : 'border-gray-600 focus:ring-pink-500'}`} 
                        />
                        {bioError && <p className="text-red-500 text-xs mt-1">{bioError}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="altura">Altura (cm)</Label>
                            <Input type="number" id="altura" name="altura" value={profile.altura} onChange={handleProfileChange} />
                        </div>
                        <div>
                            <Label htmlFor="porteFisico">Porte Físico</Label>
                             <Select id="porteFisico" name="porteFisico" value={profile.porteFisico} onChange={handleProfileChange}>
                                <option>Atlético</option>
                                <option>Normal</option>
                                <option>Robusto</option>
                                <option>Prefiro não dizer</option>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="fumante">Fumante</Label>
                             <Select id="fumante" name="fumante" value={profile.fumante} onChange={handleProfileChange}>
                                {fumanteOptions.map(o => <option key={o}>{o}</option>)}
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="consumoAlcool">Consumo de Álcool</Label>
                             <Select id="consumoAlcool" name="consumoAlcool" value={profile.consumoAlcool} onChange={handleProfileChange}>
                                 {consumoAlcoolOptions.map(o => <option key={o}>{o}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="signo">Signo</Label>
                            <Select id="signo" name="signo" value={profile.signo} onChange={handleProfileChange}>
                                {signos.map(s => <option key={s}>{s}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="religiao">Religião</Label>
                            <Select id="religiao" name="religiao" value={profile.religiao} onChange={handleProfileChange}>
                                {religioes.map(r => <option key={r}>{r}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="pets">Tem pets?</Label>
                            <Select id="pets" name="pets" value={profile.pets} onChange={handleProfileChange}>
                                <option>Sim</option>
                                <option>Não</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="pcd">PCD (Pessoa com Deficiência)</Label>
                            <Select id="pcd" name="pcd" value={profile.pcd} onChange={handleProfileChange}>
                                <option>Não</option>
                                <option>Sim</option>
                                <option>Prefiro não dizer</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="relationshipGoal">Objetivo</Label>
                             <Select id="relationshipGoal" name="relationshipGoal" value={profile.relationshipGoal} onChange={handleProfileChange}>
                                <option>Relacionamento sério</option>
                                <option>Algo casual</option>
                                <option>Amizade</option>
                                <option>Não tenho certeza</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="interesseEm">Tenho interesse em</Label>
                             <Select id="interesseEm" name="interesseEm" value={profile.interesseEm} onChange={handleProfileChange}>
                                <option>Homens</option>
                                <option>Mulheres</option>
                                <option>Todos</option>
                            </Select>
                        </div>
                    </div>
                </FormSection>

                 <FormSection title="Meus Interesses">
                     <div>
                        <Label htmlFor="interests">Selecione seus interesses</Label>
                        <div className="flex flex-wrap gap-2">
                            {allInterests.map(interest => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => handleInterestToggle(interest)}
                                    className={`text-sm py-2 px-4 rounded-full border transition-colors ${
                                        profile.interests.includes(interest)
                                            ? 'bg-pink-500 border-pink-500 text-white'
                                            : 'bg-gray-800 border-gray-600 hover:border-pink-500'
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
                        <Select id="generoDesejado" name="generoDesejado" value={preferences.generoDesejado} onChange={handlePreferenceChange}>
                            <option value="Todos">Todos</option>
                            <option value="Homens">Homens</option>
                            <option value="Mulheres">Mulheres</option>
                        </Select>
                    </div>

                    <div>
                        <Label>Distância Máxima: <span className="font-bold text-pink-400">{preferences.distanciaMaxima} km</span></Label>
                        <input
                            id="distanciaMaxima"
                            name="distanciaMaxima"
                            type="range"
                            min="1"
                            max="500"
                            value={preferences.distanciaMaxima}
                            onChange={handlePreferenceChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                    </div>
                    
                    <div>
                        <Label>Faixa de Idade</Label>
                        <div className="flex items-center gap-4">
                            <Input type="number" name="idadeMinima" value={preferences.idadeMinima} onChange={handlePreferenceChange} className="text-center" />
                            <span className="text-gray-400">até</span>
                            <Input type="number" name="idadeMaxima" value={preferences.idadeMaxima} onChange={handlePreferenceChange} className="text-center" />
                        </div>
                    </div>
                    
                    <div>
                        <Label>Faixa de Altura (cm)</Label>
                        <div className="flex items-center gap-4">
                            <Input type="number" name="alturaMinima" placeholder="Mínima" value={preferences.alturaMinima} onChange={handlePreferenceChange} className="text-center" />
                             <span className="text-gray-400">até</span>
                            <Input type="number" name="alturaMaxima" placeholder="Máxima" value={preferences.alturaMaxima} onChange={handlePreferenceChange} className="text-center" />
                        </div>
                    </div>

                    <CheckboxGroup title="Busca por Objetivo" options={objetivoOptions} selected={preferences.objetivoDesejado} onChange={(v) => handleMultiSelectPreferenceChange('objetivoDesejado', v)} />
                    <CheckboxGroup title="Porte Físico" options={porteFisicoOptions} selected={preferences.porteFisicoDesejado} onChange={(v) => handleMultiSelectPreferenceChange('porteFisicoDesejado', v)} />
                    <CheckboxGroup title="Hábito de Fumar" options={prefFumanteOptions} selected={preferences.fumanteDesejado} onChange={(v) => handleMultiSelectPreferenceChange('fumanteDesejado', v)} />
                    <CheckboxGroup title="Consumo de Álcool" options={prefConsumoAlcoolOptions} selected={preferences.consumoAlcoolDesejado} onChange={(v) => handleMultiSelectPreferenceChange('consumoAlcoolDesejado', v)} />
                    <CheckboxGroup title="Signo" options={signos} selected={preferences.signoDesejado} onChange={(v) => handleMultiSelectPreferenceChange('signoDesejado', v)} />
                    <CheckboxGroup title="Religião" options={religioes} selected={preferences.religiaoDesejada} onChange={(v) => handleMultiSelectPreferenceChange('religiaoDesejada', v)} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="petsDesejado">Tem Pets?</Label>
                            <Select id="petsDesejado" name="petsDesejado" value={preferences.petsDesejado} onChange={handlePreferenceChange}>
                                <option value="Indiferente">Indiferente</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="pcdDesejado">PCD (Pessoa com Deficiência)</Label>
                            <Select id="pcdDesejado" name="pcdDesejado" value={preferences.pcdDesejado} onChange={handlePreferenceChange}>
                                <option value="Indiferente">Indiferente</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </Select>
                        </div>
                    </div>
                </FormSection>


                <FormSection title="Privacidade">
                    <div>
                        <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                            <Label htmlFor="isPubliclySearchable">Aparecer em buscas públicas</Label>
                            <input type="checkbox" id="isPubliclySearchable" name="isPubliclySearchable" checked={profile.isPubliclySearchable} onChange={e => setProfile(p => ({...p, isPubliclySearchable: e.target.checked}))} className="h-5 w-5 rounded text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-600" />
                        </div>
                        {profile.isPubliclySearchable && (
                            <p className="text-xs text-gray-400 mt-2 px-1">
                                Ao tornar seu perfil público, você poderá ser descoberto por outros usuários através da busca por nome, tanto na tela inicial (antes do login) quanto dentro do aplicativo. Isso aumenta sua visibilidade e chances de encontrar novas conexões.
                            </p>
                        )}
                    </div>
                     <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <Label htmlFor="showLikes">Mostrar número de curtidas</Label>
                        <input type="checkbox" id="showLikes" name="showLikes" checked={profile.showLikes} onChange={e => setProfile(p => ({...p, showLikes: e.target.checked}))} className="h-5 w-5 rounded text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-600" />
                    </div>
                </FormSection>
            </main>
        </div>
    );
};
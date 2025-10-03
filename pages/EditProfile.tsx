import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserPreferences } from '../types';

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

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white" />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} rows={4} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white" />
);


export const EditProfile: React.FC<EditProfileProps> = ({ onSave, onCancel }) => {
    const { user, updateUser } = useAuth();
    
    if (!user) {
        return <div>Carregando...</div>;
    }

    const [profile, setProfile] = useState<UserProfile>(user.profile);
    const [preferences, setPreferences] = useState<UserPreferences>(user.preferences);
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'altura' || name === 'numLikes' ? Number(value) : value }));
    };

    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ ...prev, [name]: Number(value) }));
    }

    const handleSave = () => {
        // Here you would call an API to save the data.
        // For this mock, we update the user in the AuthContext.
        updateUser({ ...user, profile, preferences });
        onSave();
    };
    
    return (
        <div className="h-full w-full bg-gray-900 text-white flex flex-col">
            <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 flex justify-between items-center p-4 border-b border-gray-700">
                <button onClick={onCancel} className="text-lg text-gray-300">Cancelar</button>
                <h1 className="text-xl font-bold">Editar Perfil</h1>
                <button onClick={handleSave} className="text-lg font-bold text-pink-500">Salvar</button>
            </header>
            
            <main className="overflow-y-auto p-6 pb-24">
                <FormSection title="Fotos">
                    <div className="grid grid-cols-3 gap-3">
                        {profile.images.map((img, i) => (
                             <img key={i} src={img} alt={`Foto ${i+1}`} className="aspect-square w-full object-cover rounded-lg" />
                        ))}
                         <div className="aspect-square w-full flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg">
                            <span className="text-gray-500 text-3xl">+</span>
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Sobre Mim">
                     <div>
                        <Label htmlFor="apelido">Apelido</Label>
                        <Input id="apelido" name="apelido" value={profile.apelido} onChange={handleProfileChange} />
                    </div>
                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} />
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
                                <option>Não</option>
                                <option>Socialmente</option>
                                <option>Sim</option>
                                <option>Prefiro não dizer</option>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="consumoAlcool">Consumo de Álcool</Label>
                             <Select id="consumoAlcool" name="consumoAlcool" value={profile.consumoAlcool} onChange={handleProfileChange}>
                                <option>Não bebo</option>
                                <option>Socialmente</option>
                                <option>Frequentemente</option>
                                <option>Prefiro não dizer</option>
                            </Select>
                        </div>
                    </div>
                </FormSection>

                 <FormSection title="Meus Interesses">
                     <div>
                        <Label htmlFor="interests">Interesses (separados por vírgula)</Label>
                        <Input id="interests" name="interests" value={profile.interests.join(', ')} onChange={e => setProfile(p => ({...p, interests: e.target.value.split(',').map(s => s.trim())}))} />
                    </div>
                </FormSection>

                <FormSection title="Preferências (Privado)">
                    <div>
                        <Label htmlFor="interesseEm">Tenho interesse em</Label>
                         <Select id="interesseEm" name="interesseEm" value={profile.interesseEm} onChange={handleProfileChange}>
                            <option>Homens</option>
                            <option>Mulheres</option>
                            <option>Todos</option>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="idadeMinima">Idade Mínima</Label>
                            <Input type="number" id="idadeMinima" name="idadeMinima" value={preferences.idadeMinima} onChange={handlePreferenceChange} />
                        </div>
                        <div>
                            <Label htmlFor="idadeMaxima">Idade Máxima</Label>
                            <Input type="number" id="idadeMaxima" name="idadeMaxima" value={preferences.idadeMaxima} onChange={handlePreferenceChange} />
                        </div>
                         <div>
                            <Label htmlFor="distanciaMaxima">Distância Máxima (km)</Label>
                            <Input type="number" id="distanciaMaxima" name="distanciaMaxima" value={preferences.distanciaMaxima} onChange={handlePreferenceChange} />
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Privacidade">
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <Label htmlFor="isPubliclySearchable">Aparecer em buscas públicas</Label>
                        <input type="checkbox" id="isPubliclySearchable" name="isPubliclySearchable" checked={profile.isPubliclySearchable} onChange={e => setProfile(p => ({...p, isPubliclySearchable: e.target.checked}))} className="toggle-checkbox" />
                    </div>
                     <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <Label htmlFor="showLikes">Mostrar número de curtidas</Label>
                        <input type="checkbox" id="showLikes" name="showLikes" checked={profile.showLikes} onChange={e => setProfile(p => ({...p, showLikes: e.target.checked}))} className="toggle-checkbox" />
                    </div>
                </FormSection>
            </main>
        </div>
    );
};
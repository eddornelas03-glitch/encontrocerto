import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';


interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await supabase.auth.signUp({ 
            email, 
            password, 
            options: { 
                data: { 
                    apelido: name 
                } 
            } 
        });
         if (error) {
            setError("Falha no cadastro. Tente outro e-mail.");
        }
        // The onAuthStateChange in AuthContext will handle navigation
        setLoading(false);
    };

    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-8 text-white bg-gray-900 overflow-y-auto">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold">Criar Conta Grátis</h1>
                    <p className="text-gray-400 mt-2">Comece sua jornada para encontrar o par perfeito.</p>
                </div>
                 <form onSubmit={handleSubmit}>
                     {error && <p className="mb-4 text-center text-red-400">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-400 text-sm font-bold mb-2">Seu Apelido</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Como você quer ser chamado(a)"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="voce@exemplo.com"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password"  className="block text-gray-400 text-sm font-bold mb-2">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Criando conta...' : 'Criar Meu Perfil Grátis'}
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-gray-400">
                        Já tem uma conta?{' '}
                        <button onClick={onNavigateToLogin} className="font-bold text-pink-500 hover:underline">
                            Entrar
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
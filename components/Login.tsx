import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';

interface LoginProps {
  onNavigateToRegister: () => void;
  onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateToRegister,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError('Falha no login. Verifique suas credenciais.');
    }
    // The onAuthStateChange in AuthContext will handle navigation
    setLoading(false);
  };

  return (
    <div className="relative h-full w-full flex flex-col justify-center items-center p-8 text-white bg-gray-900 overflow-y-auto">
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors z-10"
        aria-label="Voltar para a página inicial"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Entrar na sua Conta</h1>
          <p className="text-gray-400 mt-2">
            Continue sua busca pelo par perfeito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {error && <p className="mb-4 text-center text-red-400">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-400 text-sm font-bold mb-2"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-400 text-sm font-bold mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Não tem uma conta?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-red-500 hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
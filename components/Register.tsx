import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';

interface RegisterProps {
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
}

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

export const Register: React.FC<RegisterProps> = ({
  onNavigateToLogin,
  onBackToLanding,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'Homem' | 'Mulher' | 'Outro'>('Homem');
  const [interestedIn, setInterestedIn] = useState<'Homens' | 'Mulheres' | 'Todos'>('Mulheres');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          apelido: name,
          gender: gender,
          interested_in: interestedIn,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError('Falha no cadastro. Tente outro e-mail.');
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="h-full w-full flex flex-col justify-center items-center p-8 text-white bg-gray-900 text-center">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <MailIcon />
          </div>
          <h1 className="text-3xl font-bold">Verifique seu e-mail</h1>
          <p className="text-gray-300 mt-4">
            Enviamos um link de confirmação para{' '}
            <strong className="text-red-400">{email}</strong>. Por favor,
            clique no link para ativar sua conta.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="mt-8 w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Criar Conta Grátis</h1>
          <p className="text-gray-400 mt-2">
            Comece sua jornada para encontrar o par perfeito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {error && <p className="mb-4 text-center text-red-400">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-400 text-sm font-bold mb-2"
            >
              Seu Apelido
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer ser chamado(a)"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="gender" className="block text-gray-400 text-sm font-bold mb-2">Eu sou</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-4 py-3 bg-gray-700 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white">
                <option>Homem</option>
                <option>Mulher</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label htmlFor="interestedIn" className="block text-gray-400 text-sm font-bold mb-2">Interesse em</label>
              <select id="interestedIn" value={interestedIn} onChange={(e) => setInterestedIn(e.target.value as any)} className="w-full px-4 py-3 bg-gray-700 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white">
                <option>Mulheres</option>
                <option>Homens</option>
                <option>Todos</option>
              </select>
            </div>
          </div>
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
            {loading ? 'Criando conta...' : 'Criar Meu Perfil Grátis'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Já tem uma conta?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-bold text-red-500 hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
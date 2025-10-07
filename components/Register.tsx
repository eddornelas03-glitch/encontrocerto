import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';

interface RegisterProps {
  onNavigateToLogin: () => void;
  onGoogleLogin: () => void;
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

const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-3"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48px"
    height="48px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.082,5.571l6.19,5.238C39.988,36.106,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

export const Register: React.FC<RegisterProps> = ({
  onNavigateToLogin,
  onGoogleLogin,
  onBackToLanding,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Sua senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('user already registered')) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (error.message.toLowerCase().includes('password should be at least')) {
        setError('Sua senha é muito fraca. Ela deve ter pelo menos 6 caracteres.');
      } else {
        setError('Falha no cadastro. Tente outro e-mail.');
      }
    } else {
      setEmailSent(true);
    }
  };

  const handleGoogleSignUp = async () => {
    onGoogleLogin();
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

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex justify-center items-center bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
        >
          <GoogleIcon />
          Cadastrar com Google
        </button>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400">ou</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <form onSubmit={handleSubmit}>
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

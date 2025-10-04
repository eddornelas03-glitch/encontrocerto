import React, { useState } from 'react';

interface FakeGoogleLoginProps {
  onSuccess: () => void;
}

const GoogleLogo = () => (
  <svg
    className="w-20 h-auto"
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
      fill="#4285f4"
    />
    <path
      d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
      fill="#34a853"
    />
    <path
      d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
      fill="#fbbc04"
    />
    <path
      d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
      fill="#ea4335"
    />
  </svg>
);

export const FakeGoogleLogin: React.FC<FakeGoogleLoginProps> = ({
  onSuccess,
}) => {
  const [step, setStep] = useState(1); // 1 for email, 2 for password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSuccess();
    }, 1500); // Simulate network request
  };

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center bg-gray-50 text-gray-800 p-4 font-sans">
      <div className="w-full max-w-sm border border-gray-300 rounded-lg p-8 bg-white">
        <div className="flex flex-col items-center text-center">
          <GoogleLogo />
          <h1 className="text-2xl mt-4">Fazer login</h1>
          <p className="mt-2 text-gray-600">Use sua Conta do Google</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="mt-8 space-y-6">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail ou telefone"
                aria-label="E-mail ou telefone"
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="text-sm text-blue-600 font-semibold hover:underline cursor-pointer">
              Esqueceu seu e-mail?
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                className="text-blue-600 font-semibold text-sm hover:bg-blue-50 p-2 rounded"
              >
                Criar conta
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700"
              >
                Avançar
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="mt-8 space-y-6">
            <div className="text-center">
              <p className="text-sm">
                Para continuar, primeiro verifique se é você
              </p>
              <div className="inline-flex items-center gap-2 border rounded-full px-3 py-1 mt-3 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z"
                    clipRule="evenodd"
                  />
                </svg>
                {email || 'voce@exemplo.com'}
              </div>
            </div>
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                aria-label="Digite sua senha"
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <input
                  id="show-password"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="show-password"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Mostrar senha
                </label>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                className="text-blue-600 font-semibold text-sm hover:bg-blue-50 p-2 rounded"
              >
                Esqueceu a senha?
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700"
              >
                Fazer login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

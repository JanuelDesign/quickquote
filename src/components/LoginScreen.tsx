import React, { useState } from 'react';
import { QuickSurfacesLogo } from './QuickSurfacesLogo';
import { loginWithEmailAndPassword, getAuthErrorMessage } from '../services/authService';
import { UserProfile, Language } from '../types';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, ShieldCheck, Globe } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  language,
  onToggleLanguage
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage(
        language === 'en' 
          ? 'Please enter both email and password.' 
          : 'Por favor ingresa correo y contraseña.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const profile = await loginWithEmailAndPassword(email, password);
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      const msg = getAuthErrorMessage(code);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const isEn = language === 'en';

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 selection:bg-[#FF8407] selection:text-white">
      {/* Top Language Toggle */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-8 flex items-center bg-white border border-[#E4E2DA] rounded-full p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => onToggleLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            isEn ? 'bg-[#181818] text-[#FF8407]' : 'text-[#6B6A63] hover:text-black'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onToggleLanguage('es')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            !isEn ? 'bg-[#181818] text-[#FF8407]' : 'text-[#6B6A63] hover:text-black'
          }`}
        >
          ES
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#E4E2DA] shadow-xl p-7 sm:p-9 space-y-6">
          {/* Logo & Brand Heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-2 rounded-xl">
              <QuickSurfacesLogo className="h-10 sm:h-11 w-auto text-black" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F1EC] border border-[#E4E2DA] text-[10px] font-bold tracking-wider uppercase text-[#181818]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF8407]" />
                <span>QuickQuote Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#181818]">
                {isEn ? 'Sign In' : 'Iniciar Sesión'}
              </h1>
              <p className="text-xs text-[#6B6A63] max-w-xs mx-auto">
                {isEn 
                  ? 'Enter your credentials to access the sales and quotation system.' 
                  : 'Ingresa tus credenciales para acceder al sistema de cotizaciones.'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="font-medium flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-email" 
                className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6A63]"
              >
                {isEn ? 'Email Address' : 'Correo Electrónico'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C9A90]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@quicksurfaces.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl text-sm font-medium text-[#181818] placeholder:text-[#9C9A90] focus:outline-none focus:border-[#FF8407] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-password" 
                className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6A63]"
              >
                {isEn ? 'Password' : 'Contraseña'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C9A90]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl text-sm font-medium text-[#181818] placeholder:text-[#9C9A90] focus:outline-none focus:border-[#FF8407] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9C9A90] hover:text-[#181818] transition-colors cursor-pointer"
                  title={showPassword ? (isEn ? 'Hide password' : 'Ocultar contraseña') : (isEn ? 'Show password' : 'Ver contraseña')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#181818] hover:bg-black active:scale-[0.99] text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF8407]" />
                  <span>{isEn ? 'Verifying...' : 'Verificando...'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#FF8407] group-hover:translate-x-0.5 transition-transform" />
                  <span>{isEn ? 'Sign In' : 'Iniciar Sesión'}</span>
                </>
              )}
            </button>
          </form>

          {/* Informative Note: No public registration */}
          <div className="pt-4 border-t border-[#E4E2DA] text-center space-y-1 text-[11px] text-[#6B6A63]">
            <p className="font-semibold text-[#181818]">
              {isEn ? 'QuickSurfaces Team Access' : 'Acceso Exclusivo QuickSurfaces'}
            </p>
            <p>
              {isEn 
                ? 'User accounts are managed centrally by the administrator.' 
                : 'Las cuentas son creadas y asignadas manualmente por el administrador.'}
            </p>
          </div>
        </div>

        {/* Brand footer watermark */}
        <p className="mt-6 text-center text-xs text-[#9C9A90] font-medium">
          QuickSurfaces LLC • Flooring & Architectural Finishes
        </p>
      </div>
    </div>
  );
};

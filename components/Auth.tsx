import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
      <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C219.95,145.41,178.65,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
      <path d="M53.92,34.62a8,8,0,1,0-11.84,10.76l18.66,20.52C31.25,83.47,14,106.66,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm49.5,49.5a48,48,0,0,1,69.16,76.08l-9.06-10A32,32,0,0,0,128,160a32.13,32.13,0,0,0-21.2-8.31ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128c4.69-8.55,18.06-28.05,40.17-50.05l23.75,26.13A48,48,0,0,0,128,160c2.72,0,5.36-.42,7.91-1l24.3,26.74A127,127,0,0,1,128,192Zm103-33.25A133.46,133.46,0,0,0,231.05,128c-4.69,8.55-18,28-40.17,50l-22.37-24.6a47.85,47.85,0,0,0-43.19-73.81,47.33,47.33,0,0,0-5.87.54l-19.1-21A132.88,132.88,0,0,1,128,64c30.78,0,57.67,11.19,79.93,33.25A133.34,133.34,0,0,1,247.31,124.76,8,8,0,0,0,231,158.75Z"></path>
    </svg>
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (username.length < 3) throw new Error("Le pseudo doit contenir au moins 3 caractères");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: username
            }
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Vérifiez votre email pour confirmer l\'inscription.' });
      }
    } catch (error: any) {
      // Robust error handling
      let errorText = 'Une erreur est survenue';
      // ... previous error handling code ...
      if (typeof error === 'string') {
        errorText = error;
      } else if (error instanceof Error) {
        errorText = error.message;
      } else if (error?.error_description) {
        errorText = error.error_description;
      } else {
        errorText = "Erreur de connexion";
      }

      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl shadow-brand-500/10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-brand-500/30">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Prolow5
          </h1>
          <p className="text-gray-500 mt-2">Votre excellence financière</p>
        </div>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <Input
              label="Pseudo"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Votre pseudo"
              className="bg-white"
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.mg"
            className="bg-white"
          />
          <Input
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-white"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            }
          />

          {message && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-brand-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-brand-600 hover:text-brand-700 font-semibold hover:underline"
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};
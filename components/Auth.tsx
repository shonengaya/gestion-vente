import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Card } from './ui/Card';
import { Input } from './ui/Input';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Vérifiez votre email pour confirmer l\'inscription.' });
      }
    } catch (error: any) {
      // Robust error handling to prevent [object Object]
      let errorText = 'Une erreur est survenue';

      if (typeof error === 'string') {
        errorText = error;
      } else if (error instanceof Error) {
        errorText = error.message;
      } else if (error?.message) {
        errorText = typeof error.message === 'string'
          ? error.message
          : JSON.stringify(error.message);
      } else if (error?.error_description) {
        errorText = typeof error.error_description === 'string'
          ? error.error_description
          : JSON.stringify(error.error_description);
      } else {
        try {
          errorText = JSON.stringify(error);
        } catch {
          errorText = "Erreur inconnue (non sérialisable)";
        }
      }

      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-white"
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
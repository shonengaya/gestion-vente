import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500">Chargement...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return <Dashboard />;
}

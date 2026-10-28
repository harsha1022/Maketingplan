import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_ADMIN_KEY = 'cg_demo_admin_session';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // In demo mode: restore existing demo session from sessionStorage if present
      try {
        const stored = sessionStorage.getItem(DEMO_ADMIN_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // ignore parse error
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.is_demo_admin === true;

  async function signIn(email, password) {
    const trimmed = (email || '').trim().toLowerCase();
    
    // Always accept demo assessment credentials
    if (
      trimmed === 'admin@demo.campusgrowth' ||
      trimmed === 'admin@nxtwave.demo' ||
      trimmed === 'demo-admin@campusgrowth.local'
    ) {
      const demoUser = {
        id: 'demo-admin-uuid-001',
        email: trimmed,
        is_demo_admin: true,
        user_metadata: { role: 'admin' },
      };
      sessionStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      return { error: null };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        error: {
          message:
            'In demo mode, please use admin@demo.campusgrowth or click "Preview Demo Analytics & Dashboard".',
        },
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signInDemoAdmin() {
    const demoUser = {
      id: 'demo-admin-uuid-001',
      email: 'admin@demo.campusgrowth',
      is_demo_admin: true,
      user_metadata: { role: 'admin' },
    };
    sessionStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return { error: null };
  }

  async function signOut() {
    if (user?.is_demo_admin) {
      sessionStorage.removeItem(DEMO_ADMIN_KEY);
      setUser(null);
      return;
    }
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signInDemoAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { cleanupUserStorage } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      set({ 
        session, 
        user: session?.user ?? null,
        initialized: true,
        loading: false 
      });

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ 
          session,
          user: session?.user ?? null
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ 
        initialized: true,
        loading: false 
      });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ 
        user: data.user,
        session: data.session,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      set({ 
        user: data.user,
        session: data.session,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      // Cleanup user's storage before signing out
      await cleanupUserStorage();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ 
        user: null,
        session: null,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateEmail: async (newEmail) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ loading: true });
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: get().user?.email!,
        password: currentPassword,
      });
      
      if (signInError) throw new Error('Current password is incorrect');

      // Then update the password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setSession: (session) => {
    set({ 
      session,
      user: session?.user ?? null
    });
  },
}));
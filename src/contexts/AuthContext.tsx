import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios'; // axios TOKEN mode

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  wallet_balance?: number;
  photo_url?: string;
  user_metadata?: { full_name: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/user');

      const formattedUser = {
        ...data,
        user_metadata: { full_name: data.full_name },
      };

      setUser(formattedUser);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
    const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);

      await checkUser();

      return { error: null };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };


  const signOut = async () => {
    try {
      await api.post('/logout');
    } catch (_) {
 
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (data: any) => {
    const response = await api.post('/user/update', data);
    setUser(prev => (prev ? { ...prev, ...response.data.user } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

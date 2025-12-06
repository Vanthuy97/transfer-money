import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Khởi tạo state từ localStorage ngay lập tức để tránh delay
  const getInitialAuth = (): boolean => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  };

  const getInitialUser = (): User | null => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch {
        return null;
      }
    }
    return null;
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialAuth());
  const [user, setUser] = useState<User | null>(getInitialUser());

  const login = (username: string): void => {
    setIsAuthenticated(true);
    setUser({ username });
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify({ username }));
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "super_admin";
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authChecked: boolean;
  user: User | null;
  authError: string | null;
  checkUserAuth: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  socialLogin: (provider: string, data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_AZURE_API_BASE_URL || "/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, { withCredentials: true });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { 
        email, 
        password, 
        rememberMe 
      }, { withCredentials: true });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const message = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Login failed";
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setAuthError(null);
    try {
      await axios.post(`${API_BASE}/auth/register`, { name, email, password }, { withCredentials: true });
    } catch (err) {
      const message = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Registration failed";
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const socialLogin = useCallback(async (provider: string, data: Record<string, unknown>) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_BASE}/auth/social-login`, { 
        provider, 
        ...data 
      }, { withCredentials: true });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const message = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Social login failed";
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.get(`${API_BASE}/auth/logout`, { withCredentials: true });
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setAuthError(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email }, { withCredentials: true });
    } catch (err) {
      const message = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Failed to send reset email";
      throw new Error(message);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, { token, password }, { withCredentials: true });
    } catch (err) {
      const message = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Failed to reset password";
      throw new Error(message);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        user,
        authError,
        checkUserAuth,
        login,
        register,
        socialLogin,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

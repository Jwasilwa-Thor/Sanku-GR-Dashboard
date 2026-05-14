import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  name: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authChecked: boolean;
  user: User | null;
  /** `user_not_registered` shows a dedicated screen; other strings redirect to login. */
  authError: string | null;
  checkUserAuth: () => Promise<void>;
  login: (email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setAuthChecked(true);
        setIsLoadingAuth(false);
        resolve();
      }, 500);
    });
  }, []);

  const login = useCallback((email?: string) => {
    setAuthError(null);
    setIsAuthenticated(true);
    const trimmed = email?.trim();
    const local = trimmed?.includes("@") ? trimmed.split("@")[0] : "Demo user";
    const name = local ? local.charAt(0).toUpperCase() + local.slice(1) : "Demo user";
    setUser({ name, email: trimmed || "user@sanku.internal" });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setAuthError(null);
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
        logout,
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

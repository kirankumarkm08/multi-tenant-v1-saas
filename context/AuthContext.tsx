"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  isInitialized: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      console.log(
        "AuthContext - Loading token from localStorage:",
        storedToken ? "Present" : "Missing"
      );
      if (storedToken) {
        setTokenState(storedToken);
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setToken = (newToken: string) => {
    console.log(
      "AuthContext - Setting token:",
      newToken ? "Present" : "Missing"
    );
    localStorage.setItem("access_token", newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    console.log("AuthContext - Logging out, clearing token");
    localStorage.removeItem("access_token");
    setTokenState(null);
    router.push("/admin-login");
  };

  return (
    <AuthContext.Provider value={{ token, isInitialized, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // On mount — try /auth/me once. If it fails (no cookies), just set user null.
  // No retrying, no refresh attempt here.
  useEffect(() => {
    api
      .get<User>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Route guard — runs after loading is done
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.includes(location.pathname);
    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    if (!user && !isPublic) {
      navigate("/login", { replace: true });
    } else if (user && isAuthPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, location.pathname]);

  const login = async (email: string, password: string) => {
    const res = await api.post<User>("/auth/login", { email, password });
    setUser(res.data);
    navigate("/dashboard", { replace: true });
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await api.post<User>("/auth/signup", { email, password, name });
    setUser(res.data);
    navigate("/dashboard", { replace: true });
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
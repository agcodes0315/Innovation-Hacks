import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    api("/auth/me")
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setUser(data.user);
    },
    async register(name, email, password) {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      setToken(data.token);
      setUser(data.user);
    },
    logout() {
      setToken(null);
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

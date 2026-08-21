import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "bilheteria_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, role, token }
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setRestoring(false);
      return;
    }
    api
      .me(token)
      .then((me) => setUser({ email: me.email, role: me.role, token }))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setRestoring(false));
  }, []);

  async function login(email, password) {
    const { access_token } = await api.login(email, password);
    const me = await api.me(access_token);
    localStorage.setItem(STORAGE_KEY, access_token);
    setUser({ email: me.email, role: me.role, token: access_token });
  }

  async function register(email, password, role) {
    await api.register(email, password, role);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, restoring, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
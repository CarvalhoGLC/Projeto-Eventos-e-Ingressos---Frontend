import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "bilheteria_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, role, token }
  const [restoring, setRestoring] = useState(true);

  // Ao carregar a página, tenta restaurar a sessão — primeiro do
  // localStorage (login com "lembrar de mim"), depois do sessionStorage
  // (login sem "lembrar de mim", válido só nesta aba).
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!token) {
      setRestoring(false);
      return;
    }
    api
      .me(token)
      .then((me) => setUser({ email: me.email, role: me.role, token }))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setRestoring(false));
  }, []);

  async function login(email, password, remember = true) {
    const { access_token } = await api.login(email, password);
    const me = await api.me(access_token);

    // "Lembrar de mim" marcado: sobrevive a fechar o navegador (localStorage).
    // Desmarcado: some ao fechar a aba (sessionStorage).
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, access_token);

    setUser({ email: me.email, role: me.role, token: access_token });
  }

  async function register(email, password, role) {
    await api.register(email, password, role);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
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
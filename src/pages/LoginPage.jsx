import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Calendar,
  QrCode,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Select, Banner } from "../components/ui.jsx";

export default function LoginPage() {
  const { user, login, register, restoring } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (restoring) return null;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        await register(email, password, role);
        setMode("login");
        setError("");
        setBusy(false);
        return;
      }
      await login(email, password, remember);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="relative min-h-screen w-full bg-ink flex items-center justify-center px-6 overflow-hidden">
      {/* Fundo: foto de show + gradiente escuro para legibilidade */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.avif')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink" />
      <div className="pointer-events-none absolute inset-0 bg-ink/40" />

      {/* Bokeh sutil, por cima da foto */}
      <div className="pointer-events-none absolute top-16 left-[12%] w-40 h-40 rounded-full bg-brass/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 right-[15%] w-56 h-56 rounded-full bg-stampred/10 blur-3xl" />

      {/* Cartão principal do login/registro */}
      <div className="relative z-10 grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full border border-white/5 backdrop-blur-xl bg-ink2/70 animate-fadeInUp">
        
        {/* Painel Esquerdo: Texto Institucional */}
        <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-ink2/80 to-ink3/60">
          <h1 className="text-4xl leading-tight mb-4 font-display font-bold text-kraft">
            Toda entrada
            <br />
            começa aqui.
          </h1>
          <p className="text-sm text-muted mb-8">
            Organize eventos, reserve ingressos com QR Code assinado e valide
            entradas na portaria — tudo em um único guichê.
          </p>
          <div className="flex flex-col gap-2.5">
            <span className="inline-flex items-center gap-2 text-xs text-mutedlight bg-ink3/60 border border-white/5 rounded-full px-3.5 py-2">
              <Calendar className="w-3.5 h-3.5 text-brass shrink-0" /> Organizadores criam eventos
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-mutedlight bg-ink3/60 border border-white/5 rounded-full px-3.5 py-2">
              <QrCode className="w-3.5 h-3.5 text-brass shrink-0" /> Clientes reservam com QR único
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-mutedlight bg-ink3/60 border border-white/5 rounded-full px-3.5 py-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brass shrink-0" /> Portaria valida uma única vez
            </span>
          </div>
        </div>

        {/* Painel Direito: Formulário de Autenticação */}
        <div className="p-10 bg-ink/60 flex flex-col justify-center">
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-1">
            {isLogin ? "Entrar" : "Criar conta"}
          </h2>
          <p className="text-sm text-muted mb-6">
            {isLogin
              ? "Bem-vindo de volta — acesse sua conta."
              : "Preencha os dados para começar."}
          </p>

          {error && <Banner tone="error" onClose={() => setError("")}>{error}</Banner>}

          <form onSubmit={handleSubmit}>
            {/* Campo de E-mail */}
            <div className="relative mb-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full rounded-full pl-5 pr-12 py-3 text-sm bg-white/5 border border-white/10 text-slate-100 placeholder:text-mutedlight outline-none focus:border-brass transition-colors backdrop-blur-sm"
              />
              <User className="w-4 h-4 text-mutedlight absolute right-5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Campo de Senha */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full rounded-full pl-5 pr-12 py-3 text-sm bg-white/5 border border-white/10 text-slate-100 placeholder:text-mutedlight outline-none focus:border-brass transition-colors backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-mutedlight hover:text-brass"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === "register" && (
              <div className="mb-4">
                <span
                  className="block text-xs mb-1.5 uppercase tracking-wide text-mutedlight"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Papel
                </span>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="organizer">Organizador</option>
                  <option value="client">Cliente</option>
                  <option value="gate">Portaria</option>
                </Select>
              </div>
            )}

            {isLogin && (
              <label className="flex items-center gap-2 mb-6 text-sm text-mutedlight cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-brass w-4 h-4"
                />
                Lembrar de mim
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full py-3 text-sm font-semibold text-[#181008] bg-gradient-to-r from-brass to-brassdark hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brass/20"
            >
              {isLogin ? "Entrar" : "Criar conta"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-mutedlight mt-6">
            {isLogin ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-brass font-semibold hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-brass font-semibold hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Calendar,
  QrCode,
  ShieldCheck,
  ChevronRight,
  User,
  Eye,
  EyeOff,
  Ticket,
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
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    <div className="relative min-h-screen w-full bg-ink flex flex-col justify-between px-6 py-8 overflow-hidden text-slate-100">
      {/* Fundo com Imagem e Gradiente */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/login-bg.avif')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink" />

      {/* 1. TOPO: BARRA DE NAVEGAÇÃO (HEADER) */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2 text-xl font-bold font-display text-kraft">
          <Ticket className="w-6 h-6 text-brass" />
          <span>Bilheteria</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-mutedlight">
          <button onClick={() => setShowAuthModal(true)} className="hover:text-brass transition-colors">
            Criar Eventos
          </button>
          <button onClick={() => setShowAuthModal(true)} className="hover:text-brass transition-colors">
            Reservar Ingresso
          </button>
          <button onClick={() => setShowAuthModal(true)} className="hover:text-brass transition-colors">
            Validar Entrada
          </button>
        </nav>

        <button
          onClick={() => {
            setMode("login");
            setShowAuthModal(true);
          }}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#181008] bg-brass hover:bg-brassdark transition-all shadow-md shadow-brass/10"
        >
          Entrar / Cadastrar
        </button>
      </header>

      {/* 2. CENTRO: HERO SECTION */}
      <main className="relative z-10 max-w-4xl w-full mx-auto text-center my-auto py-12 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-kraft max-w-2xl leading-tight mb-6">
          Toda entrada começa aqui.
        </h1>
        <p className="text-base md:text-lg text-muted max-w-xl mb-8 leading-relaxed">
          Organize eventos, reserve ingressos com QR Code assinado e valide
          entradas na portaria — tudo em um único guichê.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => {
              setMode("register");
              setShowAuthModal(true);
            }}
            className="rounded-full px-8 py-3.5 text-sm font-semibold text-[#181008] bg-gradient-to-r from-brass to-brassdark hover:brightness-110 transition-all shadow-lg shadow-brass/20 flex items-center gap-2"
          >
            Começar Agora
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* 3. RODAPÉ DO HERO: CARDS DE DESTAQUE */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto grid md:grid-cols-3 gap-4 pt-6">
        <div className="bg-ink2/70 border border-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ink3/80 text-brass">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Criar Eventos</h3>
            <p className="text-xs text-muted">Organizadores criam e gerenciam eventos facilmente.</p>
          </div>
        </div>

        <div className="bg-ink2/70 border border-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ink3/80 text-brass">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Reservar Ingresso</h3>
            <p className="text-xs text-muted">Clientes reservam assentos com QR único e seguro.</p>
          </div>
        </div>

        <div className="bg-ink2/70 border border-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ink3/80 text-brass">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Validar Entrada</h3>
            <p className="text-xs text-muted">Portaria valida e confirma o acesso uma única vez.</p>
          </div>
        </div>
      </footer>

      {/* MODAL DE LOGIN / REGISTRO */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-ink2 border border-white/10 rounded-2xl p-8 shadow-2xl animate-fadeInUp">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-slate-100 text-sm"
            >
              ✕
            </button>

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
              <div className="relative mb-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="w-full rounded-full pl-5 pr-12 py-3 text-sm bg-white/5 border border-white/10 text-slate-100 placeholder:text-mutedlight outline-none focus:border-brass transition-colors"
                />
                <User className="w-4 h-4 text-mutedlight absolute right-5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full rounded-full pl-5 pr-12 py-3 text-sm bg-white/5 border border-white/10 text-slate-100 placeholder:text-mutedlight outline-none focus:border-brass transition-colors"
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
                  <span className="block text-xs mb-1.5 uppercase tracking-wide text-mutedlight">
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
                className="w-full rounded-full py-3 text-sm font-semibold text-[#181008] bg-gradient-to-r from-brass to-brassdark hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brass/20"
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
      )}
    </div>
  );
}
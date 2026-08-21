import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, ChevronRight, Calendar, QrCode, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Eyebrow, Field, TextInput, Select, Button, Banner } from "../components/ui.jsx";

export default function LoginPage() {
  const { user, login, register, restoring } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
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
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

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

      {/* Cartão do guichê */}
      <div className="relative z-10 grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full border border-white/5 backdrop-blur-xl bg-ink2/70 animate-fadeInUp">
        <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-ink2/80 to-ink3/60">
          <Eyebrow>Guichê Nº 1</Eyebrow>
          <h1 className="text-3xl leading-tight mb-3 font-display font-bold text-kraft">
            Toda entrada
            <br />
            começa aqui.
          </h1>
          <p className="text-sm text-muted">
            Organize eventos, reserve ingressos com QR Code assinado e valide
            entradas na portaria — tudo em um único guichê.
          </p>
          <div className="mt-8 space-y-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brass" /> Organizadores criam eventos
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-brass" /> Clientes reservam com QR único
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brass" /> Portaria valida uma única vez
            </div>
          </div>
        </div>

        <div className="p-10 bg-ink/60">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 text-sm py-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                mode === "login" ? "bg-brass text-[#181008]" : "bg-ink3/80 text-mutedlight hover:bg-ink3"
              }`}
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 text-sm py-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                mode === "register" ? "bg-brass text-[#181008]" : "bg-ink3/80 text-mutedlight hover:bg-ink3"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Cadastrar
            </button>
          </div>

          {error && <Banner tone="error" onClose={() => setError("")}>{error}</Banner>}

          <form onSubmit={handleSubmit}>
            <Field label="E-mail">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
              />
            </Field>
            <Field label="Senha">
              <TextInput
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {mode === "register" && (
              <Field label="Papel">
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="organizer">Organizador</option>
                  <option value="client">Cliente</option>
                  <option value="gate">Portaria</option>
                </Select>
              </Field>
            )}

            <Button type="submit" loading={busy} className="w-full mt-2">
              {mode === "login" ? "Entrar" : "Criar conta"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
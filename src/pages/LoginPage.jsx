import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Calendar,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  User,
  Eye,
  EyeOff,
  Ticket,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Select, Banner } from "../components/ui.jsx";

// Lista de imagens para o carrossel 3D
const CAROUSEL_IMAGES = [
  {
    url: "/login-bg.avif",
    alt: "Show ao vivo",
    title: "Festivais e Shows",
  },
  {
    url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=80",
    alt: "Festival de música",
    title: "Experiências Únicas",
  },
  {
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    alt: "Palco iluminado",
    title: "Entradas Validadas",
  },
  {
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    alt: "Iluminação de palco",
    title: "QR Code Seguro",
  },
];

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

  // Estado do carrossel 3D
  const [currentIndex, setCurrentIndex] = useState(0);

  // Transição fluida automática a cada 3.5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

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

      {/* 1. TOPO: BARRA DE NAVEGAÇÃO */}
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
      <main className="relative z-10 max-w-5xl w-full mx-auto text-center my-auto py-4 flex flex-col items-center">
        {/* Título Destacado */}
        <h1 className="text-4xl md:text-6xl font-display font-bold text-kraft max-w-2xl leading-tight mb-4">
          Toda entrada começa aqui.
        </h1>

        {/* CARROSSEL FLUIDO E 3D COM BORDAS DESFOCADAS */}
        <div className="relative w-full max-w-4xl h-72 md:h-96 my-2 flex items-center justify-center group perspective-[1200px]">
          
          {/* Container dos Cards 3D */}
          <div className="relative w-full h-full flex items-center justify-center">
            {CAROUSEL_IMAGES.map((image, index) => {
              // Cálculo da posição relativa em relação ao slide ativo
              const total = CAROUSEL_IMAGES.length;
              let offset = (index - currentIndex + total) % total;
              if (offset > total / 2) offset -= total;

              const isCenter = offset === 0;
              const isLeft = offset === -1 || (offset < 0 && offset < -1);
              const isRight = offset === 1 || (offset > 0 && offset > 1);

              // Estilos 3D baseados na distância do slide central
              let transformStyle = "translate3d(0, 0, -300px) scale(0.6) rotateY(0deg)";
              let opacity = 0;
              let zIndex = 0;

              if (isCenter) {
                transformStyle = "translate3d(0, 0, 0) scale(1) rotateY(0deg)";
                opacity = 1;
                zIndex = 30;
              } else if (offset === -1) {
                transformStyle = "translate3d(-55%, 0, -150px) scale(0.82) rotateY(25deg)";
                opacity = 0.65;
                zIndex = 20;
              } else if (offset === 1) {
                transformStyle = "translate3d(55%, 0, -150px) scale(0.82) rotateY(-25deg)";
                opacity = 0.65;
                zIndex = 20;
              }

              return (
                <div
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    transform: transformStyle,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  className="absolute w-[280px] sm:w-[360px] md:w-[440px] h-[220px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
                >
                  {/* Máscara de vinheta/desfocagem suave nas bordas */}
                  <div className="absolute inset-0 z-10 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/15 backdrop-blur-[1px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

                  {/* Imagem com desfoque de borda suave */}
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover rounded-3xl transition-transform duration-700 hover:scale-105"
                  />

                  {/* Sombra interna para suavizar ainda mais as extremidades */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-ink via-transparent to-black/30 opacity-80" />

                  {/* Título interno do card */}
                  {isCenter && (
                    <div className="absolute bottom-5 left-6 z-30 text-left animate-fadeIn">
                      <span className="text-xs uppercase tracking-widest text-brass font-semibold">
                        Destaque
                      </span>
                      <h3 className="text-lg md:text-xl font-bold text-slate-100 drop-shadow-md">
                        {image.title}
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Máscara de gradiente lateral para desfocar a transição das bordas da tela */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent z-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent z-40" />

          {/* Botões do Carrossel 3D */}
          <button
            onClick={prevSlide}
            className="absolute left-2 z-50 p-3 rounded-full bg-ink/70 border border-white/10 text-slate-100 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-brass hover:text-[#181008] shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 z-50 p-3 rounded-full bg-ink/70 border border-white/10 text-slate-100 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-brass hover:text-[#181008] shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores do Carrossel */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
            {CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex ? "w-8 bg-brass" : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Parágrafo Informativo */}
        <p className="text-base md:text-lg text-muted max-w-xl mt-6 mb-6 leading-relaxed">
          Organize eventos, reserve ingressos com QR Code assinado e valide
          entradas na portaria — tudo em um único guichê.
        </p>

        {/* Botão de Ação */}
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
      <footer className="relative z-10 max-w-5xl w-full mx-auto grid md:grid-cols-3 gap-4 pt-4">
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
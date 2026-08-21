import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Ticket, Calendar, ShieldCheck, Search, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../api.js";

const ROLE_LABEL = { organizer: "Organizador", client: "Cliente", gate: "Portaria" };
const ROLE_HOME = { organizer: "/organizer", client: "/client", gate: "/gate" };

export default function AppLayout() {
  const { user, logout, restoring } = useAuth();

  if (restoring) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen w-full bg-ink">
      <header className="flex items-center justify-between px-6 py-4 border-b border-inkline">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-brass" />
          <span className="text-lg font-display font-semibold text-slate-100">Bilheteria</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] font-mono text-muted">{API_BASE}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-ink3 text-mutedlight">
            {ROLE_LABEL[user.role]} · {user.email}
          </span>
          <button onClick={logout} className="text-xs flex items-center gap-1 text-mutedlight hover:text-brass">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <nav className="flex gap-2 mb-8 flex-wrap">
          {user.role === "organizer" && <NavTab to="/organizer" icon={Calendar} label="Criar Evento" />}
          {user.role === "client" && <NavTab to="/client" icon={Ticket} label="Reservar Ingresso" />}
          {user.role === "gate" && <NavTab to="/gate" icon={ShieldCheck} label="Validar Entrada" />}
          <NavTab to="/share" icon={Search} label="Consultar Eventos" />
        </nav>

        <Outlet />
      </main>
    </div>
  );
}

function NavTab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm px-4 py-2 rounded-full flex items-center gap-1.5 font-medium ${
          isActive ? "bg-brass text-[#181008]" : "bg-ink2 text-mutedlight border border-inkline hover:border-brass"
        }`
      }
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </NavLink>
  );
}

export { ROLE_HOME };
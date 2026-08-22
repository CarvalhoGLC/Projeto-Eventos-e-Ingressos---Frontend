import { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar, CircleDollarSign, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Banner } from "../components/ui.jsx";

export default function ShareLookupPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const data = await api.getEvents(user?.token);
        const eventList = Array.isArray(data) ? data : data?.events || [];
        setEvents(eventList);
      } catch (err) {
        setBanner({ tone: "error", text: err.message || "Não foi possível carregar os eventos." });
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [user]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((ev) => {
      const title = (ev.title || "").toLowerCase();
      const location = (ev.location || "").toLowerCase();
      return title.includes(q) || location.includes(q);
    });
  }, [events, query]);

  return (
    <div className="max-w-4xl mx-auto">
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      <Eyebrow>CONSULTA DE EVENTOS</Eyebrow>
      <h2 className="text-2xl mb-2 font-display font-semibold text-slate-100">Eventos Cadastrados</h2>
      <p className="text-xs mb-6 text-muted">
        Abaixo estão listados todos os eventos disponíveis na plataforma.
      </p>

      {/* Busca por título ou local */}
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título ou local..."
          className="w-full rounded-md pl-10 pr-4 py-2.5 bg-ink2 text-slate-100 border border-inkline focus:outline-none focus:border-brass text-sm"
        />
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-muted">Carregando lista de eventos...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-ink2 border border-inkline text-sm text-muted">
          Nenhum evento foi encontrado.
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-ink2 border border-inkline text-sm text-muted">
          Nenhum evento corresponde à busca "{query}".
        </div>
      ) : (
        <>
          <p className="text-xs text-muted mb-3">
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""} encontrado
            {filteredEvents.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="rounded-xl p-5 bg-ink2 border border-inkline flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-100">{ev.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-ink3 text-brass font-mono">ID #{ev.id}</span>
                  </div>
                  <div className="text-xs text-muted space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brass" /> {ev.location}
                    </div>
                    {ev.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brass" /> {ev.date}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-inkline flex justify-between items-center">
                  <span className="text-xs text-muted">Valor do Ingresso</span>
                  <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                    <CircleDollarSign className="w-4 h-4" /> R$ {Number(ev.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
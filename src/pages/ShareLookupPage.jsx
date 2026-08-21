import { useState, useEffect } from "react";
import { MapPin, Calendar, CircleDollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Banner } from "../components/ui.jsx";

export default function ShareLookupPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

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

  return (
    <div className="max-w-4xl mx-auto">
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      <Eyebrow>CONSULTA DE EVENTOS</Eyebrow>
      <h2 className="text-2xl mb-2 font-display font-semibold text-slate-100">Eventos Cadastrados</h2>
      <p className="text-xs mb-8 text-muted">
        Abaixo estão listados todos os eventos disponíveis na plataforma.
      </p>

      {loading ? (
        <div className="text-center py-12 text-sm text-muted">Carregando lista de eventos...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-ink2 border border-inkline text-sm text-muted">
          Nenhum evento foi encontrado.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((ev) => (
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
      )}
    </div>
  );
}
import { useState } from "react";
import { Film, MapPin, CircleDollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, Button, Banner } from "../components/ui.jsx";

export default function OrganizerPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", location: "", date: "", price: "" });
  const [events, setEvents] = useState([]);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  async function handleCreateEvent(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const event = await api.createEvent(user.token, {
        title: form.title,
        location: form.location,
        date: form.date,
        price: parseFloat(form.price || "0"),
      });
      setEvents((prev) => [event, ...prev]);
      setForm({ title: "", location: "", date: "", price: "" });
      setBanner({ tone: "ok", text: `Evento "${event.title}" criado com sucesso.` });
    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleSearchMovies(e) {
    e.preventDefault();
    if (!movieQuery.trim()) return;
    setBusy(true);
    try {
      const data = await api.searchMovies(movieQuery);
      setMovieResults(data?.results?.slice(0, 5) || []);
    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl p-6 bg-ink2">
          <Eyebrow>Novo Evento</Eyebrow>
          <h2 className="text-xl mb-5 font-display font-semibold text-slate-100">Cadastrar evento</h2>

          <form onSubmit={handleCreateEvent}>
            <Field label="Título">
              <TextInput
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Show de Rock"
              />
            </Field>
            <Field label="Local">
              <TextInput
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Arena SP"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data">
                <TextInput
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Preço (R$)">
                <TextInput
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="150.00"
                />
              </Field>
            </div>
            <Button type="submit" loading={busy} className="w-full mt-2">
              Publicar evento
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-inkline">
            <Eyebrow>Referência (opcional)</Eyebrow>
            <p className="text-xs mb-3 text-muted">Buscar um filme no TMDb para inspirar o título do evento.</p>
            <form onSubmit={handleSearchMovies} className="flex gap-2 mb-3">
              <TextInput
                value={movieQuery}
                onChange={(e) => setMovieQuery(e.target.value)}
                placeholder="Ex: Matrix"
                className="flex-1"
              />
              <Button type="submit" variant="ghost" loading={busy}>
                <Film className="w-4 h-4" />
              </Button>
            </form>
            <div className="space-y-1.5">
              {movieResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setForm({ ...form, title: m.title })}
                  className="w-full text-left text-xs px-3 py-2 rounded-md flex justify-between items-center bg-ink3 text-mutedlight hover:border-brass border border-transparent"
                >
                  <span>{m.title}</span>
                  <span className="opacity-50">{m.release_date?.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Eyebrow>Eventos publicados nesta sessão</Eyebrow>
          <p className="text-xs mb-4 text-muted">
            A API não expõe uma listagem pública de eventos — esta lista existe
            só localmente, para você anotar os IDs.
          </p>
          <div className="space-y-3">
            {events.length === 0 && (
              <div className="text-sm rounded-md p-4 bg-ink3 text-muted">Nenhum evento criado ainda.</div>
            )}
            {events.map((ev) => (
              <div key={ev.id} className="rounded-md p-4 flex justify-between items-start bg-ink2 border border-inkline">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{ev.title}</div>
                  <div className="text-xs mt-1 flex items-center gap-1 text-muted">
                    <MapPin className="w-3 h-3" /> {ev.location} · {ev.date}
                  </div>
                  <div className="text-xs mt-1 flex items-center gap-1 text-muted">
                    <CircleDollarSign className="w-3 h-3" /> R$ {Number(ev.price).toFixed(2)}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-ink3 text-brass font-mono">ID {ev.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Film, MapPin, CircleDollarSign, Pencil, Trash2, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, Button, Banner } from "../components/ui.jsx";

export default function OrganizerPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", location: "", date: "", price: "" });
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  // Edição inline
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", location: "", date: "", price: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadMyEvents() {
    setLoadingEvents(true);
    try {
      const data = await api.getEvents(user.token);
      const all = Array.isArray(data) ? data : data?.events || [];
      // A API devolve todos os eventos publicados — filtramos só os deste organizador
      setEvents(all.filter((ev) => ev.organizer_id === user.id));
    } catch (err) {
      setBanner({ tone: "error", text: "Não foi possível carregar seus eventos." });
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    if (user?.token) loadMyEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  function startEdit(ev) {
    setEditingId(ev.id);
    setEditForm({
      title: ev.title,
      location: ev.location,
      date: ev.date || "",
      price: String(ev.price ?? ""),
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(eventId) {
    setSavingEdit(true);
    try {
      const updated = await api.updateEvent(user.token, eventId, {
        title: editForm.title,
        location: editForm.location,
        date: editForm.date,
        price: parseFloat(editForm.price || "0"),
      });
      setEvents((prev) => prev.map((ev) => (ev.id === eventId ? updated : ev)));
      setEditingId(null);
      setBanner({ tone: "ok", text: "Evento atualizado com sucesso." });
    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(eventId) {
    if (!window.confirm("Tem certeza que quer excluir este evento? Essa ação não pode ser desfeita.")) {
      return;
    }
    setDeletingId(eventId);
    try {
      await api.deleteEvent(user.token, eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      setBanner({ tone: "ok", text: "Evento excluído." });
    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full">
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl p-6 bg-ink2/80 backdrop-blur-md border border-white/5">
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
                  className="w-full text-left text-xs px-3 py-2 rounded-md flex justify-between items-center bg-ink3/80 text-mutedlight hover:border-brass border border-transparent"
                >
                  <span>{m.title}</span>
                  <span className="opacity-50">{m.release_date?.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Eyebrow>Meus eventos</Eyebrow>

          {loadingEvents ? (
            <div className="text-sm rounded-md p-4 bg-ink3/80 backdrop-blur-md text-muted border border-white/5">
              Carregando seus eventos...
            </div>
          ) : (
            <div className="space-y-3">
              {events.length === 0 && (
                <div className="text-sm rounded-md p-4 bg-ink3/80 backdrop-blur-md text-muted border border-white/5">
                  Você ainda não criou nenhum evento.
                </div>
              )}

              {events.map((ev) =>
                editingId === ev.id ? (
                  // ---- Modo edição ----
                  <div
                    key={ev.id}
                    className="rounded-md p-4 bg-ink2/80 backdrop-blur-md border border-brass space-y-2"
                  >
                    <TextInput
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Título"
                    />
                    <TextInput
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Local"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                      <TextInput
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        placeholder="Preço"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        loading={savingEdit}
                        onClick={() => saveEdit(ev.id)}
                        className="flex-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Salvar
                      </Button>
                      <Button type="button" variant="ghost" onClick={cancelEdit} className="flex-1">
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // ---- Modo visualização ----
                  <div
                    key={ev.id}
                    className="rounded-md p-4 flex justify-between items-start bg-ink2/80 backdrop-blur-md border border-inkline"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{ev.title}</div>
                      <div className="text-xs mt-1 flex items-center gap-1 text-muted">
                        <MapPin className="w-3 h-3" /> {ev.location} · {ev.date}
                      </div>
                      <div className="text-xs mt-1 flex items-center gap-1 text-muted">
                        <CircleDollarSign className="w-3 h-3" /> R$ {Number(ev.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-ink3 text-brass font-mono">
                        ID {ev.id}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(ev)}
                          className="p-1.5 rounded text-mutedlight hover:text-brass hover:bg-ink3"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          disabled={deletingId === ev.id}
                          className="p-1.5 rounded text-mutedlight hover:text-stampred hover:bg-ink3 disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
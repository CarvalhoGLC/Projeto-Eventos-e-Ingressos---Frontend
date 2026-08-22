import { useState, useEffect } from "react";
import { Copy, Armchair, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, Button, Banner } from "../components/ui.jsx";
import TicketStub from "../components/TicketStub.jsx";

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 8;

export default function ClientPage() {
  const { user } = useAuth();

  // Controle de abas: 'reserve' ou 'lookup'
  const [activeTab, setActiveTab] = useState("reserve");

  // Estado dos eventos cadastrados
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Modo de reserva: 'map' (assento no mapa) ou 'qty' (quantidade, tipo pista)
  const [seatMode, setSeatMode] = useState("map");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [eventId, setEventId] = useState("");
  const [pay, setPay] = useState(true);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  // Ingressos gerados na última reserva (pode ser mais de um)
  const [tickets, setTickets] = useState([]);

  // Estado da busca/consulta por link ou token
  const [searchToken, setSearchToken] = useState("");
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [searchBusy, setSearchBusy] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      try {
        const data = await api.getEvents(user?.token);
        const eventList = Array.isArray(data) ? data : data?.events || [];
        setEvents(eventList);
        if (eventList.length > 0) {
          setEventId(String(eventList[0].id));
        }
      } catch (err) {
        setBanner({ tone: "error", text: "Não foi possível carregar a lista de eventos." });
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, [user]);

  function toggleSeat(seatLabel) {
    setSelectedSeats((prev) =>
      prev.includes(seatLabel) ? prev.filter((s) => s !== seatLabel) : [...prev, seatLabel]
    );
  }

  function seatLabelsForQuantity(n) {
    // Gera identificadores únicos para ingressos "pista" (sem assento fixo)
    return Array.from({ length: n }, () => `PISTA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!eventId) {
      setBanner({ tone: "error", text: "Selecione um evento válido." });
      return;
    }

    const seatsToBook = seatMode === "map" ? selectedSeats : seatLabelsForQuantity(quantity);

    if (seatsToBook.length === 0) {
      setBanner({
        tone: "error",
        text: seatMode === "map" ? "Selecione ao menos um assento no mapa." : "Informe uma quantidade válida.",
      });
      return;
    }

    setBusy(true);
    setTickets([]);
    const successful = [];
    const failed = [];

    // Reserva um por um (o backend cria um ingresso por chamada) — assim
    // conseguimos reportar exatamente quais assentos deram certo ou não.
    for (const seat of seatsToBook) {
      try {
        const data = await api.bookTicket(user.token, {
          event_id: parseInt(eventId, 10),
          seat_number: seat,
          simulate_payment_success: pay,
        });
        successful.push(data);
      } catch (err) {
        failed.push({ seat, message: err.message });
      }
    }

    setTickets(successful);
    setSelectedSeats([]);

    if (failed.length === 0) {
      setBanner({
        tone: "ok",
        text: `${successful.length} ingresso(s) reservado(s) com sucesso!`,
      });
    } else if (successful.length === 0) {
      setBanner({
        tone: "error",
        text: `Nenhuma reserva concluída. ${failed[0].message}`,
      });
    } else {
      setBanner({
        tone: "error",
        text: `${successful.length} reservado(s), mas ${failed.length} falharam (ex.: ${failed[0].seat} — ${failed[0].message}).`,
      });
    }

    setBusy(false);
  }

  async function fetchSharedTicket(tokenToFetch) {
    const cleanToken = tokenToFetch.includes("/") ? tokenToFetch.split("/").pop() : tokenToFetch;
    if (!cleanToken) return;

    setSearchBusy(true);
    try {
      const data = await api.sharedTicket(cleanToken);
      setSearchedTicket(data);
    } catch (err) {
      setBanner({ tone: "error", text: "Ingresso não encontrado ou token inválido." });
      setSearchedTicket(null);
    } finally {
      setSearchBusy(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchSharedTicket(searchToken);
  }

  return (
    <div className="w-full">
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      {/* Navegação de Abas Superior */}
      <div className="flex gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveTab("reserve")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === "reserve"
              ? "bg-brass text-[#181008] font-semibold"
              : "bg-ink2/80 text-muted hover:text-slate-100 border border-white/5"
          }`}
        >
          🎟️ Reservar Ingresso
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === "lookup"
              ? "bg-brass text-[#181008] font-semibold"
              : "bg-ink2/80 text-muted hover:text-slate-100 border border-white/5"
          }`}
        >
          🔍 Consultar Ingresso
        </button>
      </div>

      {/* ABA 1: RESERVAR INGRESSO */}
      {activeTab === "reserve" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 bg-ink2/80 backdrop-blur-md border border-white/5">
            <Eyebrow>Reserva</Eyebrow>
            <h2 className="text-xl mb-5 font-display font-semibold text-slate-100">Reservar ingresso</h2>

            <form onSubmit={handleBooking}>
              <Field label="Selecione o evento">
                <select
                  required
                  disabled={loadingEvents || events.length === 0}
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full rounded-md px-3 py-2 bg-ink3 text-slate-100 border border-inkline focus:outline-none focus:border-brass text-sm"
                >
                  {loadingEvents ? (
                    <option value="">Carregando eventos...</option>
                  ) : events.length === 0 ? (
                    <option value="">Nenhum evento disponível</option>
                  ) : (
                    events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.location}) - R$ {Number(ev.price || 0).toFixed(2)}
                      </option>
                    ))
                  )}
                </select>
              </Field>

              {/* Alternância: mapa de assentos ou quantidade (pista) */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSeatMode("map")}
                  className={`flex-1 text-xs py-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    seatMode === "map" ? "bg-brass text-[#181008]" : "bg-ink3/80 text-mutedlight hover:bg-ink3"
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" /> Mapa de assentos
                </button>
                <button
                  type="button"
                  onClick={() => setSeatMode("qty")}
                  className={`flex-1 text-xs py-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    seatMode === "qty" ? "bg-brass text-[#181008]" : "bg-ink3/80 text-mutedlight hover:bg-ink3"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Quantidade (pista)
                </button>
              </div>

              {seatMode === "map" ? (
                <div className="mb-5">
                  <span
                    className="block text-xs mb-2 uppercase tracking-wide text-mutedlight"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    Escolha o(s) assento(s)
                  </span>

                  <div className="rounded-md bg-ink3/60 border border-inkline p-3">
                    <div className="text-center text-[10px] uppercase tracking-widest text-muted mb-3">
                      Palco / Tela
                    </div>
                    <div className="space-y-1.5">
                      {SEAT_ROWS.map((row) => (
                        <div key={row} className="flex items-center gap-1.5 justify-center">
                          <span className="text-[10px] text-muted w-3">{row}</span>
                          {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                            const label = `${row}${i + 1}`;
                            const active = selectedSeats.includes(label);
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => toggleSeat(label)}
                                title={label}
                                className={`w-6 h-6 rounded text-[9px] flex items-center justify-center font-mono transition-colors ${
                                  active
                                    ? "bg-brass text-[#181008] font-bold"
                                    : "bg-ink2 text-mutedlight border border-inkline hover:border-brass"
                                }`}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted mt-2">
                    {selectedSeats.length === 0
                      ? "Nenhum assento selecionado."
                      : `Selecionados: ${selectedSeats.join(", ")}`}
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    Caso algum lugar esteja ocupado, aparecerá erro ao confirmar.
                  </p>
                </div>
              ) : (
                <Field label="Quantidade de ingressos">
                  <TextInput
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  />
                </Field>
              )}

              <label className="flex items-center gap-2 mb-5 text-sm text-mutedlight">
                <input type="checkbox" checked={pay} onChange={(e) => setPay(e.target.checked)} />
                Simular pagamento aprovado
              </label>

              <Button type="submit" loading={busy} disabled={events.length === 0} className="w-full">
                Confirmar reserva
              </Button>
            </form>
          </div>

          <div>
            <Eyebrow>Seus canhotos</Eyebrow>
            {tickets.length === 0 ? (
              <div className="text-sm rounded-md p-4 bg-ink3/80 backdrop-blur-md text-muted border border-white/5">
                Faça uma reserva para ver o(s) ingresso(s) aqui.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.ticket_id}
                    className="bg-ink2/80 backdrop-blur-md p-4 rounded-xl border border-white/5"
                  >
                    <TicketStub
                      title={`Assento ${ticket.seat}`}
                      rows={[["Ticket", `#${ticket.ticket_id}`]]}
                      code={ticket.qr_code_payload}
                    />
                    <div className="mt-4 rounded-md p-3 text-xs break-all bg-ink3/80 text-mutedlight font-mono">
                      {ticket.qr_code_payload}
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(ticket.qr_code_payload)}
                      className="mt-2 text-xs flex items-center gap-1 text-brass"
                    >
                      <Copy className="w-3 h-3" /> Copiar payload do QR
                    </button>
                    <div className="mt-3 text-xs text-muted">
                      Link compartilhável: <span className="font-mono">{ticket.share_link}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: CONSULTAR INGRESSO PELO LINK */}
      {activeTab === "lookup" && (
        <div className="max-w-2xl mx-auto">
          <Eyebrow>CONSULTA PÚBLICA</Eyebrow>
          <h2 className="text-2xl mb-6 font-display font-semibold text-slate-100">Consultar ingresso pelo link</h2>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-8">
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="Cole o link ou apenas o token"
              className="flex-1 rounded-md px-4 py-2 bg-slate-800/80 backdrop-blur-md text-slate-100 border border-slate-700 focus:outline-none focus:border-amber-500 text-sm"
              required
            />
            <Button type="submit" loading={searchBusy} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold">
              🔍 Buscar
            </Button>
          </form>

          {searchedTicket && (
            <div className="bg-ink2/80 backdrop-blur-md p-6 rounded-xl border border-slate-800">
              <TicketStub
                title={`Assento ${searchedTicket.seat_number}`}
                rows={[
                  ["Ticket ID", `#${searchedTicket.ticket_id}`],
                  ["Evento ID", `#${searchedTicket.event_id}`],
                ]}
                code={searchedTicket.qr_code_payload}
              />
              <div className="mt-4 rounded-md p-3 text-xs break-all bg-ink3/80 text-mutedlight font-mono">
                {searchedTicket.qr_code_payload}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
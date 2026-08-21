import { useState } from "react";
import { Copy } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, Button, Banner } from "../components/ui.jsx";
import TicketStub from "../components/TicketStub.jsx";

export default function ClientPage() {
  const { user } = useAuth();
  
  // Controle de abas: 'reserve' ou 'lookup'
  const [activeTab, setActiveTab] = useState("reserve");

  // Estado do formulário de reserva
  const [form, setForm] = useState({ event_id: "", seat_number: "", pay: true });
  const [ticket, setTicket] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  // Estado da busca/consulta por link ou token
  const [searchToken, setSearchToken] = useState("");
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [searchBusy, setSearchBusy] = useState(false);

  // 1. Fluxo de Reserva
  async function handleBooking(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await api.bookTicket(user.token, {
        event_id: parseInt(form.event_id, 10),
        seat_number: form.seat_number,
        simulate_payment_success: form.pay,
      });
      setTicket(data);
      setBanner({ tone: "ok", text: "Ingresso reservado com sucesso! Redirecionando para consulta..." });
      
      // Extrai apenas o token do share_link (ex: /tickets/share/UUID -> UUID)
      const token = data.share_link ? data.share_link.split("/").pop() : "";
      setSearchToken(token);

      // Alterna automaticamente para a aba "Consultar Ingresso"
      setTimeout(() => {
        setActiveTab("lookup");
        if (token) {
          fetchSharedTicket(token);
        }
      }, 1000);

    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  // 2. Fluxo de Busca/Consulta do Ingresso
  async function fetchSharedTicket(tokenToFetch) {
    // Trata caso o usuário cole a URL completa ou só o token
    const cleanToken = tokenToFetch.includes("/") ? tokenToFetch.split("/").pop() : tokenToFetch;
    if (!cleanToken) return;

    setSearchBusy(true);
    try {
      const data = await api.getSharedTicket(cleanToken);
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
    <div>
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      {/* Navegação de Abas Superior conforme a Interface */}
      <div className="flex gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveTab("reserve")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === "reserve"
              ? "bg-slate-800 text-slate-100 border border-slate-700"
              : "text-muted hover:text-slate-100"
          }`}
        >
          🎟️ Reservar Ingresso
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === "lookup"
              ? "bg-amber-500 text-slate-950 font-semibold"
              : "text-muted hover:text-slate-100"
          }`}
        >
          🔍 Consultar Ingresso
        </button>
      </div>

      {/* ABA 1: RESERVAR INGRESSO */}
      {activeTab === "reserve" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 bg-ink2">
            <Eyebrow>Reserva</Eyebrow>
            <h2 className="text-xl mb-5 font-display font-semibold text-slate-100">Reservar ingresso</h2>

            <form onSubmit={handleBooking}>
              <Field label="ID do evento">
                <TextInput
                  type="number"
                  required
                  value={form.event_id}
                  onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                  placeholder="1"
                />
              </Field>
              <Field label="Assento">
                <TextInput
                  required
                  value={form.seat_number}
                  onChange={(e) => setForm({ ...form, seat_number: e.target.value })}
                  placeholder="A1"
                />
              </Field>
              <label className="flex items-center gap-2 mb-5 text-sm text-mutedlight">
                <input
                  type="checkbox"
                  checked={form.pay}
                  onChange={(e) => setForm({ ...form, pay: e.target.checked })}
                />
                Simular pagamento aprovado
              </label>
              <Button type="submit" loading={busy} className="w-full">
                Confirmar reserva
              </Button>
            </form>
          </div>

          <div>
            <Eyebrow>Seu canhoto</Eyebrow>
            {!ticket ? (
              <div className="text-sm rounded-md p-4 bg-ink3 text-muted">Faça uma reserva para ver o ingresso aqui.</div>
            ) : (
              <div>
                <TicketStub
                  title={`Assento ${ticket.seat}`}
                  rows={[["Ticket", `#${ticket.ticket_id}`]]}
                  code={ticket.qr_code_payload}
                />
                <div className="mt-4 rounded-md p-3 text-xs break-all bg-ink3 text-mutedlight font-mono">
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
              className="flex-1 rounded-md px-4 py-2 bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:border-amber-500 text-sm"
              required
            />
            <Button type="submit" loading={searchBusy} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold">
              🔍 Buscar
            </Button>
          </form>

          {searchedTicket && (
            <div className="bg-ink2 p-6 rounded-xl border border-slate-800">
              <TicketStub
                title={`Assento ${searchedTicket.seat_number}`}
                rows={[
                  ["Ticket ID", `#${searchedTicket.ticket_id}`],
                  ["Evento ID", `#${searchedTicket.event_id}`],
                ]}
                code={searchedTicket.qr_code_payload}
              />
              <div className="mt-4 rounded-md p-3 text-xs break-all bg-ink3 text-mutedlight font-mono">
                {searchedTicket.qr_code_payload}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
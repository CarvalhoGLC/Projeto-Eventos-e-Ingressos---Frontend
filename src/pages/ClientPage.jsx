import { useState } from "react";
import { Copy } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, Button, Banner } from "../components/ui.jsx";
import TicketStub from "../components/TicketStub.jsx";

export default function ClientPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ event_id: "", seat_number: "", pay: true });
  const [ticket, setTicket] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

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
      setBanner({ tone: "ok", text: "Ingresso reservado! Confira o canhoto ao lado." });
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
    </div>
  );
}

import { useState } from "react";
import { Search } from "lucide-react";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, Button, Banner } from "../components/ui.jsx";
import TicketStub from "../components/TicketStub.jsx";

export default function ShareLookupPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [ticket, setTicket] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  async function handleLookup(e) {
    e.preventDefault();
    setBusy(true);
    setTicket(null);
    try {
      const token = tokenInput.replace(/^.*\/tickets\/share\//, "");
      const data = await api.sharedTicket(token);
      setTicket(data);
    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      {banner && (
        <Banner tone={banner.tone} onClose={() => setBanner(null)}>
          {banner.text}
        </Banner>
      )}

      <Eyebrow>Consulta Pública</Eyebrow>
      <h2 className="text-xl mb-5 font-display font-semibold text-slate-100">Consultar ingresso pelo link</h2>

      <form onSubmit={handleLookup} className="flex gap-2 mb-6">
        <TextInput
          required
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Cole o link ou apenas o token"
          className="flex-1"
        />
        <Button type="submit" loading={busy}>
          <Search className="w-4 h-4" /> Buscar
        </Button>
      </form>

      {ticket && (
        <TicketStub
          title={`Assento ${ticket.seat_number}`}
          rows={[
            ["Ticket", `#${ticket.ticket_id}`],
            ["Evento", `#${ticket.event_id}`],
          ]}
          code={ticket.qr_code_payload}
        />
      )}
    </div>
  );
}
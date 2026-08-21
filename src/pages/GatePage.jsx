import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Eyebrow, Field, TextInput, TextArea, Button, Banner } from "../components/ui.jsx";
import StampResult from "../components/StampResult.jsx";

export default function GatePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ qr_payload: "", gate_event_id: "" });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  async function handleValidate(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const data = await api.validateGate(user.token, form.qr_payload, form.gate_event_id);
      setStatus(data.status);
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
          <Eyebrow>Checagem</Eyebrow>
          <h2 className="text-xl mb-5 font-display font-semibold text-slate-100">Validar entrada</h2>

          <form onSubmit={handleValidate}>
            <Field label="Payload do QR Code">
              <TextArea
                required
                rows={3}
                value={form.qr_payload}
                onChange={(e) => setForm({ ...form, qr_payload: e.target.value })}
                placeholder="TICKET_ID=1:EVENT_ID=1:SIG=..."
                className="text-xs"
              />
            </Field>
            <Field label="ID do evento na portaria">
              <TextInput
                type="number"
                required
                value={form.gate_event_id}
                onChange={(e) => setForm({ ...form, gate_event_id: e.target.value })}
                placeholder="1"
              />
            </Field>
            <Button type="submit" loading={busy} className="w-full">
              Carimbar entrada
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-center">
          {status ? (
            <StampResult status={status} />
          ) : (
            <div className="text-sm text-center text-muted">O resultado da validação aparece aqui como um carimbo.</div>
          )}
        </div>
      </div>
    </div>
  );
}
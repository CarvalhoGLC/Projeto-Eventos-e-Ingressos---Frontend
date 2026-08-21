import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
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
  const [scanning, setScanning] = useState(false);

  // Referência para o scanner não duplicar re-renders
  const scannerRef = useRef(null);

  // Executa a validação na API
  async function validatePayload(payload, eventId) {
    if (!eventId) {
      setBanner({ tone: "error", text: "Informe o ID do evento na portaria antes de escanear." });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const data = await api.validateGate(user.token, payload, eventId);
      setStatus(data.status);
    } catch (err) {
      setBanner({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  function handleManualValidate(e) {
    e.preventDefault();
    validatePayload(form.qr_payload, form.gate_event_id);
  }

  // Efeito para ligar/desligar a câmera dinamicamente
  useEffect(() => {
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          setForm((prev) => ({ ...prev, qr_payload: decodedText }));
          validatePayload(decodedText, form.gate_event_id);
          // Opcional: Desliga a câmera após a leitura com sucesso
          setScanning(false);
        },
        (error) => {
          // Ignora erros contínuos de busca de quadro da câmera
        }
      );
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Erro ao fechar leitor", err));
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, [scanning, form.gate_event_id]);

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

          {/* Campo obrigatório do evento para a leitura */}
          <div className="mb-4">
            <Field label="ID do evento na portaria">
              <TextInput
                type="number"
                required
                value={form.gate_event_id}
                onChange={(e) => setForm({ ...form, gate_event_id: e.target.value })}
                placeholder="1"
              />
            </Field>
          </div>

          {/* Botão de Câmera */}
          <div className="mb-6">
            <Button
              type="button"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={() => setScanning(!scanning)}
            >
              {scanning ? "🛑 Fechar Câmera" : "📷 Ler com a Câmera"}
            </Button>
          </div>

          {/* Container do Leitor de Vídeo */}
          {scanning && (
            <div className="mb-6 overflow-hidden rounded-lg bg-black p-2">
              <div id="reader" className="w-full"></div>
            </div>
          )}

          {/* Divisor de métodos */}
          <div className="relative my-4 text-center text-xs text-muted">
            <span className="bg-ink2 px-2">OU DIGITAÇÃO MANUAL</span>
          </div>

          {/* Formulário Manual Existente */}
          <form onSubmit={handleManualValidate}>
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
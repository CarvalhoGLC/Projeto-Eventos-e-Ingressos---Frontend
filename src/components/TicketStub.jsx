import { QrCode } from "lucide-react";

/**
 * Cartão de ingresso com canhoto destacável — o elemento visual-assinatura
 * do produto. Usado para: confirmação de reserva e consulta pelo link
 * compartilhável.
 */
export default function TicketStub({ title, rows, code }) {
  return (
    <div className="flex w-full shadow-lg font-sans">
      <div className="flex-1 rounded-l-xl p-5 bg-kraft text-[#2A2118] relative overflow-hidden">
        <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60" style={{ letterSpacing: "0.15em" }}>
          Admit One
        </div>
        <div className="text-xl mb-3 font-display font-semibold">{title}</div>
        <div className="space-y-1.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs gap-4">
              <span className="opacity-60 uppercase tracking-wide" style={{ letterSpacing: "0.05em" }}>
                {label}
              </span>
              <span className="font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* costura perfurada */}
      <div className="relative w-0 bg-kraft">
        <div className="absolute inset-y-0 left-0 border-l-2 border-dashed border-[#2A2118] opacity-40" />
        <div className="absolute rounded-full bg-ink w-4 h-4 -top-2 -left-2" />
        <div className="absolute rounded-full bg-ink w-4 h-4 -bottom-2 -left-2" />
      </div>

      <div className="w-24 shrink-0 rounded-r-xl p-3 flex flex-col items-center justify-center gap-2 bg-kraftdark text-[#2A2118]">
        <QrCode className="w-9 h-9 opacity-80" />
        {code && (
          <div className="text-[9px] text-center break-all opacity-70 leading-tight font-mono">
            {code.slice(0, 10)}…
          </div>
        )}
      </div>
    </div>
  );
}

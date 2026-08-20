import { CheckCircle2, XCircle } from "lucide-react";

const STATUS_MAP = {
  VALID: { label: "Entrada Liberada", color: "#3E7A4F", Icon: CheckCircle2 },
  USED: { label: "Já Validado", color: "#C98A3E", Icon: XCircle },
  INVALID: { label: "QR Inválido", color: "#B0413E", Icon: XCircle },
  WRONG_EVENT: { label: "Evento Errado", color: "#B0413E", Icon: XCircle },
};

export default function StampResult({ status }) {
  if (!status) return null;
  const { label, color, Icon } = STATUS_MAP[status] || STATUS_MAP.INVALID;

  return (
    <div className="flex justify-center py-8">
      <div
        key={status}
        className="animate-stampPop flex flex-col items-center justify-center rounded-full border-[6px] w-52 h-52 rotate-[-8deg] font-display"
        style={{ borderColor: color, color }}
      >
        <Icon className="w-10 h-10 mb-2" />
        <div className="text-lg font-bold uppercase text-center px-4 leading-tight" style={{ letterSpacing: "0.05em" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

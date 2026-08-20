import { Loader2 } from "lucide-react";

export function Eyebrow({ children }) {
  return (
    <div className="text-xs tracking-widest uppercase mb-2 text-brass" style={{ letterSpacing: "0.15em" }}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span
        className="block text-xs mb-1.5 uppercase tracking-wide text-mutedlight"
        style={{ letterSpacing: "0.08em" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClasses =
  "w-full rounded-md px-3 py-2.5 text-sm outline-none bg-ink3 border border-inkline text-slate-100 focus:border-brass transition-colors";

export function TextInput(props) {
  return <input {...props} className={`${fieldClasses} ${props.className || ""}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${fieldClasses} resize-none ${props.className || ""}`} />;
}

export function Select(props) {
  return (
    <select {...props} className={`${fieldClasses} ${props.className || ""}`}>
      {props.children}
    </select>
  );
}

export function Button({ children, variant = "brass", loading, className = "", ...rest }) {
  const variants = {
    brass: "bg-brass text-[#181008] hover:bg-brassdark",
    ghost: "bg-transparent text-mutedlight border border-inkline hover:border-brass",
    kraft: "bg-kraft text-[#2A2118] hover:bg-kraftdark",
  };
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Banner({ tone, children, onClose }) {
  const tones = {
    error: "bg-[#3A2224] border-stampred text-[#F3B7B2]",
    ok: "bg-[#1E2E22] border-stampgreen text-[#B9E2C4]",
  };
  return (
    <div className={`rounded-md px-4 py-3 text-sm mb-5 flex items-start justify-between gap-3 border ${tones[tone]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100 shrink-0">
          ✕
        </button>
      )}
    </div>
  );
}

export function TabLink({ active, icon: Icon, children, ...rest }) {
  return (
    <a
      {...rest}
      className={`text-sm px-4 py-2 rounded-full flex items-center gap-1.5 font-medium cursor-pointer select-none ${
        active ? "bg-brass text-[#181008]" : "bg-ink2 text-mutedlight border border-inkline hover:border-brass"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </a>
  );
}

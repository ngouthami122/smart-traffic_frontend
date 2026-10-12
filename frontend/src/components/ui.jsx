import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((text, type = "ok") => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, text, type }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {list.map((t) => <div key={t.id} className={"toast " + t.type}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className={"field" + (error ? " has-error" : "")}>
      <span>{label}</span>
      {children}
      {error && <small className="err">{error}</small>}
    </label>
  );
}

export const StatCard = ({ icon, label, value, hint, tone = "brand" }) => (
  <div className={"stat tone-" + tone}>
    <div className="stat-icon" aria-hidden="true">{icon}</div>
    <div><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{hint && <div className="stat-hint">{hint}</div>}</div>
  </div>
);

export const Pill = ({ kind, children }) => <span className={"pill pill-" + kind}>{children}</span>;
export const Card = ({ title, action, children, className = "" }) => (
  <section className={"card " + className}>
    {(title || action) && <div className="card-head"><h2>{title}</h2>{action}</div>}
    {children}
  </section>
);
export const Loading = () => <div className="state"><div className="spinner" aria-hidden="true" /> Loading...</div>;
export const ErrorBox = ({ message, onRetry }) => (
  <div className="state error" role="alert"><strong>Something went wrong.</strong><p>{message}</p>{onRetry && <button className="btn" onClick={onRetry}>Try again</button>}</div>
);
export const Empty = ({ children }) => <div className="state muted">{children}</div>;

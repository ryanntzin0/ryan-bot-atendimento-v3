export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`toast ${toast.tipo || "success"}`} onClick={onClose}>{toast.mensagem}</div>;
}

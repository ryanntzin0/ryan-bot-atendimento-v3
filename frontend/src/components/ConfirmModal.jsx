export default function ConfirmModal({ open, title, text, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="confirm-modal">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="row-actions">
          <button className="btn secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

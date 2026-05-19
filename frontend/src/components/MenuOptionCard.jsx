export default function MenuOptionCard({ menu, onEdit, onDelete }) {
  return (
    <div className="menu-card glass-hover">
      <div className="menu-card-top">
        <strong>{menu.numero} - {menu.titulo}</strong>
        <span className={menu.ativo ? "badge green" : "badge red"}>{menu.ativo ? "Ativo" : "Inativo"}</span>
      </div>
      <p>{menu.resposta}</p>
      <div className="menu-meta"><span>Ação: {menu.acao}</span><span>Ordem: {menu.ordem}</span></div>
      <div className="row-actions">
        <button className="btn secondary" onClick={() => onEdit(menu)}>Editar</button>
        <button className="btn danger" onClick={() => onDelete(menu.id)}>Excluir</button>
      </div>
    </div>
  );
}

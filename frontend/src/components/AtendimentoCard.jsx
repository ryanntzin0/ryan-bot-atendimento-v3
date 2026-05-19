export default function AtendimentoCard({ atendimento, onSelect, ativo }) {
  return (
    <button className={ativo ? "atendimento-card active" : "atendimento-card"} onClick={() => onSelect(atendimento)}>
      <div><strong>{atendimento.nome || "Cliente"}</strong><span>{atendimento.telefone}</span></div>
      <p>{atendimento.ultimaMensagem || "Sem mensagem"}</p>
      <div className="menu-meta"><span>{atendimento.status}</span><span>{new Date(atendimento.atualizadoEm).toLocaleString("pt-BR")}</span></div>
    </button>
  );
}

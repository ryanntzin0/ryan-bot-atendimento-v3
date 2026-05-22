import { useEffect, useState } from "react";
import { api } from "../services/api";
import AtendimentoCard from "../components/AtendimentoCard";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

export default function Atendimentos({ empresaId, usuario, showToast }) {
  const [status, setStatus] = useState("todos");
  const [atendimentos, setAtendimentos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [resposta, setResposta] = useState("");
  const [modal, setModal] = useState(false);

  const podeLimpar = usuario?.tipo !== "atendente";

  async function carregar() {
    if (!empresaId) return;
    try {
      const data = await api(`/api/atendimentos?empresaId=${empresaId}&status=${status}`);
      setAtendimentos(data);
      if (selecionado) {
        const atualizado = data.find(a => a.id === selecionado.id);
        if (atualizado) setSelecionado(atualizado);
      }
    } catch (error) { showToast(error.message, "error"); }
  }

  useEffect(() => { carregar(); }, [empresaId, status]);

  async function alterarStatus(novo) {
    if (!selecionado) return;
    try {
      const data = await api(`/api/atendimentos/${selecionado.id}/status?empresaId=${empresaId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: novo })
      });
      setSelecionado({ ...selecionado, status: data.status });
      showToast("Status atualizado.");
      carregar();
    } catch (error) { showToast(error.message, "error"); }
  }

  async function responderManual(e) {
    e.preventDefault();
    if (!resposta.trim()) return showToast("Digite uma mensagem.", "error");
    try {
      const data = await api(`/api/atendimentos/${selecionado.id}/responder?empresaId=${empresaId}`, {
        method: "POST",
        body: JSON.stringify({ texto: resposta })
      });

      const atendimentoAtualizado = data.atendimento || data;
      setSelecionado(atendimentoAtualizado);
      setResposta("");

      if (data.whatsapp) {
        showToast(data.whatsapp.enviado ? "Resposta salva e enviada no WhatsApp." : `Resposta salva. WhatsApp: ${data.whatsapp.motivo}`, data.whatsapp.enviado ? "success" : "error");
      } else {
        showToast("Resposta manual salva.");
      }

      carregar();
    } catch (error) { showToast(error.message, "error"); }
  }

  async function limpar() {
    try {
      await api(`/api/atendimentos?empresaId=${empresaId}`, { method: "DELETE" });
      setModal(false);
      setSelecionado(null);
      showToast("Atendimentos limpos.");
      carregar();
    } catch (error) {
      setModal(false);
      showToast(error.message, "error");
    }
  }

  return (
    <section className="two-columns">
      <div className="panel">
        <div className="filter-line">
          <h2>Conversas</h2>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="em atendimento automático">Automático</option>
            <option value="aguardando atendente humano">Aguardando humano</option>
            <option value="em atendimento humano">Em humano</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
        {podeLimpar && <button className="btn danger full" onClick={() => setModal(true)}>Limpar atendimentos de teste</button>}
        <div className="list-area mt">
          {atendimentos.length === 0 && <EmptyState title="Sem atendimentos" text="Use a tela Testar bot para criar conversas." />}
          {atendimentos.map(a => <AtendimentoCard key={a.id} atendimento={a} ativo={selecionado?.id === a.id} onSelect={setSelecionado} />)}
        </div>
      </div>

      <div className="panel conversa-panel">
        {!selecionado ? <EmptyState title="Selecione uma conversa" text="O histórico e a resposta manual aparecem aqui." /> : <>
          <div className="conversation-head">
            <div><h2>{selecionado.nome}</h2><p>{selecionado.telefone}</p></div>
            <span className="badge green">{selecionado.status}</span>
          </div>

          <div className="chat-box">
            {(selecionado.mensagens || []).map(msg => (
              <div key={msg.id || msg.data} className={`bubble ${msg.de}`}>
                <strong>{msg.de === "bot" ? "Bot" : msg.de === "atendente" ? "Atendente" : "Cliente"}</strong>
                <p>{msg.texto}</p>
                <small>{new Date(msg.data).toLocaleString("pt-BR")}</small>
              </div>
            ))}
          </div>

          <form className="manual-reply" onSubmit={responderManual}>
            <textarea rows="3" placeholder="Digite a resposta manual do atendente..." value={resposta} onChange={e => setResposta(e.target.value)} />
            <button className="btn primary">Enviar resposta</button>
          </form>

          <div className="row-actions">
            <button className="btn secondary" onClick={() => alterarStatus("aguardando atendente humano")}>Marcar como humano</button>
            <button className="btn secondary" onClick={() => alterarStatus("em atendimento automático")}>Voltar automático</button>
            <button className="btn primary" onClick={() => alterarStatus("finalizado")}>Finalizar</button>
          </div>
        </>}
      </div>

      <ConfirmModal open={modal} title="Limpar atendimentos?" text="Isso vai apagar apenas os atendimentos da empresa ativa." onCancel={() => setModal(false)} onConfirm={limpar} />
    </section>
  );
}

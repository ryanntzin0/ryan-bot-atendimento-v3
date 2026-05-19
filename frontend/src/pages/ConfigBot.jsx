import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ConfigBot({ empresaId, showToast }) {
  const [config, setConfig] = useState(null);

  async function carregar() {
    if (!empresaId) return;
    try { setConfig(await api(`/api/config?empresaId=${empresaId}`)); }
    catch (error) { showToast(error.message, "error"); }
  }

  useEffect(() => { carregar(); }, [empresaId]);

  if (!config) return <div className="panel">Carregando...</div>;
  function setField(k, v) { setConfig(p => ({ ...p, [k]: v })); }

  async function salvar(e) {
    e.preventDefault();
    try {
      await api(`/api/config?empresaId=${empresaId}`, { method: "PUT", body: JSON.stringify(config) });
      showToast("Configurações salvas.");
    } catch (error) { showToast(error.message, "error"); }
  }

  return (
    <form className="panel form-grid wide-form" onSubmit={salvar}>
      <div className="switch-line"><div><strong>Bot ativo</strong><p>Pausar desliga as respostas automáticas.</p></div><label className="switch"><input type="checkbox" checked={config.botAtivo} onChange={e => setField("botAtivo", e.target.checked)} /><span></span></label></div>
      <label>Nome da empresa no bot</label><input value={config.empresa || ""} onChange={e => setField("empresa", e.target.value)} />
      <label>Mensagem de saudação</label><textarea rows="5" value={config.mensagemSaudacao || ""} onChange={e => setField("mensagemSaudacao", e.target.value)} />
      <label>Mensagem de opção inválida</label><textarea rows="4" value={config.mensagemOpcaoInvalida || ""} onChange={e => setField("mensagemOpcaoInvalida", e.target.value)} />
      <label>Mensagem de finalização</label><textarea rows="4" value={config.mensagemFinalizacao || ""} onChange={e => setField("mensagemFinalizacao", e.target.value)} />
      <label>Mensagem fora do horário</label><textarea rows="4" value={config.mensagemForaHorario || ""} onChange={e => setField("mensagemForaHorario", e.target.value)} />
      <label className="checkbox-line"><input type="checkbox" checked={config.mostrarMenuNaSaudacao} onChange={e => setField("mostrarMenuNaSaudacao", e.target.checked)} />Mostrar menu junto com a saudação</label>
      <button className="btn primary">Salvar configurações</button>
    </form>
  );
}

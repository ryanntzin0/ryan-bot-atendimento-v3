import { useEffect, useState } from "react";
import { api } from "../services/api";

const labels = { segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta", sexta: "Sexta", sabado: "Sábado", domingo: "Domingo" };

export default function Horarios({ empresaId, showToast }) {
  const [config, setConfig] = useState(null);

  async function carregar() {
    if (!empresaId) return;
    try { setConfig(await api(`/api/config?empresaId=${empresaId}`)); }
    catch (error) { showToast(error.message, "error"); }
  }

  useEffect(() => { carregar(); }, [empresaId]);

  if (!config) return <div className="panel">Carregando...</div>;

  function update(dia, campo, valor) {
    setConfig(p => ({ ...p, horarios: { ...p.horarios, [dia]: { ...p.horarios[dia], [campo]: valor } } }));
  }

  async function salvar() {
    try {
      await api(`/api/config?empresaId=${empresaId}`, { method: "PUT", body: JSON.stringify(config) });
      showToast("Horários salvos.");
    } catch (error) { showToast(error.message, "error"); }
  }

  return (
    <section className="panel">
      <h2>Horário de funcionamento</h2>
      <p>Configure quando o bot deve responder automaticamente.</p>
      <div className="horarios-list">
        {Object.entries(config.horarios || {}).map(([dia, regra]) => (
          <div className="horario-row" key={dia}>
            <label className="checkbox-line"><input type="checkbox" checked={regra.ativo} onChange={e => update(dia, "ativo", e.target.checked)} />{labels[dia]}</label>
            <input type="time" value={regra.inicio || ""} onChange={e => update(dia, "inicio", e.target.value)} />
            <input type="time" value={regra.fim || ""} onChange={e => update(dia, "fim", e.target.value)} />
          </div>
        ))}
      </div>
      <button className="btn primary" onClick={salvar}>Salvar horários</button>
    </section>
  );
}

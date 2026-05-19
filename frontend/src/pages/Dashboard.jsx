import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Activity, Bot, CheckCircle2, Clock, Inbox, MessageSquare, UsersRound, Zap } from "lucide-react";

export default function Dashboard({ empresaId, showToast }) {
  const [dados, setDados] = useState({});

  async function carregar() {
    if (!empresaId) return;
    try {
      const atendimentos = await api(`/api/atendimentos?empresaId=${empresaId}`);
      const menus = await api(`/api/menus?empresaId=${empresaId}`);
      const config = await api(`/api/config?empresaId=${empresaId}`);

      setDados({
        total: atendimentos.length,
        abertos: atendimentos.filter(a => a.status !== "finalizado").length,
        finalizados: atendimentos.filter(a => a.status === "finalizado").length,
        aguardandoHumano: atendimentos.filter(a => a.status === "aguardando atendente humano").length,
        humanos: atendimentos.filter(a => a.status === "em atendimento humano").length,
        automaticos: atendimentos.filter(a => a.status === "em atendimento automático").length,
        botAtivo: config.botAtivo,
        menusAtivos: menus.filter(m => m.ativo).length,
        empresa: config.empresa
      });
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  useEffect(() => { carregar(); }, [empresaId]);

  const cards = [
    ["Total", dados.total || 0, Inbox],
    ["Abertos", dados.abertos || 0, Activity],
    ["Finalizados", dados.finalizados || 0, CheckCircle2],
    ["Aguardando humano", dados.aguardandoHumano || 0, UsersRound],
    ["Em humano", dados.humanos || 0, MessageSquare],
    ["Automáticos", dados.automaticos || 0, Zap],
    ["Menus ativos", dados.menusAtivos || 0, Bot],
    ["Status", dados.botAtivo ? "Ativo" : "Pausado", Clock]
  ];

  return (
    <section>
      <div className="dashboard-hero">
        <div>
          <span className={dados.botAtivo ? "badge green" : "badge red"}>{dados.botAtivo ? "Bot ativo" : "Bot pausado"}</span>
          <h2>{dados.empresa || "Empresa"}</h2>
          <p>Resumo operacional com dados persistidos no Supabase.</p>
        </div>
        <div className="hero-bot">🔐</div>
      </div>

      <div className="grid-cards">
        {cards.map(([label, value, Icon]) => (
          <div className="metric-card glass-hover" key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

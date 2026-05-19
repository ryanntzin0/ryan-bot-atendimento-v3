import { Bot, Building2, Clock, FlaskConical, Inbox, LayoutDashboard, LogOut, MessageSquareText, Settings, UsersRound } from "lucide-react";

export default function Sidebar({ pagina, setPagina, sair, usuario }) {
  const isAtendente = usuario?.tipo === "atendente";

  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, show: !isAtendente },
    { id: "empresas", label: "Empresas", icon: Building2, show: usuario?.tipo === "superadmin" },
    { id: "usuarios", label: "Usuários", icon: UsersRound, show: !isAtendente },
    { id: "config", label: "Configurações", icon: Settings, show: !isAtendente },
    { id: "menus", label: "Menus", icon: MessageSquareText, show: !isAtendente },
    { id: "horarios", label: "Horários", icon: Clock, show: !isAtendente },
    { id: "atendimentos", label: "Atendimentos", icon: Inbox, show: true },
    { id: "testar", label: "Testar bot", icon: FlaskConical, show: !isAtendente }
  ].filter(item => item.show);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Bot size={24} /></div>
        <div><strong>Ryan Bot</strong><span>Atendimento V4</span></div>
      </div>

      <div className="user-box">
        <strong>{usuario?.nome}</strong>
        <span>{usuario?.tipo}</span>
      </div>

      <nav>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={pagina === item.id ? "nav-btn active" : "nav-btn"} onClick={() => setPagina(item.id)}>
              <Icon size={18} />{item.label}
            </button>
          );
        })}
      </nav>

      <button className="logout-btn" onClick={sair}><LogOut size={18} />Sair</button>
    </aside>
  );
}

import EmpresaSelector from "./EmpresaSelector";

const titles = {
  dashboard: "Dashboard",
  empresas: "Empresas",
  usuarios: "Usuários",
  config: "Configurações do bot",
  menus: "Menus e respostas",
  horarios: "Horário de funcionamento",
  atendimentos: "Atendimentos",
  testar: "Teste do bot"
};

export default function Header({ pagina, usuario, empresas, empresaId, setEmpresaId }) {
  const empresaAtual = empresas.find(e => e.id === empresaId);

  return (
    <header className="top-header">
      <div>
        <p>Plataforma com Supabase, JWT e permissões reais</p>
        <h1>{titles[pagina] || "Ryan Bot"}</h1>
        {empresaAtual && <small className="subline">Empresa ativa: {empresaAtual.nome} • Plano {empresaAtual.plano}</small>}
      </div>

      <div className="header-actions">
        <EmpresaSelector usuario={usuario} empresas={empresas} empresaId={empresaId} setEmpresaId={setEmpresaId} />
        <div className="status-pill"><span></span>Online</div>
      </div>
    </header>
  );
}

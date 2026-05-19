import { useEffect, useState } from "react";
import { api, logoutLocal } from "./services/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Usuarios from "./pages/Usuarios";
import ConfigBot from "./pages/ConfigBot";
import MenusRespostas from "./pages/MenusRespostas";
import Horarios from "./pages/Horarios";
import Atendimentos from "./pages/Atendimentos";
import TestarBot from "./pages/TestarBot";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/Toast";

export default function App() {
  const [logado, setLogado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [empresaId, setEmpresaId] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [pagina, setPagina] = useState("dashboard");
  const [toast, setToast] = useState(null);

  function showToast(mensagem, tipo = "success") {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  async function carregarEmpresas(user = usuario) {
    const data = await api("/api/empresas");
    setEmpresas(data);

    const saved = localStorage.getItem("ryanbot_empresaId");
    if (user?.tipo === "superadmin") setEmpresaId(saved || data[0]?.id || "");
    else setEmpresaId(user?.empresaId || data[0]?.id || "");
  }

  useEffect(() => {
    const token = localStorage.getItem("ryanbot_token");
    const user = JSON.parse(localStorage.getItem("ryanbot_usuario") || "null");

    if (token && user) {
      setLogado(true);
      setUsuario(user);
      carregarEmpresas(user).catch(() => {
        logoutLocal();
        setLogado(false);
      });
    }
  }, []);

  useEffect(() => {
    if (empresaId) localStorage.setItem("ryanbot_empresaId", empresaId);
  }, [empresaId]);

  async function handleLogin(auth) {
    localStorage.setItem("ryanbot_token", auth.token);
    localStorage.setItem("ryanbot_usuario", JSON.stringify(auth.usuario));
    localStorage.setItem("ryanbot_empresaId", auth.usuario.empresaId);
    setUsuario(auth.usuario);
    setEmpresaId(auth.usuario.empresaId);
    setLogado(true);
    await carregarEmpresas(auth.usuario);
  }

  function sair() {
    logoutLocal();
    setLogado(false);
    setUsuario(null);
    setEmpresaId("");
  }

  if (!logado) return <Login onLogin={handleLogin} />;

  if (usuario?.tipo === "atendente" && pagina !== "atendimentos") {
    setTimeout(() => setPagina("atendimentos"), 0);
  }

  const common = { empresaId, usuario, showToast, empresas, carregarEmpresas };
  const paginas = {
    dashboard: <Dashboard {...common} />,
    empresas: <Empresas {...common} setEmpresaId={setEmpresaId} />,
    usuarios: <Usuarios {...common} />,
    config: <ConfigBot {...common} />,
    menus: <MenusRespostas {...common} />,
    horarios: <Horarios {...common} />,
    atendimentos: <Atendimentos {...common} />,
    testar: <TestarBot {...common} />
  };

  return (
    <div className="app-shell">
      <Sidebar pagina={pagina} setPagina={setPagina} sair={sair} usuario={usuario} />
      <main className="main-content">
        <Header pagina={pagina} usuario={usuario} empresas={empresas} empresaId={empresaId} setEmpresaId={setEmpresaId} />
        {paginas[pagina] || paginas.atendimentos}
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

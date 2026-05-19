import { useState } from "react";
import { api } from "../services/api";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@ryanbot.com");
  const [senha, setSenha] = useState("123456");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha })
      });
      onLogin(data);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="brand-icon"><Bot size={30} /></div>
        <h1>Ryan Bot Atendimento</h1>
        <p>Versão V4 com Supabase, login seguro, JWT, usuários por empresa e permissões reais.</p>
        <div className="login-feature"><Sparkles size={18}/> Dados persistentes</div>
        <div className="login-feature"><ShieldCheck size={18}/> Autenticação com JWT</div>
      </section>

      <form className="login-card" onSubmit={entrar}>
        <h2>Entrar no painel</h2>
        <p>Use um dos acessos criados no Supabase.</p>
        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <div className="error-box">{erro}</div>}
        <button className="btn primary full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        <small>Superadmin: admin@ryanbot.com / 123456</small>
        <small>Cliente: portcell@cliente.com / 123456</small>
        <small>Atendente: atendente@portcell.com / 123456</small>
      </form>
    </div>
  );
}

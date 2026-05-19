import { useEffect, useState } from "react";
import { api } from "../services/api";
import EmptyState from "../components/EmptyState";

const vazio = { nome: "", email: "", senha: "123456", tipo: "atendente", ativo: true };

export default function Usuarios({ empresaId, usuario, showToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [novaSenha, setNovaSenha] = useState("123456");

  async function carregar() {
    if (!empresaId) return;
    try { setUsuarios(await api(`/api/usuarios?empresaId=${empresaId}`)); }
    catch (error) { showToast(error.message, "error"); }
  }

  useEffect(() => { carregar(); }, [empresaId]);

  if (usuario?.tipo === "atendente") return <EmptyState title="Acesso restrito" text="Atendente não gerencia usuários." />;

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function editar(u) {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, tipo: u.tipo, ativo: u.ativo, senha: "" });
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await api(`/api/usuarios/${editandoId}`, { method: "PUT", body: JSON.stringify(form) });
        showToast("Usuário atualizado.");
      } else {
        await api("/api/usuarios", { method: "POST", body: JSON.stringify({ ...form, empresaId }) });
        showToast("Usuário criado.");
      }
      setForm(vazio);
      setEditandoId(null);
      carregar();
    } catch (error) { showToast(error.message, "error"); }
  }

  async function redefinirSenha(id) {
    try {
      await api(`/api/usuarios/${id}/senha`, { method: "PATCH", body: JSON.stringify({ senha: novaSenha }) });
      showToast("Senha redefinida.");
    } catch (error) { showToast(error.message, "error"); }
  }

  async function toggle(u) {
    try {
      await api(`/api/usuarios/${u.id}/status`, { method: "PATCH", body: JSON.stringify({ ativo: !u.ativo }) });
      showToast("Status atualizado.");
      carregar();
    } catch (error) { showToast(error.message, "error"); }
  }

  return (
    <section className="two-columns">
      <form className="panel form-grid" onSubmit={salvar}>
        <h2>{editandoId ? "Editar usuário" : "Novo usuário"}</h2>
        <label>Nome</label><input value={form.nome} onChange={e => setField("nome", e.target.value)} required />
        <label>E-mail</label><input value={form.email} onChange={e => setField("email", e.target.value)} required />
        {!editandoId && <><label>Senha inicial</label><input value={form.senha} onChange={e => setField("senha", e.target.value)} required /></>}
        <label>Tipo</label>
        <select value={form.tipo} onChange={e => setField("tipo", e.target.value)}>
          {usuario?.tipo === "superadmin" && <option value="superadmin">Superadmin</option>}
          <option value="cliente">Cliente/dono</option>
          <option value="admin_empresa">Admin empresa</option>
          <option value="atendente">Atendente</option>
        </select>
        <label className="checkbox-line"><input type="checkbox" checked={form.ativo} onChange={e => setField("ativo", e.target.checked)} />Usuário ativo</label>
        <button className="btn primary">{editandoId ? "Salvar alteração" : "Criar usuário"}</button>
        {editandoId && <button type="button" className="btn secondary" onClick={() => { setEditandoId(null); setForm(vazio); }}>Cancelar</button>}
      </form>

      <div className="list-area">
        {usuarios.length === 0 && <EmptyState title="Nenhum usuário" text="Cadastre o primeiro usuário da empresa." />}
        {usuarios.map(u => (
          <div className="company-card glass-hover" key={u.id}>
            <div><strong>{u.nome}</strong><p>{u.email} • {u.tipo}</p></div>
            <span className={u.ativo ? "badge green" : "badge red"}>{u.ativo ? "Ativo" : "Inativo"}</span>
            <div className="row-actions">
              <button className="btn secondary" onClick={() => editar(u)}>Editar</button>
              <button className="btn secondary" onClick={() => toggle(u)}>{u.ativo ? "Desativar" : "Ativar"}</button>
            </div>
            <div className="password-line">
              <input value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
              <button className="btn secondary" onClick={() => redefinirSenha(u.id)}>Redefinir senha</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

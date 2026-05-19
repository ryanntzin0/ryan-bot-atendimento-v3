import { useState } from "react";
import { api } from "../services/api";
import EmptyState from "../components/EmptyState";

const vazio = { nome: "", slug: "", plano: "Inicial", corPrincipal: "#8b5cf6", ativo: true };

export default function Empresas({ usuario, empresas, carregarEmpresas, showToast, setEmpresaId }) {
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);

  if (usuario?.tipo !== "superadmin") {
    return <EmptyState title="Acesso restrito" text="Apenas o superadmin pode gerenciar empresas." />;
  }

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function editar(empresa) {
    setEditandoId(empresa.id);
    setForm({
      nome: empresa.nome,
      slug: empresa.slug,
      plano: empresa.plano,
      corPrincipal: empresa.cor_principal || empresa.corPrincipal || "#8b5cf6",
      ativo: empresa.ativo
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      const data = await api(editandoId ? `/api/empresas/${editandoId}` : "/api/empresas", {
        method: editandoId ? "PUT" : "POST",
        body: JSON.stringify(form)
      });
      showToast(editandoId ? "Empresa atualizada." : "Empresa criada.");
      setForm(vazio);
      setEditandoId(null);
      await carregarEmpresas();
      if (!editandoId) setEmpresaId(data.id);
    } catch (error) { showToast(error.message, "error"); }
  }

  async function toggle(empresa) {
    try {
      await api(`/api/empresas/${empresa.id}/status`, { method: "PATCH", body: JSON.stringify({ ativo: !empresa.ativo }) });
      showToast("Status atualizado.");
      carregarEmpresas();
    } catch (error) { showToast(error.message, "error"); }
  }

  return (
    <section className="two-columns">
      <form className="panel form-grid" onSubmit={salvar}>
        <h2>{editandoId ? "Editar empresa" : "Nova empresa"}</h2>
        <label>Nome</label><input value={form.nome} onChange={e => setField("nome", e.target.value)} required />
        <label>Slug</label><input value={form.slug || ""} onChange={e => setField("slug", e.target.value)} required />
        <label>Plano</label><select value={form.plano} onChange={e => setField("plano", e.target.value)}><option>Inicial</option><option>Profissional</option><option>Premium</option></select>
        <label>Cor principal</label><input type="color" value={form.corPrincipal || "#8b5cf6"} onChange={e => setField("corPrincipal", e.target.value)} />
        <label className="checkbox-line"><input type="checkbox" checked={form.ativo} onChange={e => setField("ativo", e.target.checked)} />Empresa ativa</label>
        <button className="btn primary">{editandoId ? "Salvar alteração" : "Criar empresa"}</button>
        {editandoId && <button type="button" className="btn secondary" onClick={() => { setEditandoId(null); setForm(vazio); }}>Cancelar</button>}
      </form>

      <div className="list-area">
        {empresas.length === 0 && <EmptyState />}
        {empresas.map(empresa => (
          <div className="company-card glass-hover" key={empresa.id}>
            <div><strong>{empresa.nome}</strong><p>{empresa.slug} • {empresa.plano}</p></div>
            <span className={empresa.ativo ? "badge green" : "badge red"}>{empresa.ativo ? "Ativa" : "Inativa"}</span>
            <div className="color-dot" style={{ background: empresa.cor_principal }}></div>
            <div className="row-actions"><button className="btn secondary" onClick={() => editar(empresa)}>Editar</button><button className="btn secondary" onClick={() => toggle(empresa)}>{empresa.ativo ? "Desativar" : "Ativar"}</button></div>
          </div>
        ))}
      </div>
    </section>
  );
}

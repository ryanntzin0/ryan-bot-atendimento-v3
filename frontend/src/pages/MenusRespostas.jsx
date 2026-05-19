import { useEffect, useState } from "react";
import { api } from "../services/api";
import MenuOptionCard from "../components/MenuOptionCard";
import EmptyState from "../components/EmptyState";

const vazio = { numero: "", titulo: "", resposta: "", acao: "responder", ativo: true, ordem: 1 };

export default function MenusRespostas({ empresaId, showToast }) {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);

  async function carregar() {
    if (!empresaId) return;
    try { setMenus(await api(`/api/menus?empresaId=${empresaId}`)); }
    catch (error) { showToast(error.message, "error"); }
  }
  useEffect(() => { carregar(); }, [empresaId]);

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function salvar(e) {
    e.preventDefault();
    try {
      await api(editandoId ? `/api/menus/${editandoId}?empresaId=${empresaId}` : `/api/menus?empresaId=${empresaId}`, {
        method: editandoId ? "PUT" : "POST",
        body: JSON.stringify({ ...form, empresaId })
      });
      showToast(editandoId ? "Menu atualizado." : "Menu criado.");
      setForm(vazio);
      setEditandoId(null);
      carregar();
    } catch (error) { showToast(error.message, "error"); }
  }

  async function excluir(id) {
    if (!confirm("Deseja excluir essa opção?")) return;
    try {
      await api(`/api/menus/${id}?empresaId=${empresaId}`, { method: "DELETE" });
      showToast("Menu excluído.");
      carregar();
    } catch (error) { showToast(error.message, "error"); }
  }

  return (
    <section className="two-columns">
      <form className="panel form-grid" onSubmit={salvar}>
        <h2>{editandoId ? "Editar opção" : "Criar opção"}</h2>
        <label>Número</label><input value={form.numero} onChange={e => setField("numero", e.target.value)} required />
        <label>Título</label><input value={form.titulo} onChange={e => setField("titulo", e.target.value)} required />
        <label>Resposta automática</label><textarea rows="6" value={form.resposta} onChange={e => setField("resposta", e.target.value)} required />
        <label>Ação</label><select value={form.acao} onChange={e => setField("acao", e.target.value)}><option value="responder">Responder</option><option value="pedir_info">Pedir info</option><option value="humano">Encaminhar para humano</option><option value="finalizar">Finalizar</option><option value="submenu">Submenu futuro</option></select>
        <label>Ordem</label><input type="number" value={form.ordem} onChange={e => setField("ordem", e.target.value)} />
        <label className="checkbox-line"><input type="checkbox" checked={form.ativo} onChange={e => setField("ativo", e.target.checked)} />Ativo</label>
        <button className="btn primary">{editandoId ? "Salvar alteração" : "Criar opção"}</button>
        {editandoId && <button type="button" className="btn secondary" onClick={() => { setEditandoId(null); setForm(vazio); }}>Cancelar</button>}
      </form>

      <div className="list-area">
        {menus.length === 0 && <EmptyState title="Nenhum menu cadastrado" text="Crie a primeira opção do atendimento." />}
        {menus.map(menu => <MenuOptionCard key={menu.id} menu={menu} onEdit={(m) => { setEditandoId(m.id); setForm(m); }} onDelete={excluir} />)}
      </div>
    </section>
  );
}

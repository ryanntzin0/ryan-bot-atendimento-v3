const { supabase } = require("./supabaseClient");

async function listarMenus(empresaId) {
  const { data, error } = await supabase.from("menus").select("*").eq("empresa_id", empresaId).order("ordem");
  if (error) throw error;
  return data;
}

async function criarMenu(empresaId, payload) {
  const { data, error } = await supabase
    .from("menus")
    .insert({
      empresa_id: empresaId,
      numero: payload.numero,
      titulo: payload.titulo,
      resposta: payload.resposta,
      acao: payload.acao || "responder",
      ativo: payload.ativo ?? true,
      ordem: Number(payload.ordem || 1)
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function atualizarMenu(empresaId, id, payload) {
  const updates = {
    numero: payload.numero,
    titulo: payload.titulo,
    resposta: payload.resposta,
    acao: payload.acao,
    ativo: payload.ativo,
    ordem: payload.ordem ? Number(payload.ordem) : undefined,
    atualizado_em: new Date().toISOString()
  };

  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const { data, error } = await supabase.from("menus").update(updates).eq("id", id).eq("empresa_id", empresaId).select("*").single();
  if (error) throw error;
  return data;
}

async function excluirMenu(empresaId, id) {
  const { error } = await supabase.from("menus").delete().eq("id", id).eq("empresa_id", empresaId);
  if (error) throw error;
  return { sucesso: true };
}

module.exports = { listarMenus, criarMenu, atualizarMenu, excluirMenu };

const { supabase } = require("./supabaseClient");

async function listarAtendimentos(empresaId, status) {
  let query = supabase
    .from("atendimentos")
    .select("*, mensagens_atendimento(*)")
    .eq("empresa_id", empresaId)
    .order("atualizado_em", { ascending: false })
    .order("criado_em", { referencedTable: "mensagens_atendimento", ascending: true });

  if (status && status !== "todos") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(formatAtendimento);
}

async function buscarAtendimento(empresaId, id) {
  const { data, error } = await supabase
    .from("atendimentos")
    .select("*, mensagens_atendimento(*)")
    .eq("empresa_id", empresaId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? formatAtendimento(data) : null;
}

async function buscarAberto(empresaId, telefone) {
  const { data, error } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("telefone", telefone)
    .neq("status", "finalizado")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function criarAtendimento({ empresaId, telefone, nome }) {
  const { data, error } = await supabase
    .from("atendimentos")
    .insert({ empresa_id: empresaId, telefone, nome: nome || "Cliente", status: "iniciado" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function adicionarMensagem(empresaId, atendimentoId, de, texto) {
  const { error: msgError } = await supabase.from("mensagens_atendimento").insert({ empresa_id: empresaId, atendimento_id: atendimentoId, de, texto });
  if (msgError) throw msgError;

  const { data, error } = await supabase
    .from("atendimentos")
    .update({ ultima_mensagem: texto, atualizado_em: new Date().toISOString() })
    .eq("id", atendimentoId)
    .eq("empresa_id", empresaId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function atualizarStatus(empresaId, id, status, extra = {}) {
  const updates = {
    status,
    opcao_escolhida: extra.opcaoEscolhida,
    atualizado_em: new Date().toISOString()
  };
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const { data, error } = await supabase.from("atendimentos").update(updates).eq("id", id).eq("empresa_id", empresaId).select("*").single();
  if (error) throw error;
  return data;
}

async function responderManual(empresaId, id, texto) {
  if (!texto || !texto.trim()) throw new Error("Digite uma mensagem para enviar.");
  await adicionarMensagem(empresaId, id, "atendente", texto.trim());
  await atualizarStatus(empresaId, id, "em atendimento humano");
  return buscarAtendimento(empresaId, id);
}

async function limparAtendimentos(empresaId) {
  const { error } = await supabase.from("atendimentos").delete().eq("empresa_id", empresaId);
  if (error) throw error;
  return { sucesso: true };
}

function formatAtendimento(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    telefone: row.telefone,
    nome: row.nome,
    status: row.status,
    ultimaMensagem: row.ultima_mensagem,
    opcaoEscolhida: row.opcao_escolhida,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    mensagens: (row.mensagens_atendimento || []).map((m) => ({ id: m.id, de: m.de, texto: m.texto, data: m.criado_em }))
  };
}

module.exports = {
  listarAtendimentos,
  buscarAtendimento,
  buscarAberto,
  criarAtendimento,
  adicionarMensagem,
  atualizarStatus,
  responderManual,
  limparAtendimentos
};

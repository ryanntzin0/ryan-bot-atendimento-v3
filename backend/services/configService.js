const { supabase } = require("./supabaseClient");

function mapConfig(row) {
  if (!row) return null;
  return {
    id: row.id,
    empresaId: row.empresa_id,
    empresa: row.empresa_nome,
    botAtivo: row.bot_ativo,
    mensagemSaudacao: row.mensagem_saudacao,
    mensagemOpcaoInvalida: row.mensagem_opcao_invalida,
    mensagemFinalizacao: row.mensagem_finalizacao,
    mensagemForaHorario: row.mensagem_fora_horario,
    mostrarMenuNaSaudacao: row.mostrar_menu_na_saudacao,
    horarios: row.horarios || {}
  };
}

function toDb(payload) {
  return {
    empresa_nome: payload.empresa,
    bot_ativo: payload.botAtivo,
    mensagem_saudacao: payload.mensagemSaudacao,
    mensagem_opcao_invalida: payload.mensagemOpcaoInvalida,
    mensagem_finalizacao: payload.mensagemFinalizacao,
    mensagem_fora_horario: payload.mensagemForaHorario,
    mostrar_menu_na_saudacao: payload.mostrarMenuNaSaudacao,
    horarios: payload.horarios,
    atualizado_em: new Date().toISOString()
  };
}

async function getConfig(empresaId) {
  const { data, error } = await supabase.from("config_bots").select("*").eq("empresa_id", empresaId).maybeSingle();
  if (error) throw error;
  return mapConfig(data);
}

async function saveConfig(empresaId, payload) {
  const db = toDb(payload);
  Object.keys(db).forEach((k) => db[k] === undefined && delete db[k]);

  const { data, error } = await supabase
    .from("config_bots")
    .update(db)
    .eq("empresa_id", empresaId)
    .select("*")
    .single();

  if (error) throw error;
  return mapConfig(data);
}

async function getMenus(empresaId) {
  const { data, error } = await supabase.from("menus").select("*").eq("empresa_id", empresaId).order("ordem", { ascending: true });
  if (error) throw error;
  return data;
}

async function montarTextoMenu(empresaId) {
  const menus = await getMenus(empresaId);
  return menus.filter(m => m.ativo).map(m => `${m.numero} - ${m.titulo}`).join("\n");
}

async function getMenuByNumero(empresaId, numero) {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("numero", String(numero).trim())
    .eq("ativo", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = { getConfig, saveConfig, getMenus, montarTextoMenu, getMenuByNumero };

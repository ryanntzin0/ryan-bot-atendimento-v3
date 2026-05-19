const bcrypt = require("bcryptjs");
const { supabase } = require("./supabaseClient");

async function listarUsuarios(user, empresaId) {
  let query = supabase.from("usuarios").select("id, empresa_id, nome, email, tipo, ativo, criado_em, atualizado_em, empresas(nome)");

  if (user.tipo !== "superadmin") query = query.eq("empresa_id", user.empresaId);
  else if (empresaId) query = query.eq("empresa_id", empresaId);

  const { data, error } = await query.order("criado_em", { ascending: false });
  if (error) throw error;
  return data;
}

async function criarUsuario(user, payload) {
  const empresaId = user.tipo === "superadmin" ? payload.empresaId : user.empresaId;

  if (!empresaId) throw new Error("empresaId é obrigatório.");
  if (!payload.nome || !payload.email || !payload.senha) throw new Error("Nome, email e senha são obrigatórios.");

  const senha_hash = await bcrypt.hash(payload.senha, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      empresa_id: empresaId,
      nome: payload.nome,
      email: payload.email,
      senha_hash,
      tipo: payload.tipo || "atendente",
      ativo: payload.ativo ?? true
    })
    .select("id, empresa_id, nome, email, tipo, ativo, criado_em")
    .single();

  if (error) throw error;
  return data;
}

async function atualizarUsuario(user, id, payload) {
  const usuarioAlvo = await buscarUsuarioSeguro(user, id);

  const updates = {
    nome: payload.nome,
    email: payload.email,
    tipo: payload.tipo,
    ativo: payload.ativo,
    atualizado_em: new Date().toISOString()
  };

  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", usuarioAlvo.id)
    .select("id, empresa_id, nome, email, tipo, ativo, atualizado_em")
    .single();

  if (error) throw error;
  return data;
}

async function alterarSenha(user, id, senha) {
  if (!senha || senha.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  const usuarioAlvo = await buscarUsuarioSeguro(user, id);
  const senha_hash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .update({ senha_hash, atualizado_em: new Date().toISOString() })
    .eq("id", usuarioAlvo.id)
    .select("id, nome, email")
    .single();

  if (error) throw error;
  return data;
}

async function buscarUsuarioSeguro(user, id) {
  let query = supabase.from("usuarios").select("*").eq("id", id);

  if (user.tipo !== "superadmin") query = query.eq("empresa_id", user.empresaId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Usuário não encontrado ou sem permissão.");

  return data;
}

module.exports = { listarUsuarios, criarUsuario, atualizarUsuario, alterarSenha };

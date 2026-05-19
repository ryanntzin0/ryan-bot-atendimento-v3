const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("./supabaseClient");

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      empresaId: usuario.empresa_id,
      tipo: usuario.tipo,
      email: usuario.email
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "8h" }
  );
}

async function login(email, senha) {
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("id, empresa_id, nome, email, senha_hash, tipo, ativo, empresas(id, nome, plano, ativo)")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!usuario) return { erro: "E-mail ou senha inválidos." };
  if (!usuario.ativo) return { erro: "Usuário inativo. Fale com o administrador." };
  if (usuario.empresas && !usuario.empresas.ativo) return { erro: "Empresa inativa. Fale com o administrador." };

  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaOk) return { erro: "E-mail ou senha inválidos." };

  const token = gerarToken(usuario);

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      empresaId: usuario.empresa_id
    },
    empresa: usuario.empresas
  };
}

async function getMe(userId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, empresa_id, nome, email, tipo, ativo, empresas(id, nome, plano, ativo)")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = { login, getMe, gerarToken };

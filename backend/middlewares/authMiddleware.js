const jwt = require("jsonwebtoken");
const { supabase } = require("../services/supabaseClient");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.replace("Bearer ", "") : null;

    if (!token) return res.status(401).json({ erro: "Token não enviado." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("id, empresa_id, nome, email, tipo, ativo")
      .eq("id", decoded.id)
      .maybeSingle();

    if (error) throw error;
    if (!usuario || !usuario.ativo) return res.status(401).json({ erro: "Usuário inválido ou inativo." });

    req.user = {
      id: usuario.id,
      empresaId: usuario.empresa_id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };

    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

module.exports = { authMiddleware };

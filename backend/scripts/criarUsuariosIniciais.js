require("dotenv").config();

const bcrypt = require("bcryptjs");
const { supabase } = require("../services/supabaseClient");

async function main() {
  const senha = await bcrypt.hash("123456", 10);

  const { data: ryan } = await supabase.from("empresas").select("*").eq("slug", "ryan-studios").maybeSingle();
  const { data: portcell } = await supabase.from("empresas").select("*").eq("slug", "portcell").maybeSingle();

  if (!ryan || !portcell) {
    console.log("Crie/execute primeiro schema.sql e seed.sql para empresas.");
    process.exit(1);
  }

  const usuarios = [
    { empresa_id: ryan.id, nome: "Admin Ryan", email: "admin@ryanbot.com", senha_hash: senha, tipo: "superadmin", ativo: true },
    { empresa_id: portcell.id, nome: "Portcell Admin", email: "portcell@cliente.com", senha_hash: senha, tipo: "cliente", ativo: true },
    { empresa_id: portcell.id, nome: "Atendente Portcell", email: "atendente@portcell.com", senha_hash: senha, tipo: "atendente", ativo: true }
  ];

  for (const usuario of usuarios) {
    const { error } = await supabase.from("usuarios").upsert(usuario, { onConflict: "email" });
    if (error) console.error(error);
  }

  console.log("Usuários iniciais criados/atualizados. Senha padrão: 123456");
}

main();

/**
 * Script opcional para migrar dados JSON antigos para Supabase.
 * Uso: node scripts/migrarJsonParaSupabase.js ../database
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { supabase } = require("../services/supabaseClient");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.resolve(file), "utf-8")); }
  catch { return fallback; }
}

async function main() {
  const oldBase = process.argv[2];
  if (!oldBase) {
    console.log("Use: node scripts/migrarJsonParaSupabase.js ../database");
    process.exit(0);
  }

  const empresas = readJson(path.join(oldBase, "empresas.json"), []);
  const usuarios = readJson(path.join(oldBase, "usuarios.json"), []);
  const configs = readJson(path.join(oldBase, "configBot.json"), []);
  const menus = readJson(path.join(oldBase, "menus.json"), []);
  const atendimentos = readJson(path.join(oldBase, "atendimentos.json"), []);

  for (const e of empresas) {
    await supabase.from("empresas").upsert({
      id: e.id, nome: e.nome, slug: e.slug, ativo: e.ativo, plano: e.plano,
      cor_principal: e.corPrincipal || e.cor_principal || "#8b5cf6"
    }, { onConflict: "id" });
  }

  for (const u of usuarios) {
    const senha_hash = u.senha_hash || await bcrypt.hash(u.senha || "123456", 10);
    await supabase.from("usuarios").upsert({
      id: u.id, empresa_id: u.empresaId || u.empresa_id, nome: u.nome,
      email: u.email, senha_hash, tipo: u.tipo, ativo: u.ativo ?? true
    }, { onConflict: "email" });
  }

  for (const c of configs) {
    await supabase.from("config_bots").upsert({
      empresa_id: c.empresaId || c.empresa_id,
      empresa_nome: c.empresa || c.empresa_nome,
      bot_ativo: c.botAtivo ?? c.bot_ativo,
      mensagem_saudacao: c.mensagemSaudacao,
      mensagem_opcao_invalida: c.mensagemOpcaoInvalida,
      mensagem_finalizacao: c.mensagemFinalizacao,
      mensagem_fora_horario: c.mensagemForaHorario,
      mostrar_menu_na_saudacao: c.mostrarMenuNaSaudacao,
      horarios: c.horarios || {}
    }, { onConflict: "empresa_id" });
  }

  for (const m of menus) {
    await supabase.from("menus").upsert({
      id: m.id, empresa_id: m.empresaId || m.empresa_id, numero: m.numero,
      titulo: m.titulo, resposta: m.resposta, acao: m.acao,
      ativo: m.ativo, ordem: m.ordem
    }, { onConflict: "id" });
  }

  for (const a of atendimentos) {
    await supabase.from("atendimentos").upsert({
      id: a.id, empresa_id: a.empresaId || a.empresa_id, telefone: a.telefone,
      nome: a.nome, status: a.status, ultima_mensagem: a.ultimaMensagem,
      opcao_escolhida: a.opcaoEscolhida
    }, { onConflict: "id" });

    for (const msg of (a.mensagens || [])) {
      await supabase.from("mensagens_atendimento").insert({
        atendimento_id: a.id, empresa_id: a.empresaId || a.empresa_id,
        de: msg.de, texto: msg.texto, criado_em: msg.data || new Date().toISOString()
      });
    }
  }

  console.log("Migração concluída.");
}

main();

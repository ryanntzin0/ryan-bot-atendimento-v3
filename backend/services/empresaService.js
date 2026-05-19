const { supabase } = require("./supabaseClient");

async function listarEmpresas(user) {
  if (user.tipo === "superadmin") {
    const { data, error } = await supabase.from("empresas").select("*").order("criado_em", { ascending: false });
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.from("empresas").select("*").eq("id", user.empresaId);
  if (error) throw error;
  return data;
}

async function criarEmpresa(payload) {
  const empresa = {
    nome: payload.nome,
    slug: payload.slug,
    plano: payload.plano || "Inicial",
    cor_principal: payload.corPrincipal || payload.cor_principal || "#8b5cf6",
    ativo: payload.ativo ?? true
  };

  const { data, error } = await supabase.from("empresas").insert(empresa).select("*").single();
  if (error) throw error;

  await criarConfigInicial(data.id, data.nome);
  await criarMenusPadrao(data.id);

  return data;
}

async function atualizarEmpresa(id, payload) {
  const updates = {
    nome: payload.nome,
    slug: payload.slug,
    plano: payload.plano,
    cor_principal: payload.corPrincipal || payload.cor_principal,
    ativo: payload.ativo,
    atualizado_em: new Date().toISOString()
  };

  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const { data, error } = await supabase.from("empresas").update(updates).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

async function criarConfigInicial(empresaId, empresaNome) {
  const horarios = {
    segunda: { ativo: true, inicio: "09:00", fim: "18:00" },
    terca: { ativo: true, inicio: "09:00", fim: "18:00" },
    quarta: { ativo: true, inicio: "09:00", fim: "18:00" },
    quinta: { ativo: true, inicio: "09:00", fim: "18:00" },
    sexta: { ativo: true, inicio: "09:00", fim: "18:00" },
    sabado: { ativo: true, inicio: "09:00", fim: "13:00" },
    domingo: { ativo: false, inicio: "", fim: "" }
  };

  const { error } = await supabase.from("config_bots").insert({
    empresa_id: empresaId,
    empresa_nome: empresaNome,
    bot_ativo: true,
    mensagem_saudacao: `Olá! Seja bem-vindo(a) à ${empresaNome} 👋\nComo podemos ajudar?`,
    mensagem_opcao_invalida: "Não entendi sua opção 😅\nDigite uma opção válida.",
    mensagem_finalizacao: "Atendimento encerrado com sucesso ✅",
    mensagem_fora_horario: "Estamos fora do horário de atendimento.",
    mostrar_menu_na_saudacao: true,
    horarios
  });

  if (error && error.code !== "23505") throw error;
}

async function criarMenusPadrao(empresaId) {
  const menus = [
    { empresa_id: empresaId, numero: "1", titulo: "Vendas", resposta: "Você escolheu Vendas 🛒\nInforme o que procura.", acao: "responder", ativo: true, ordem: 1 },
    { empresa_id: empresaId, numero: "2", titulo: "Suporte", resposta: "Você escolheu Suporte 🛠️\nDescreva sua dúvida.", acao: "responder", ativo: true, ordem: 2 },
    { empresa_id: empresaId, numero: "3", titulo: "Falar com atendente", resposta: "Certo! Vou encaminhar para um atendente humano 👨‍💻", acao: "humano", ativo: true, ordem: 3 },
    { empresa_id: empresaId, numero: "4", titulo: "Encerrar", resposta: "Atendimento encerrado com sucesso ✅", acao: "finalizar", ativo: true, ordem: 4 }
  ];

  const { error } = await supabase.from("menus").insert(menus);
  if (error) throw error;
}

module.exports = { listarEmpresas, criarEmpresa, atualizarEmpresa, criarConfigInicial, criarMenusPadrao };

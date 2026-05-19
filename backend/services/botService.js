const { getConfig, getMenuByNumero, montarTextoMenu } = require("./configService");
const { buscarAberto, criarAtendimento, adicionarMensagem, atualizarStatus } = require("./atendimentoService");

async function montarSaudacao(empresaId, config) {
  const menu = await montarTextoMenu(empresaId);
  if (config?.mostrarMenuNaSaudacao && menu) {
    return `${config.mensagemSaudacao}\n\nDigite uma das opções abaixo:\n\n${menu}`;
  }
  return config?.mensagemSaudacao || "Olá! Como podemos ajudar?";
}

async function processarMensagem({ empresaId, telefone, nome, mensagem }) {
  const textoCliente = String(mensagem || "").trim();

  if (!empresaId || !telefone || !textoCliente) return { sucesso: false, resposta: "empresaId, telefone e mensagem são obrigatórios." };

  const config = await getConfig(empresaId);
  if (!config) return { sucesso: false, resposta: "Configuração do bot não encontrada." };

  if (!config.botAtivo) return { sucesso: true, resposta: "", observacao: "Bot pausado." };

  let atendimento = await buscarAberto(empresaId, telefone);

  if (!atendimento) {
    atendimento = await criarAtendimento({ empresaId, telefone, nome });
    await adicionarMensagem(empresaId, atendimento.id, "cliente", textoCliente);
    const saudacao = await montarSaudacao(empresaId, config);
    await adicionarMensagem(empresaId, atendimento.id, "bot", saudacao);
    await atualizarStatus(empresaId, atendimento.id, "em atendimento automático");
    return { sucesso: true, resposta: saudacao, atendimentoId: atendimento.id };
  }

  await adicionarMensagem(empresaId, atendimento.id, "cliente", textoCliente);

  if (["aguardando atendente humano", "em atendimento humano"].includes(atendimento.status)) {
    return { sucesso: true, resposta: "", observacao: "Atendimento está com atendente humano.", atendimentoId: atendimento.id };
  }

  const menu = await getMenuByNumero(empresaId, textoCliente);

  if (!menu) {
    const textoMenu = await montarTextoMenu(empresaId);
    const resposta = `${config.mensagemOpcaoInvalida}\n\n${textoMenu}`;
    await adicionarMensagem(empresaId, atendimento.id, "bot", resposta);
    await atualizarStatus(empresaId, atendimento.id, "aguardando resposta");
    return { sucesso: true, resposta, atendimentoId: atendimento.id };
  }

  let novoStatus = "em atendimento automático";
  if (menu.acao === "humano") novoStatus = "aguardando atendente humano";
  if (menu.acao === "finalizar") novoStatus = "finalizado";

  const resposta = menu.acao === "finalizar" ? (menu.resposta || config.mensagemFinalizacao) : menu.resposta;
  await adicionarMensagem(empresaId, atendimento.id, "bot", resposta);
  await atualizarStatus(empresaId, atendimento.id, novoStatus, { opcaoEscolhida: menu.titulo });

  return { sucesso: true, resposta, acao: menu.acao, atendimentoId: atendimento.id };
}

module.exports = { processarMensagem };

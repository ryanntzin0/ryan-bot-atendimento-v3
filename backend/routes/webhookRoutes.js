const express = require("express");
const { processarMensagem } = require("../services/botService");
const {
  validateWebhookVerifyToken,
  extractMessageFromWebhook,
  getWhatsAppConfigByPhoneNumberId,
  sendWhatsAppTextMessage
} = require("../services/whatsappService");

const router = express.Router();

router.post("/simular", async (req, res, next) => {
  try {
    res.json(await processarMensagem({ ...req.body, origem: "simulador" }));
  } catch (error) {
    next(error);
  }
});

router.get("/whatsapp", async (req, res, next) => {
  try {
    const resultado = await validateWebhookVerifyToken(req);

    if (!resultado.ok) {
      return res.status(resultado.status || 403).send(resultado.mensagem || "Forbidden");
    }

    return res.status(200).send(resultado.challenge);
  } catch (error) {
    next(error);
  }
});

router.post("/whatsapp", async (req, res, next) => {
  try {
    const incoming = extractMessageFromWebhook(req.body);

    if (incoming.ignorar) {
      return res.status(200).json({ recebido: true, ignorado: true, motivo: incoming.motivo });
    }

    const integracao = await getWhatsAppConfigByPhoneNumberId(incoming.phoneNumberId);

    if (!integracao) {
      return res.status(200).json({
        recebido: true,
        processado: false,
        motivo: "Nenhuma empresa encontrada para esse phone_number_id."
      });
    }

    const resultadoBot = await processarMensagem({
      empresaId: integracao.empresa_id,
      telefone: incoming.telefone,
      nome: incoming.nome,
      mensagem: incoming.mensagem,
      origem: "whatsapp"
    });

    let envio = { enviado: false, motivo: "Bot não gerou resposta." };

    if (resultadoBot?.resposta) {
      envio = await sendWhatsAppTextMessage(integracao.empresa_id, incoming.telefone, resultadoBot.resposta);
    }

    return res.status(200).json({
      recebido: true,
      processado: true,
      atendimentoId: resultadoBot?.atendimentoId,
      whatsapp: envio
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

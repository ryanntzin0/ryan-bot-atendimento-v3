const express = require("express");
const { processarMensagem } = require("../services/botService");

const router = express.Router();

router.post("/simular", async (req, res, next) => {
  try { res.json(await processarMensagem(req.body)); }
  catch (error) { next(error); }
});

router.post("/whatsapp", async (req, res) => {
  res.json({ recebido: true, mensagem: "Webhook preparado, mas WhatsApp real ainda não conectado." });
});

module.exports = router;

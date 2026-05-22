const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { canAccessEmpresa, blockAtendente } = require("../middlewares/permissionMiddleware");
const {
  getWhatsAppConfigByEmpresa,
  saveWhatsAppConfig,
  sendWhatsAppTextMessage
} = require("../services/whatsappService");

const router = express.Router();

router.use(authMiddleware);
router.use(canAccessEmpresa);
router.use(blockAtendente);

router.get("/", async (req, res, next) => {
  try {
    const config = await getWhatsAppConfigByEmpresa(req.query.empresaId, { mask: true });
    res.json(config);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const config = await saveWhatsAppConfig(req.query.empresaId, req.body);
    res.json(config);
  } catch (error) {
    next(error);
  }
});

router.post("/testar-envio", async (req, res, next) => {
  try {
    const { telefone, mensagem } = req.body;

    if (!telefone || !mensagem) {
      return res.status(400).json({ erro: "Telefone e mensagem são obrigatórios." });
    }

    const resultado = await sendWhatsAppTextMessage(req.query.empresaId, telefone, mensagem);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

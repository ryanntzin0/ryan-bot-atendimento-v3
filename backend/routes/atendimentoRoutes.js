const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { canViewAtendimentos, blockAtendente } = require("../middlewares/permissionMiddleware");
const { listarAtendimentos, buscarAtendimento, atualizarStatus, responderManual, limparAtendimentos } = require("../services/atendimentoService");

const router = express.Router();
router.use(authMiddleware);
router.use(canViewAtendimentos);

router.get("/", async (req, res, next) => {
  try { res.json(await listarAtendimentos(req.query.empresaId, req.query.status)); }
  catch (error) { next(error); }
});

router.delete("/", blockAtendente, async (req, res, next) => {
  try { res.json(await limparAtendimentos(req.query.empresaId)); }
  catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const atendimento = await buscarAtendimento(req.query.empresaId, req.params.id);
    if (!atendimento) return res.status(404).json({ erro: "Atendimento não encontrado." });
    res.json(atendimento);
  } catch (error) { next(error); }
});

router.patch("/:id/status", async (req, res, next) => {
  try { res.json(await atualizarStatus(req.query.empresaId, req.params.id, req.body.status)); }
  catch (error) { next(error); }
});

router.post("/:id/responder", async (req, res, next) => {
  try { res.json(await responderManual(req.query.empresaId, req.params.id, req.body.texto)); }
  catch (error) { next(error); }
});

module.exports = router;

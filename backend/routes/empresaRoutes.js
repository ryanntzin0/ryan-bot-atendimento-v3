const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { onlySuperadmin } = require("../middlewares/permissionMiddleware");
const { listarEmpresas, criarEmpresa, atualizarEmpresa } = require("../services/empresaService");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try { res.json(await listarEmpresas(req.user)); }
  catch (error) { next(error); }
});

router.post("/", onlySuperadmin, async (req, res, next) => {
  try { res.status(201).json(await criarEmpresa(req.body)); }
  catch (error) { next(error); }
});

router.put("/:id", onlySuperadmin, async (req, res, next) => {
  try { res.json(await atualizarEmpresa(req.params.id, req.body)); }
  catch (error) { next(error); }
});

router.patch("/:id/status", onlySuperadmin, async (req, res, next) => {
  try { res.json(await atualizarEmpresa(req.params.id, { ativo: req.body.ativo })); }
  catch (error) { next(error); }
});

module.exports = router;

const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { canAccessEmpresa, blockAtendente } = require("../middlewares/permissionMiddleware");
const { listarMenus, criarMenu, atualizarMenu, excluirMenu } = require("../services/menuService");

const router = express.Router();
router.use(authMiddleware);
router.use(canAccessEmpresa);

router.get("/", async (req, res, next) => {
  try { res.json(await listarMenus(req.query.empresaId)); }
  catch (error) { next(error); }
});

router.post("/", blockAtendente, async (req, res, next) => {
  try { res.status(201).json(await criarMenu(req.body.empresaId || req.query.empresaId, req.body)); }
  catch (error) { next(error); }
});

router.put("/:id", blockAtendente, async (req, res, next) => {
  try { res.json(await atualizarMenu(req.body.empresaId || req.query.empresaId, req.params.id, req.body)); }
  catch (error) { next(error); }
});

router.delete("/:id", blockAtendente, async (req, res, next) => {
  try { res.json(await excluirMenu(req.query.empresaId, req.params.id)); }
  catch (error) { next(error); }
});

module.exports = router;

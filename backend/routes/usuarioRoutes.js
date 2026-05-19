const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { canManageUsers } = require("../middlewares/permissionMiddleware");
const { listarUsuarios, criarUsuario, atualizarUsuario, alterarSenha } = require("../services/usuarioService");

const router = express.Router();
router.use(authMiddleware);
router.use(canManageUsers);

router.get("/", async (req, res, next) => {
  try { res.json(await listarUsuarios(req.user, req.query.empresaId)); }
  catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try { res.status(201).json(await criarUsuario(req.user, req.body)); }
  catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try { res.json(await atualizarUsuario(req.user, req.params.id, req.body)); }
  catch (error) { next(error); }
});

router.patch("/:id/status", async (req, res, next) => {
  try { res.json(await atualizarUsuario(req.user, req.params.id, { ativo: req.body.ativo })); }
  catch (error) { next(error); }
});

router.patch("/:id/senha", async (req, res, next) => {
  try { res.json(await alterarSenha(req.user, req.params.id, req.body.senha)); }
  catch (error) { next(error); }
});

module.exports = router;

const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { canAccessEmpresa, blockAtendente } = require("../middlewares/permissionMiddleware");
const { getConfig, saveConfig } = require("../services/configService");

const router = express.Router();
router.use(authMiddleware);
router.use(canAccessEmpresa);

router.get("/", async (req, res, next) => {
  try { res.json(await getConfig(req.query.empresaId)); }
  catch (error) { next(error); }
});

router.put("/", blockAtendente, async (req, res, next) => {
  try { res.json(await saveConfig(req.query.empresaId, req.body)); }
  catch (error) { next(error); }
});

module.exports = router;

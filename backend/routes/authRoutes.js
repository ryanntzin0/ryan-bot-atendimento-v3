const express = require("express");
const { login, getMe } = require("../services/authService");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const result = await login(email, senha);
    if (result.erro) return res.status(401).json({ erro: result.erro });
    res.json(result);
  } catch (error) { next(error); }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    res.json(await getMe(req.user.id));
  } catch (error) { next(error); }
});

module.exports = router;

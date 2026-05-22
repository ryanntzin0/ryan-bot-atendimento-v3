require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const configRoutes = require("./routes/configRoutes");
const menuRoutes = require("./routes/menuRoutes");
const atendimentoRoutes = require("./routes/atendimentoRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const whatsappConfigRoutes = require("./routes/whatsappConfigRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.json({
    app: "Ryan Bot Atendimento",
    version: "5.0.0",
    status: "online",
    database: "supabase",
    whatsapp: "prepared"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/config", configRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/atendimentos", atendimentoRoutes);
app.use("/api/whatsapp-config", whatsappConfigRoutes);
app.use("/webhook", webhookRoutes);

app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({
    erro: "Erro interno no servidor.",
    detalhe: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Ryan Bot Atendimento V5 rodando em http://localhost:${PORT}`);
});

const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// Página inicial
app.get("/", (req, res) => {
  res.send("HealthBot está rodando na nuvem! ✅");
});

// Iniciar o bot
const botProcess = spawn("node", ["app/bot/index.js"], {
  stdio: "inherit",
  shell: true
});

botProcess.on("close", (code) => {
  console.log(`Bot finalizado com código ${code}`);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
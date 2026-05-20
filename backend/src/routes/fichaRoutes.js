const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { criarFicha } = require("../controllers/fichaController");

// POST /fichas — cria nova ficha de treino
router.post("/", authMiddleware, criarFicha);

module.exports = router;

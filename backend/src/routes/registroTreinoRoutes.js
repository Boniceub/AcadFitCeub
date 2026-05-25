const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  registrarTreino,
  listarTreinosRealizados,
} = require("../controllers/registroTreinoController");

// POST /treinos-realizados — marca um treino como concluído
router.post("/", authMiddleware, registrarTreino);

// GET /treinos-realizados — lista todos os treinos realizados do usuário
router.get("/", authMiddleware, listarTreinosRealizados);

module.exports = router;

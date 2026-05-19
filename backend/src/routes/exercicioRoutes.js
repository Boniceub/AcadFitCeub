const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listarExercicios,
  buscarExercicioPorId,
} = require("../controllers/exercicioController");

// GET /exercicios — lista todos, com filtro opcional por tipo
router.get("/", authMiddleware, listarExercicios);

// GET /exercicios/:id — detalhes de um exercício
router.get("/:id", authMiddleware, buscarExercicioPorId);

module.exports = router;

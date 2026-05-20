const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listarExercicios,
  buscarExercicioPorId,
  criarExercicio,
  editarExercicio,
  deletarExercicio,
} = require("../controllers/exercicioController");

// GET /exercicios — lista todos, com filtro opcional por tipo
router.get("/", authMiddleware, listarExercicios);

// GET /exercicios/:id — detalhes de um exercício
router.get("/:id", authMiddleware, buscarExercicioPorId);

// POST /exercicios — cria novo exercício (admin)
router.post("/", authMiddleware, criarExercicio);

// PUT /exercicios/:id — edita exercício (admin)
router.put("/:id", authMiddleware, editarExercicio);

// DELETE /exercicios/:id — deleta exercício (admin)
router.delete("/:id", authMiddleware, deletarExercicio);

module.exports = router;

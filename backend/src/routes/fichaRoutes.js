const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  criarFicha,
  listarFichas,
  buscarFichaPorId,
  editarFicha,
  deletarFicha,
  adicionarExercicio,
  editarExercicioDaFicha,
  removerExercicio,
  treino_do_dia,
} = require("../controllers/fichaController");

// POST /fichas — cria nova ficha de treino
router.post("/", authMiddleware, criarFicha);

// GET /fichas/treino-do-dia — retorna a ficha do dia atual
router.get("/treino-do-dia", authMiddleware, treino_do_dia);

// GET /fichas — lista todas as fichas do usuário
router.get("/", authMiddleware, listarFichas);

// GET /fichas/:id — detalhes de uma ficha com seus exercícios
router.get("/:id", authMiddleware, buscarFichaPorId);

// PUT /fichas/:id — edita nome da ficha
router.put("/:id", authMiddleware, editarFicha);

// DELETE /fichas/:id — deleta uma ficha
router.delete("/:id", authMiddleware, deletarFicha);

// POST /fichas/:id/exercicios — adiciona exercício a uma ficha
router.post("/:id/exercicios", authMiddleware, adicionarExercicio);

// PUT /fichas/:id/exercicios/:exercicio_id — edita exercício de uma ficha
router.put(
  "/:id/exercicios/:exercicio_id",
  authMiddleware,
  editarExercicioDaFicha,
);

// DELETE /fichas/:id/exercicios/:exercicio_id — remove exercício de uma ficha
router.delete(
  "/:id/exercicios/:exercicio_id",
  authMiddleware,
  removerExercicio,
);

module.exports = router;

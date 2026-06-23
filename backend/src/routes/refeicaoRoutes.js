const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  listarRefeicoes,
  buscarRefeicaoPorId,
  criarRefeicao,
  editarRefeicao,
  deletarRefeicao,
  adicionarAlimentoNaRefeicao,
  editarQuantidadeAlimento,
  removerAlimentoDaRefeicao,
} = require("../controllers/refeicaoController");

// GET /refeicoes
router.get("/", authMiddleware, listarRefeicoes);

// GET /refeicoes/:id
router.get("/:id", authMiddleware, buscarRefeicaoPorId);

// POST /refeicoes
router.post("/", authMiddleware, criarRefeicao);

// POST /refeicoes/:id/alimentos
router.post("/:id/alimentos", authMiddleware, adicionarAlimentoNaRefeicao);

// PUT /refeicoes/:id/alimentos/:itemId
router.put("/:id/alimentos/:itemId", authMiddleware, editarQuantidadeAlimento);

// PUT /refeicoes/:id
router.put("/:id", authMiddleware, editarRefeicao);

// DELETE /refeicoes/:id
router.delete("/:id", authMiddleware, deletarRefeicao);

// DELETE /refeicoes/:id/alimentos/:itemId
router.delete(
  "/:id/alimentos/:itemId",
  authMiddleware,
  removerAlimentoDaRefeicao,
);

module.exports = router;

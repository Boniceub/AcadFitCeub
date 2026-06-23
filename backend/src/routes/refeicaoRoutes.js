const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  listarRefeicoes,
  buscarRefeicaoPorId,
  criarRefeicao,
  editarRefeicao,
  deletarRefeicao,
} = require("../controllers/refeicaoController");

// GET /refeicoes
router.get("/", authMiddleware, listarRefeicoes);

// GET /refeicoes/:id
router.get("/:id", authMiddleware, buscarRefeicaoPorId);

// POST /refeicoes
router.post("/", authMiddleware, criarRefeicao);

// PUT /refeicoes/:id
router.put("/:id", authMiddleware, editarRefeicao);

// DELETE /refeicoes/:id
router.delete("/:id", authMiddleware, deletarRefeicao);

module.exports = router;

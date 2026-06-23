const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  listarAlimentos,
  buscarAlimentoPorId,
  criarAlimento,
  editarAlimento,
  deletarAlimento,
} = require("../controllers/alimentoController");

// GET /alimentos
router.get("/", authMiddleware, listarAlimentos);

// GET /alimentos/:id
router.get("/:id", authMiddleware, buscarAlimentoPorId);

// POST /alimentos
router.post("/", authMiddleware, criarAlimento);

// PUT /alimentos/:id
router.put("/:id", authMiddleware, editarAlimento);

// DELETE /alimentos/:id
router.delete("/:id", authMiddleware, deletarAlimento);

module.exports = router;

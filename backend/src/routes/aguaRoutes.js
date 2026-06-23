const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  listarRegistrosAgua,
  buscarRegistroAguaPorId,
  criarRegistroAgua,
  editarRegistroAgua,
  deletarRegistroAgua,
} = require("../controllers/aguaController");

// GET /agua
router.get("/", authMiddleware, listarRegistrosAgua);

// GET /agua/:id
router.get("/:id", authMiddleware, buscarRegistroAguaPorId);

// POST /agua
router.post("/", authMiddleware, criarRegistroAgua);

// PUT /agua/:id
router.put("/:id", authMiddleware, editarRegistroAgua);

// DELETE /agua/:id
router.delete("/:id", authMiddleware, deletarRegistroAgua);

module.exports = router;

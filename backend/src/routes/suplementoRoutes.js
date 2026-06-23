const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  listarSuplementos,
  buscarSuplementoPorId,
  criarSuplemento,
  editarSuplemento,
  deletarSuplemento,
} = require("../controllers/suplementoController");

// GET /suplementos
router.get("/", authMiddleware, listarSuplementos);

// GET /suplementos/:id
router.get("/:id", authMiddleware, buscarSuplementoPorId);

// POST /suplementos
router.post("/", authMiddleware, criarSuplemento);

// PUT /suplementos/:id
router.put("/:id", authMiddleware, editarSuplemento);

// DELETE /suplementos/:id
router.delete("/:id", authMiddleware, deletarSuplemento);

module.exports = router;

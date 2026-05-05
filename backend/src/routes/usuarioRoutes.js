const express = require("express");
const router = express.Router();
const {
  getPerfil,
  atualizarPerfil,
  alterarSenha,
} = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/:id", authMiddleware, getPerfil);
router.put("/:id", authMiddleware, atualizarPerfil);
router.put("/:id/senha", authMiddleware, alterarSenha);

module.exports = router;

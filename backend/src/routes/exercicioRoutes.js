const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { listarExercicios } = require("../controllers/exercicioController");

// GET /exercicios — lista todos, com filtro opcional por tipo
router.get("/", authMiddleware, listarExercicios);

module.exports = router;

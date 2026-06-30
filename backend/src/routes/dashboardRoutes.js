const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { buscarResumoDashboard } = require("../controllers/dashboardController");

// GET /dashboard/:usuario_id?data=AAAA-MM-DD
router.get("/:usuario_id", authMiddleware, buscarResumoDashboard);

module.exports = router;

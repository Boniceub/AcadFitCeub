require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const exercicioRoutes = require("./src/routes/exercicioRoutes");
const fichaRoutes = require("./src/routes/fichaRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/exercicios", exercicioRoutes);
app.use("/fichas", fichaRoutes);

app.get("/", (req, res) => res.json({ message: "AcadFitCeub API rodando!" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));

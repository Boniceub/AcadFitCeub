const supabase = require("../config/supabase");

// GET /exercicios — lista todos, com filtro opcional por tipo
const listarExercicios = async (req, res) => {
  const { tipo } = req.query;

  let query = supabase.from("exercicio").select("*").order("nome");

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao buscar exercícios.", detalhe: error.message });
  }

  return res.status(200).json(data);
};

module.exports = { listarExercicios };

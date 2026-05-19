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

// GET /exercicios/:id — detalhes de um exercício
const buscarExercicioPorId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("exercicio")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Exercício não encontrado." });
  }

  return res.status(200).json(data);
};

module.exports = { listarExercicios, buscarExercicioPorId };

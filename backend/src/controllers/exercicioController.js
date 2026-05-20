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

// POST /exercicios — cria novo exercício (admin)
const criarExercicio = async (req, res) => {
  const { nome, musculo_alvo, tipo } = req.body;

  if (!nome || !musculo_alvo || !tipo) {
    return res
      .status(400)
      .json({ erro: "Nome, músculo alvo e tipo são obrigatórios." });
  }

  const { data, error } = await supabase
    .from("exercicio")
    .insert([{ nome, musculo_alvo, tipo }])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao criar exercício.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Exercício criado com sucesso!", exercicio: data });
};

// PUT /exercicios/:id — edita exercício (admin)
const editarExercicio = async (req, res) => {
  const { id } = req.params;
  const { nome, musculo_alvo, tipo } = req.body;

  if (!nome || !musculo_alvo || !tipo) {
    return res
      .status(400)
      .json({ erro: "Nome, músculo alvo e tipo são obrigatórios." });
  }

  const { data, error } = await supabase
    .from("exercicio")
    .update({ nome, musculo_alvo, tipo })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Exercício não encontrado." });
  }

  return res
    .status(200)
    .json({ mensagem: "Exercício atualizado com sucesso!", exercicio: data });
};

// DELETE /exercicios/:id — remove exercício (admin)
const deletarExercicio = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("exercicio").delete().eq("id", id);

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao deletar exercício.", detalhe: error.message });
  }

  return res.status(200).json({ mensagem: "Exercício deletado com sucesso!" });
};

module.exports = {
  listarExercicios,
  buscarExercicioPorId,
  criarExercicio,
  editarExercicio,
  deletarExercicio,
};

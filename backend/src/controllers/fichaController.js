const supabase = require("../config/supabase");

// POST /fichas — cria nova ficha de treino
const criarFicha = async (req, res) => {
  const { nome } = req.body;
  const usuario_id = req.usuario.id;

  if (!nome) {
    return res.status(400).json({ erro: "Nome da ficha é obrigatório." });
  }

  const { data, error } = await supabase
    .from("ficha_treino")
    .insert([{ nome, usuario_id }])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao criar ficha.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Ficha criada com sucesso!", ficha: data });
};

// GET /fichas — lista todas as fichas do usuário
const listarFichas = async (req, res) => {
  const usuario_id = req.usuario.id;

  const { data, error } = await supabase
    .from("ficha_treino")
    .select("*")
    .eq("usuario_id", usuario_id)
    .order("criado_em");

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao buscar fichas.", detalhe: error.message });
  }

  return res.status(200).json(data);
};

// GET /fichas/:id — detalhes de uma ficha com seus exercícios
const buscarFichaPorId = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  const { data, error } = await supabase
    .from("ficha_treino")
    .select("*, ficha_exercicio(*, exercicio(*))")
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Ficha não encontrada." });
  }

  return res.status(200).json(data);
};

// PUT /fichas/:id — edita nome da ficha
const editarFicha = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const usuario_id = req.usuario.id;

  if (!nome) {
    return res.status(400).json({ erro: "Nome da ficha é obrigatório." });
  }

  const { data, error } = await supabase
    .from("ficha_treino")
    .update({ nome })
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Ficha não encontrada." });
  }

  return res
    .status(200)
    .json({ mensagem: "Ficha atualizada com sucesso!", ficha: data });
};

// DELETE /fichas/:id — deleta uma ficha
const deletarFicha = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  const { error } = await supabase
    .from("ficha_treino")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario_id);

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao deletar ficha.", detalhe: error.message });
  }

  return res.status(200).json({ mensagem: "Ficha deletada com sucesso!" });
};

module.exports = {
  criarFicha,
  listarFichas,
  buscarFichaPorId,
  editarFicha,
  deletarFicha,
};

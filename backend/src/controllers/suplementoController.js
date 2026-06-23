const supabase = require("../config/supabase");

// GET /suplementos
const listarSuplementos = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { data } = req.query;

  let query = supabase
    .from("suplemento")
    .select("*")
    .eq("usuario_id", usuario_id)
    .order("data", { ascending: false });

  if (data) {
    query = query.eq("data", data);
  }

  const { data: suplementos, error } = await query;

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao buscar suplementos.", detalhe: error.message });
  }

  return res.status(200).json(suplementos);
};

// GET /suplementos/:id
const buscarSuplementoPorId = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("suplemento")
    .select("*")
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Suplemento nao encontrado." });
  }

  return res.status(200).json(data);
};

// POST /suplementos
const criarSuplemento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { nome, dosagem, horario, data, observacoes } = req.body;

  if (!nome || !data) {
    return res.status(400).json({ erro: "Nome e data sao obrigatorios." });
  }

  const { data: suplemento, error } = await supabase
    .from("suplemento")
    .insert([
      {
        usuario_id,
        nome,
        dosagem,
        horario,
        data,
        observacoes,
      },
    ])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao criar suplemento.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Suplemento criado com sucesso!", suplemento });
};

// PUT /suplementos/:id
const editarSuplemento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;
  const { nome, dosagem, horario, data, observacoes } = req.body;

  if (!nome || !data) {
    return res.status(400).json({ erro: "Nome e data sao obrigatorios." });
  }

  const { data: suplemento, error } = await supabase
    .from("suplemento")
    .update({
      nome,
      dosagem,
      horario,
      data,
      observacoes,
    })
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select()
    .single();

  if (error || !suplemento) {
    return res.status(404).json({ erro: "Suplemento nao encontrado." });
  }

  return res
    .status(200)
    .json({ mensagem: "Suplemento atualizado com sucesso!", suplemento });
};

// DELETE /suplementos/:id
const deletarSuplemento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { error } = await supabase
    .from("suplemento")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario_id);

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao deletar suplemento.", detalhe: error.message });
  }

  return res.status(200).json({ mensagem: "Suplemento deletado com sucesso!" });
};

module.exports = {
  listarSuplementos,
  buscarSuplementoPorId,
  criarSuplemento,
  editarSuplemento,
  deletarSuplemento,
};

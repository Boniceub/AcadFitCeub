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

module.exports = { criarFicha };

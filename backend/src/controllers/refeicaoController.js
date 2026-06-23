const supabase = require("../config/supabase");

const valoresPositivos = ({
  calorias,
  proteinas_g,
  carboidratos_g,
  gorduras_g,
}) => {
  const valores = [calorias, proteinas_g, carboidratos_g, gorduras_g];

  return valores.every((valor) => {
    if (valor === undefined || valor === null || valor === "") return true;
    return Number(valor) >= 0;
  });
};

// GET /refeicoes
const listarRefeicoes = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { data, tipo } = req.query;

  let query = supabase
    .from("refeicao")
    .select("*")
    .eq("usuario_id", usuario_id)
    .order("data", { ascending: false });

  if (data) {
    query = query.eq("data", data);
  }

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data: refeicoes, error } = await query;

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao buscar refeicoes.", detalhe: error.message });
  }

  return res.status(200).json(refeicoes);
};

// GET /refeicoes/:id
const buscarRefeicaoPorId = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("refeicao")
    .select("*")
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Refeicao nao encontrada." });
  }

  return res.status(200).json(data);
};

// POST /refeicoes
const criarRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;

  const {
    nome,
    data,
    tipo,
    calorias,
    proteinas_g,
    carboidratos_g,
    gorduras_g,
    horario,
    observacoes,
  } = req.body;

  if (!data || !tipo) {
    return res.status(400).json({ erro: "Data e tipo sao obrigatorios." });
  }

  if (
    !valoresPositivos({
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
    })
  ) {
    return res.status(400).json({
      erro: "Calorias e macros devem ser valores positivos.",
    });
  }

  const { data: refeicao, error } = await supabase
    .from("refeicao")
    .insert([
      {
        usuario_id,
        nome,
        data,
        tipo,
        calorias,
        proteinas_g,
        carboidratos_g,
        gorduras_g,
        horario,
        observacoes,
      },
    ])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao criar refeicao.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Refeicao criada com sucesso!", refeicao });
};

// PUT /refeicoes/:id
const editarRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const {
    nome,
    data,
    tipo,
    calorias,
    proteinas_g,
    carboidratos_g,
    gorduras_g,
    horario,
    observacoes,
  } = req.body;

  if (!data || !tipo) {
    return res.status(400).json({ erro: "Data e tipo sao obrigatorios." });
  }

  if (
    !valoresPositivos({
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
    })
  ) {
    return res.status(400).json({
      erro: "Calorias e macros devem ser valores positivos.",
    });
  }

  const { data: refeicao, error } = await supabase
    .from("refeicao")
    .update({
      nome,
      data,
      tipo,
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
      horario,
      observacoes,
    })
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select()
    .single();

  if (error || !refeicao) {
    return res.status(404).json({ erro: "Refeicao nao encontrada." });
  }

  return res
    .status(200)
    .json({ mensagem: "Refeicao atualizada com sucesso!", refeicao });
};

// DELETE /refeicoes/:id
const deletarRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { error } = await supabase
    .from("refeicao")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario_id);

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao deletar refeicao.", detalhe: error.message });
  }

  return res.status(200).json({ mensagem: "Refeicao deletada com sucesso!" });
};

module.exports = {
  listarRefeicoes,
  buscarRefeicaoPorId,
  criarRefeicao,
  editarRefeicao,
  deletarRefeicao,
};

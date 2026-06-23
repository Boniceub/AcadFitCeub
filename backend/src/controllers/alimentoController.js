const supabase = require("../config/supabase");

const valoresPositivos = ({
  calorias,
  proteinas_g,
  carboidratos_g,
  gorduras_g,
  porcao,
}) => {
  const valores = [calorias, proteinas_g, carboidratos_g, gorduras_g, porcao];

  return valores.every((valor) => {
    if (valor === undefined || valor === null || valor === "") return true;
    return Number(valor) >= 0;
  });
};

// GET /alimentos
const listarAlimentos = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { busca } = req.query;

  let query = supabase
    .from("alimento")
    .select("*")
    .eq("usuario_id", usuario_id)
    .order("nome");

  if (busca) {
    query = query.ilike("nome", `%${busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao buscar alimentos.", detalhe: error.message });
  }

  return res.status(200).json(data);
};

// GET /alimentos/:id
const buscarAlimentoPorId = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("alimento")
    .select("*")
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Alimento nao encontrado." });
  }

  return res.status(200).json(data);
};

// POST /alimentos
const criarAlimento = async (req, res) => {
  const usuario_id = req.usuario.id;

  const {
    nome,
    calorias,
    proteinas_g,
    carboidratos_g,
    gorduras_g,
    porcao,
    unidade,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "Nome do alimento e obrigatorio." });
  }

  if (
    !valoresPositivos({
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
      porcao,
    })
  ) {
    return res.status(400).json({
      erro: "Calorias, macros e porcao devem ser valores positivos.",
    });
  }

  const { data, error } = await supabase
    .from("alimento")
    .insert([
      {
        usuario_id,
        nome,
        calorias,
        proteinas_g,
        carboidratos_g,
        gorduras_g,
        porcao,
        unidade,
      },
    ])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao criar alimento.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Alimento criado com sucesso!", alimento: data });
};

// PUT /alimentos/:id
const editarAlimento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const {
    nome,
    calorias,
    proteinas_g,
    carboidratos_g,
    gorduras_g,
    porcao,
    unidade,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "Nome do alimento e obrigatorio." });
  }

  if (
    !valoresPositivos({
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
      porcao,
    })
  ) {
    return res.status(400).json({
      erro: "Calorias, macros e porcao devem ser valores positivos.",
    });
  }

  const { data, error } = await supabase
    .from("alimento")
    .update({
      nome,
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
      porcao,
      unidade,
    })
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Alimento nao encontrado." });
  }

  return res
    .status(200)
    .json({ mensagem: "Alimento atualizado com sucesso!", alimento: data });
};

// DELETE /alimentos/:id
const deletarAlimento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { error } = await supabase
    .from("alimento")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario_id);

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao deletar alimento.", detalhe: error.message });
  }

  return res.status(200).json({ mensagem: "Alimento deletado com sucesso!" });
};

module.exports = {
  listarAlimentos,
  buscarAlimentoPorId,
  criarAlimento,
  editarAlimento,
  deletarAlimento,
};

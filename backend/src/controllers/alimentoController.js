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
    return Number.isFinite(Number(valor)) && Number(valor) >= 0;
  });
};

// GET /alimentos
const listarAlimentos = async (req, res) => {
  const { busca } = req.query;

  let query = supabase.from("alimento").select("*").order("nome");

  if (busca?.trim()) {
    query = query.ilike("nome", `%${busca.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({
      erro: "Erro ao buscar alimentos.",
      detalhe: error.message,
    });
  }

  return res.status(200).json(data);
};

// GET /alimentos/:id
const buscarAlimentoPorId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("alimento")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao buscar alimento.",
      detalhe: error.message,
    });
  }

  if (!data) {
    return res.status(404).json({ erro: "Alimento nao encontrado." });
  }

  return res.status(200).json(data);
};

// POST /alimentos
const criarAlimento = async (req, res) => {
  const {
    nome,
    calorias,
    proteinas_g,
    carboidratos_g,
    gorduras_g,
    porcao,
    unidade,
  } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({
      erro: "Nome do alimento e obrigatorio.",
    });
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
        nome: nome.trim(),
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
    return res.status(500).json({
      erro: "Erro ao criar alimento.",
      detalhe: error.message,
    });
  }

  return res.status(201).json({
    mensagem: "Alimento criado com sucesso!",
    alimento: data,
  });
};

// PUT /alimentos/:id
const editarAlimento = async (req, res) => {
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

  if (!nome?.trim()) {
    return res.status(400).json({
      erro: "Nome do alimento e obrigatorio.",
    });
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
      nome: nome.trim(),
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
      porcao,
      unidade,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao atualizar alimento.",
      detalhe: error.message,
    });
  }

  if (!data) {
    return res.status(404).json({ erro: "Alimento nao encontrado." });
  }

  return res.status(200).json({
    mensagem: "Alimento atualizado com sucesso!",
    alimento: data,
  });
};

// DELETE /alimentos/:id
const deletarAlimento = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("alimento")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao deletar alimento.",
      detalhe: error.message,
    });
  }

  if (!data) {
    return res.status(404).json({ erro: "Alimento nao encontrado." });
  }

  return res.status(200).json({
    mensagem: "Alimento deletado com sucesso!",
  });
};

module.exports = {
  listarAlimentos,
  buscarAlimentoPorId,
  criarAlimento,
  editarAlimento,
  deletarAlimento,
};

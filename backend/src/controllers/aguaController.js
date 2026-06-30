const supabase = require("../config/supabase");

const dataValida = (data) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(data);
};

const quantidadeValida = (quantidade) => {
  return Number.isInteger(Number(quantidade)) && Number(quantidade) > 0;
};

// GET /agua?data=AAAA-MM-DD
const listarRegistrosAgua = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { data } = req.query;

  let query = supabase
    .from("registro_agua")
    .select("*")
    .eq("usuario_id", usuario_id)
    .order("criado_em", { ascending: false });

  if (data) {
    if (!dataValida(data)) {
      return res.status(400).json({
        erro: "A data deve estar no formato AAAA-MM-DD.",
      });
    }

    query = query.eq("data", data);
  }

  const { data: registros, error } = await query;

  if (error) {
    return res.status(500).json({
      erro: "Erro ao buscar registros de agua.",
      detalhe: error.message,
    });
  }

  const total_ml = registros.reduce(
    (total, registro) => total + Number(registro.quantidade_ml),
    0,
  );

  return res.status(200).json({
    data: data || null,
    total_ml,
    registros,
  });
};

// GET /agua/:id
const buscarRegistroAguaPorId = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data: registro, error } = await supabase
    .from("registro_agua")
    .select("*")
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao buscar registro de agua.",
      detalhe: error.message,
    });
  }

  if (!registro) {
    return res.status(404).json({
      erro: "Registro de agua nao encontrado.",
    });
  }

  return res.status(200).json(registro);
};

// POST /agua
const criarRegistroAgua = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { quantidade_ml, data } = req.body;

  if (!quantidadeValida(quantidade_ml)) {
    return res.status(400).json({
      erro: "A quantidade deve ser um numero inteiro maior que zero.",
    });
  }

  if (data && !dataValida(data)) {
    return res.status(400).json({
      erro: "A data deve estar no formato AAAA-MM-DD.",
    });
  }

  const novoRegistro = {
    usuario_id,
    quantidade_ml: Number(quantidade_ml),
  };

  if (data) {
    novoRegistro.data = data;
  }

  const { data: registro, error } = await supabase
    .from("registro_agua")
    .insert([novoRegistro])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao registrar consumo de agua.",
      detalhe: error.message,
    });
  }

  return res.status(201).json({
    mensagem: "Consumo de agua registrado com sucesso!",
    registro,
  });
};

// PUT /agua/:id
const editarRegistroAgua = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;
  const { quantidade_ml, data } = req.body;

  if (!quantidadeValida(quantidade_ml)) {
    return res.status(400).json({
      erro: "A quantidade deve ser um numero inteiro maior que zero.",
    });
  }

  if (!data || !dataValida(data)) {
    return res.status(400).json({
      erro: "A data deve estar no formato AAAA-MM-DD.",
    });
  }

  const { data: registro, error } = await supabase
    .from("registro_agua")
    .update({
      quantidade_ml: Number(quantidade_ml),
      data,
    })
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao atualizar registro de agua.",
      detalhe: error.message,
    });
  }

  if (!registro) {
    return res.status(404).json({
      erro: "Registro de agua nao encontrado.",
    });
  }

  return res.status(200).json({
    mensagem: "Registro de agua atualizado com sucesso!",
    registro,
  });
};

// DELETE /agua/:id
const deletarRegistroAgua = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data: registro, error } = await supabase
    .from("registro_agua")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select("id")
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao excluir registro de agua.",
      detalhe: error.message,
    });
  }

  if (!registro) {
    return res.status(404).json({
      erro: "Registro de agua nao encontrado.",
    });
  }

  return res.status(200).json({
    mensagem: "Registro de agua removido com sucesso!",
  });
};

module.exports = {
  listarRegistrosAgua,
  buscarRegistroAguaPorId,
  criarRegistroAgua,
  editarRegistroAgua,
  deletarRegistroAgua,
};

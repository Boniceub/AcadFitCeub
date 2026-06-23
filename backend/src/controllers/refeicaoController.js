const supabase = require("../config/supabase");

const camposAlimento = `
  id,
  quantidade_g,
  alimento:alimento_id (
    id,
    nome,
    calorias,
    proteinas_g,
    carboidratos_g,
    gorduras_g,
    porcao,
    unidade
  )
`;

const arredondar = (valor) => Number(valor.toFixed(2));

const recalcularTotaisRefeicao = async (refeicao_id) => {
  const { data: itens, error: erroItens } = await supabase
    .from("refeicao_alimento")
    .select(camposAlimento)
    .eq("refeicao_id", refeicao_id);

  if (erroItens) {
    throw new Error(erroItens.message);
  }

  const totais = itens.reduce(
    (total, item) => {
      const alimento = item.alimento;
      const porcao = Number(alimento?.porcao) || 100;
      const quantidade = Number(item.quantidade_g) || 0;
      const fator = quantidade / porcao;

      total.calorias += Number(alimento?.calorias || 0) * fator;
      total.proteinas_g += Number(alimento?.proteinas_g || 0) * fator;
      total.carboidratos_g += Number(alimento?.carboidratos_g || 0) * fator;
      total.gorduras_g += Number(alimento?.gorduras_g || 0) * fator;

      return total;
    },
    {
      calorias: 0,
      proteinas_g: 0,
      carboidratos_g: 0,
      gorduras_g: 0,
    },
  );

  const totaisArredondados = {
    calorias: arredondar(totais.calorias),
    proteinas_g: arredondar(totais.proteinas_g),
    carboidratos_g: arredondar(totais.carboidratos_g),
    gorduras_g: arredondar(totais.gorduras_g),
  };

  const { error: erroAtualizacao } = await supabase
    .from("refeicao")
    .update(totaisArredondados)
    .eq("id", refeicao_id);

  if (erroAtualizacao) {
    throw new Error(erroAtualizacao.message);
  }

  return totaisArredondados;
};

// GET /refeicoes
const listarRefeicoes = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { data, tipo } = req.query;

  let query = supabase
    .from("refeicao")
    .select(
      `
      *,
      itens:refeicao_alimento (
        id,
        quantidade_g,
        alimento:alimento_id (
          id,
          nome,
          calorias,
          proteinas_g,
          carboidratos_g,
          gorduras_g,
          porcao,
          unidade
        )
      )
    `,
    )
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
    return res.status(500).json({
      erro: "Erro ao buscar refeicoes.",
      detalhe: error.message,
    });
  }

  return res.status(200).json(refeicoes);
};

// GET /refeicoes/:id
const buscarRefeicaoPorId = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data: refeicao, error } = await supabase
    .from("refeicao")
    .select(
      `
      *,
      itens:refeicao_alimento (
        id,
        quantidade_g,
        alimento:alimento_id (
          id,
          nome,
          calorias,
          proteinas_g,
          carboidratos_g,
          gorduras_g,
          porcao,
          unidade
        )
      )
    `,
    )
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao buscar refeicao.",
      detalhe: error.message,
    });
  }

  if (!refeicao) {
    return res.status(404).json({
      erro: "Refeicao nao encontrada.",
    });
  }

  return res.status(200).json(refeicao);
};

// POST /refeicoes
const criarRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { nome, data, tipo, horario, observacoes } = req.body;

  if (!data || !tipo) {
    return res.status(400).json({
      erro: "Data e tipo sao obrigatorios.",
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
        horario,
        observacoes,
        calorias: 0,
        proteinas_g: 0,
        carboidratos_g: 0,
        gorduras_g: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao criar refeicao.",
      detalhe: error.message,
    });
  }

  return res.status(201).json({
    mensagem: "Refeicao criada com sucesso!",
    refeicao,
  });
};

// PUT /refeicoes/:id
const editarRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;
  const { nome, data, tipo, horario, observacoes } = req.body;

  if (!data || !tipo) {
    return res.status(400).json({
      erro: "Data e tipo sao obrigatorios.",
    });
  }

  const { data: refeicao, error } = await supabase
    .from("refeicao")
    .update({
      nome,
      data,
      tipo,
      horario,
      observacoes,
    })
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao atualizar refeicao.",
      detalhe: error.message,
    });
  }

  if (!refeicao) {
    return res.status(404).json({
      erro: "Refeicao nao encontrada.",
    });
  }

  return res.status(200).json({
    mensagem: "Refeicao atualizada com sucesso!",
    refeicao,
  });
};

// DELETE /refeicoes/:id
const deletarRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  const { data: refeicao, error } = await supabase
    .from("refeicao")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario_id)
    .select("id")
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao deletar refeicao.",
      detalhe: error.message,
    });
  }

  if (!refeicao) {
    return res.status(404).json({
      erro: "Refeicao nao encontrada.",
    });
  }

  return res.status(200).json({
    mensagem: "Refeicao deletada com sucesso!",
  });
};

// POST /refeicoes/:id/alimentos
const adicionarAlimentoNaRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id: refeicao_id } = req.params;
  const { alimento_id, quantidade_g } = req.body;

  if (!alimento_id || quantidade_g === undefined) {
    return res.status(400).json({
      erro: "Alimento e quantidade sao obrigatorios.",
    });
  }

  if (!Number.isFinite(Number(quantidade_g)) || Number(quantidade_g) <= 0) {
    return res.status(400).json({
      erro: "A quantidade deve ser maior que zero.",
    });
  }

  const { data: refeicao, error: erroRefeicao } = await supabase
    .from("refeicao")
    .select("id")
    .eq("id", refeicao_id)
    .eq("usuario_id", usuario_id)
    .maybeSingle();

  if (erroRefeicao) {
    return res.status(500).json({
      erro: "Erro ao verificar refeicao.",
      detalhe: erroRefeicao.message,
    });
  }

  if (!refeicao) {
    return res.status(404).json({
      erro: "Refeicao nao encontrada.",
    });
  }

  const { data: alimento, error: erroAlimento } = await supabase
    .from("alimento")
    .select("id")
    .eq("id", alimento_id)
    .maybeSingle();

  if (erroAlimento) {
    return res.status(500).json({
      erro: "Erro ao verificar alimento.",
      detalhe: erroAlimento.message,
    });
  }

  if (!alimento) {
    return res.status(404).json({
      erro: "Alimento nao encontrado.",
    });
  }

  const { data: item, error } = await supabase
    .from("refeicao_alimento")
    .insert([
      {
        refeicao_id,
        alimento_id,
        quantidade_g: Number(quantidade_g),
      },
    ])
    .select(camposAlimento)
    .single();

  if (error?.code === "23505") {
    return res.status(409).json({
      erro: "Este alimento ja foi adicionado a refeicao.",
    });
  }

  if (error) {
    return res.status(500).json({
      erro: "Erro ao adicionar alimento a refeicao.",
      detalhe: error.message,
    });
  }

  try {
    const totais = await recalcularTotaisRefeicao(refeicao_id);

    return res.status(201).json({
      mensagem: "Alimento adicionado a refeicao com sucesso!",
      item,
      totais,
    });
  } catch (erro) {
    return res.status(500).json({
      erro: "Alimento adicionado, mas houve erro ao calcular os totais.",
      detalhe: erro.message,
    });
  }
};

// PUT /refeicoes/:id/alimentos/:itemId
const editarQuantidadeAlimento = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id: refeicao_id, itemId } = req.params;
  const { quantidade_g } = req.body;

  if (!Number.isFinite(Number(quantidade_g)) || Number(quantidade_g) <= 0) {
    return res.status(400).json({
      erro: "A quantidade deve ser maior que zero.",
    });
  }

  const { data: refeicao, error: erroRefeicao } = await supabase
    .from("refeicao")
    .select("id")
    .eq("id", refeicao_id)
    .eq("usuario_id", usuario_id)
    .maybeSingle();

  if (erroRefeicao) {
    return res.status(500).json({
      erro: "Erro ao verificar refeicao.",
      detalhe: erroRefeicao.message,
    });
  }

  if (!refeicao) {
    return res.status(404).json({
      erro: "Refeicao nao encontrada.",
    });
  }

  const { data: item, error } = await supabase
    .from("refeicao_alimento")
    .update({
      quantidade_g: Number(quantidade_g),
    })
    .eq("id", itemId)
    .eq("refeicao_id", refeicao_id)
    .select(camposAlimento)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao atualizar quantidade.",
      detalhe: error.message,
    });
  }

  if (!item) {
    return res.status(404).json({
      erro: "Alimento nao encontrado nesta refeicao.",
    });
  }

  try {
    const totais = await recalcularTotaisRefeicao(refeicao_id);

    return res.status(200).json({
      mensagem: "Quantidade atualizada com sucesso!",
      item,
      totais,
    });
  } catch (erro) {
    return res.status(500).json({
      erro: "Quantidade atualizada, mas houve erro ao calcular os totais.",
      detalhe: erro.message,
    });
  }
};

// DELETE /refeicoes/:id/alimentos/:itemId
const removerAlimentoDaRefeicao = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id: refeicao_id, itemId } = req.params;

  const { data: refeicao, error: erroRefeicao } = await supabase
    .from("refeicao")
    .select("id")
    .eq("id", refeicao_id)
    .eq("usuario_id", usuario_id)
    .maybeSingle();

  if (erroRefeicao) {
    return res.status(500).json({
      erro: "Erro ao verificar refeicao.",
      detalhe: erroRefeicao.message,
    });
  }

  if (!refeicao) {
    return res.status(404).json({
      erro: "Refeicao nao encontrada.",
    });
  }

  const { data: item, error } = await supabase
    .from("refeicao_alimento")
    .delete()
    .eq("id", itemId)
    .eq("refeicao_id", refeicao_id)
    .select("id")
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      erro: "Erro ao remover alimento.",
      detalhe: error.message,
    });
  }

  if (!item) {
    return res.status(404).json({
      erro: "Alimento nao encontrado nesta refeicao.",
    });
  }

  try {
    const totais = await recalcularTotaisRefeicao(refeicao_id);

    return res.status(200).json({
      mensagem: "Alimento removido da refeicao com sucesso!",
      totais,
    });
  } catch (erro) {
    return res.status(500).json({
      erro: "Alimento removido, mas houve erro ao calcular os totais.",
      detalhe: erro.message,
    });
  }
};

module.exports = {
  listarRefeicoes,
  buscarRefeicaoPorId,
  criarRefeicao,
  editarRefeicao,
  deletarRefeicao,
  adicionarAlimentoNaRefeicao,
  editarQuantidadeAlimento,
  removerAlimentoDaRefeicao,
};

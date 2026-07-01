const supabase = require("../config/supabase");

// POST /treinos-realizados — marca um treino como concluído
const registrarTreino = async (req, res) => {
  const { ficha_id, series = [] } = req.body;
  const usuario_id = req.usuario.id;

  if (!ficha_id) {
    return res.status(400).json({ erro: "ficha_id é obrigatório." });
  }

  if (!Array.isArray(series)) {
    return res.status(400).json({ erro: "series deve ser uma lista." });
  }

  const seriesInvalidas = series.some((serie) => {
    return (
      !serie.ficha_exercicio_id ||
      !serie.numero_serie ||
      !serie.repeticoes ||
      Number(serie.numero_serie) <= 0 ||
      Number(serie.repeticoes) <= 0 ||
      (serie.carga_kg !== null &&
        serie.carga_kg !== undefined &&
        serie.carga_kg !== "" &&
        Number(serie.carga_kg) < 0)
    );
  });

  if (seriesInvalidas) {
    return res.status(400).json({
      erro: "Cada serie precisa ter ficha_exercicio_id, numero_serie e repeticoes validos.",
    });
  }

  const { data: ficha, error: fichaError } = await supabase
    .from("ficha_treino")
    .select("id")
    .eq("id", ficha_id)
    .eq("usuario_id", usuario_id)
    .single();

  if (fichaError || !ficha) {
    return res.status(404).json({ erro: "Ficha nao encontrada." });
  }

  const hoje = new Date().toISOString().split("T")[0];

  const { data: registro, error: registroError } = await supabase
    .from("registro_treino")
    .insert([{ ficha_id, usuario_id, data: hoje, concluido: true }])
    .select()
    .single();

  if (registroError) {
    return res.status(500).json({
      erro: "Erro ao registrar treino.",
      detalhe: registroError.message,
    });
  }

  let seriesRegistradas = [];

  if (series.length > 0) {
    const seriesParaInserir = series.map((serie) => ({
      registro_treino_id: registro.id,
      ficha_exercicio_id: serie.ficha_exercicio_id,
      numero_serie: Number(serie.numero_serie),
      repeticoes: Number(serie.repeticoes),
      carga_kg:
        serie.carga_kg === "" ||
        serie.carga_kg === null ||
        serie.carga_kg === undefined
          ? null
          : Number(serie.carga_kg),
      concluida:
        serie.concluida === undefined ? true : Boolean(serie.concluida),
    }));

    const { data: seriesData, error: seriesError } = await supabase
      .from("registro_serie")
      .insert(seriesParaInserir)
      .select();

    if (seriesError) {
      await supabase.from("registro_treino").delete().eq("id", registro.id);

      return res.status(500).json({
        erro: "Erro ao registrar series do treino.",
        detalhe: seriesError.message,
      });
    }

    seriesRegistradas = seriesData;
  }

  return res.status(201).json({
    mensagem: "Treino registrado com sucesso!",
    registro: {
      ...registro,
      series: seriesRegistradas,
    },
  });
};

// GET /treinos-realizados — lista todos os treinos realizados do usuário
const listarTreinosRealizados = async (req, res) => {
  const usuario_id = req.usuario.id;

  const { data, error } = await supabase
    .from("registro_treino")
    .select(
      `
        *,
        ficha_treino(nome),
        registro_serie(
          *,
          ficha_exercicio(
            *,
            exercicio(*)
          )
        )
      `,
    )
    .eq("usuario_id", usuario_id)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .order("numero_serie", {
      referencedTable: "registro_serie",
      ascending: true,
    });

  if (error) {
    return res.status(500).json({
      erro: "Erro ao buscar treinos realizados.",
      detalhe: error.message,
    });
  }

  return res.status(200).json(data);
};

module.exports = { registrarTreino, listarTreinosRealizados };

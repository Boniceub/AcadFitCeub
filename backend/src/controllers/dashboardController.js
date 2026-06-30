const supabase = require("../config/supabase");

const dataValida = (data) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(data);
};

const obterDataHoje = () => {
  return new Date().toISOString().split("T")[0];
};

const somarCampo = (lista, campo) => {
  return lista.reduce((total, item) => total + Number(item[campo] || 0), 0);
};

// GET /dashboard/:usuario_id?data=AAAA-MM-DD
const buscarResumoDashboard = async (req, res) => {
  const usuarioAutenticadoId = req.usuario.id;
  const { usuario_id } = req.params;
  const dataConsulta = req.query.data || obterDataHoje();

  if (usuario_id !== usuarioAutenticadoId) {
    return res.status(403).json({
      erro: "Voce nao tem permissao para acessar o dashboard deste usuario.",
    });
  }

  if (!dataValida(dataConsulta)) {
    return res.status(400).json({
      erro: "A data deve estar no formato AAAA-MM-DD.",
    });
  }

  try {
    const [
      resultadoTreinos,
      resultadoRefeicoes,
      resultadoAgua,
      resultadoSuplementos,
    ] = await Promise.all([
      supabase
        .from("registro_treino")
        .select("*, ficha_treino(nome)")
        .eq("usuario_id", usuario_id)
        .eq("data", dataConsulta)
        .order("data", { ascending: false }),

      supabase
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
        .eq("data", dataConsulta)
        .order("criado_em", { ascending: true }),

      supabase
        .from("registro_agua")
        .select("*")
        .eq("usuario_id", usuario_id)
        .eq("data", dataConsulta)
        .order("criado_em", { ascending: false }),

      supabase
        .from("suplemento")
        .select("*")
        .eq("usuario_id", usuario_id)
        .eq("data", dataConsulta)
        .order("horario", { ascending: true }),
    ]);

    if (resultadoTreinos.error) {
      throw new Error(resultadoTreinos.error.message);
    }

    if (resultadoRefeicoes.error) {
      throw new Error(resultadoRefeicoes.error.message);
    }

    if (resultadoAgua.error) {
      throw new Error(resultadoAgua.error.message);
    }

    if (resultadoSuplementos.error) {
      throw new Error(resultadoSuplementos.error.message);
    }

    const treinos = resultadoTreinos.data || [];
    const refeicoes = resultadoRefeicoes.data || [];
    const registrosAgua = resultadoAgua.data || [];
    const suplementos = resultadoSuplementos.data || [];

    const totalAguaMl = somarCampo(registrosAgua, "quantidade_ml");

    const resumoDieta = {
      total_refeicoes: refeicoes.length,
      calorias: somarCampo(refeicoes, "calorias"),
      proteinas_g: somarCampo(refeicoes, "proteinas_g"),
      carboidratos_g: somarCampo(refeicoes, "carboidratos_g"),
      gorduras_g: somarCampo(refeicoes, "gorduras_g"),
      refeicoes,
    };

    const resumoTreino = {
      total_registros: treinos.length,
      concluidos: treinos.filter((treino) => treino.concluido).length,
      registros: treinos,
    };

    const resumoAgua = {
      total_ml: totalAguaMl,
      total_registros: registrosAgua.length,
      meta_ml: 2000,
      registros: registrosAgua,
    };

    const resumoSuplementos = {
      total_registros: suplementos.length,
      registros: suplementos,
    };

    return res.status(200).json({
      usuario_id,
      data: dataConsulta,
      treino: resumoTreino,
      dieta: resumoDieta,
      agua: resumoAgua,
      suplementos: resumoSuplementos,
    });
  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao buscar resumo do dashboard.",
      detalhe: error.message,
    });
  }
};

module.exports = {
  buscarResumoDashboard,
};

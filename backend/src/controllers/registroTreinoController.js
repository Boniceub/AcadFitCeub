const supabase = require("../config/supabase");

// POST /treinos-realizados — marca um treino como concluído
const registrarTreino = async (req, res) => {
  const { ficha_id } = req.body;
  const usuario_id = req.usuario.id;

  if (!ficha_id) {
    return res.status(400).json({ erro: "ficha_id é obrigatório." });
  }

  const hoje = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registro_treino")
    .insert([{ ficha_id, usuario_id, data: hoje, concluido: true }])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao registrar treino.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Treino registrado com sucesso!", registro: data });
};

// GET /treinos-realizados — lista todos os treinos realizados do usuário
const listarTreinosRealizados = async (req, res) => {
  const usuario_id = req.usuario.id;

  const { data, error } = await supabase
    .from("registro_treino")
    .select("*, ficha_treino(nome)")
    .eq("usuario_id", usuario_id)
    .order("data", { ascending: false });

  if (error) {
    return res
      .status(500)
      .json({
        erro: "Erro ao buscar treinos realizados.",
        detalhe: error.message,
      });
  }

  return res.status(200).json(data);
};

module.exports = { registrarTreino, listarTreinosRealizados };

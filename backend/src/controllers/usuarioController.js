const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

const camposPerfil =
  "id, nome, email, telefone, data_nascimento, peso_kg, altura_cm, objetivo, nivel_experiencia, autorizacao_medica, observacoes_saude, criado_em";

const valorOuNull = (valor) => {
  if (valor === undefined || valor === "") return null;
  return valor;
};

const numeroOuNull = (valor) => {
  if (valor === undefined || valor === null || valor === "") return null;
  return Number(valor);
};

const getPerfil = async (req, res) => {
  const { id } = req.params;

  if (req.usuario.id !== id) {
    return res.status(403).json({ erro: "Acesso negado." });
  }

  const { data, error } = await supabase
    .from("usuario")
    .select(camposPerfil)
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Usuario nao encontrado." });
  }

  return res.status(200).json(data);
};

const atualizarPerfil = async (req, res) => {
  const { id } = req.params;

  const {
    nome,
    telefone,
    data_nascimento,
    peso_kg,
    altura_cm,
    objetivo,
    nivel_experiencia,
    autorizacao_medica,
    observacoes_saude,
  } = req.body;

  if (req.usuario.id !== id) {
    return res.status(403).json({ erro: "Acesso negado." });
  }

  if (!nome) {
    return res.status(400).json({ erro: "Nome e obrigatorio." });
  }

  const pesoConvertido = numeroOuNull(peso_kg);
  const alturaConvertida = numeroOuNull(altura_cm);

  if (pesoConvertido !== null && pesoConvertido <= 0) {
    return res.status(400).json({ erro: "Peso deve ser maior que zero." });
  }

  if (alturaConvertida !== null && alturaConvertida <= 0) {
    return res.status(400).json({ erro: "Altura deve ser maior que zero." });
  }

  const dadosAtualizados = {
    nome,
    telefone: valorOuNull(telefone),
    data_nascimento: valorOuNull(data_nascimento),
    peso_kg: pesoConvertido,
    altura_cm: alturaConvertida,
    objetivo: valorOuNull(objetivo),
    nivel_experiencia: valorOuNull(nivel_experiencia),
    autorizacao_medica: Boolean(autorizacao_medica),
    observacoes_saude: valorOuNull(observacoes_saude),
  };

  const { data, error } = await supabase
    .from("usuario")
    .update(dadosAtualizados)
    .eq("id", id)
    .select(camposPerfil)
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao atualizar perfil.", detalhe: error.message });
  }

  return res
    .status(200)
    .json({ mensagem: "Perfil atualizado com sucesso!", usuario: data });
};

const alterarSenha = async (req, res) => {
  const { id } = req.params;
  const { senha_atual, nova_senha, confirmar_senha } = req.body;

  if (req.usuario.id !== id) {
    return res.status(403).json({ erro: "Acesso negado." });
  }

  if (!senha_atual || !nova_senha || !confirmar_senha) {
    return res
      .status(400)
      .json({ erro: "Todos os campos de senha sao obrigatorios." });
  }

  if (nova_senha !== confirmar_senha) {
    return res
      .status(400)
      .json({ erro: "Nova senha e confirmacao nao coincidem." });
  }

  const { data: usuario, error: buscarError } = await supabase
    .from("usuario")
    .select("senha_hash")
    .eq("id", id)
    .single();

  if (buscarError || !usuario) {
    return res.status(404).json({ erro: "Usuario nao encontrado." });
  }

  const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);

  if (!senhaValida) {
    return res.status(401).json({ erro: "Senha atual incorreta." });
  }

  const nova_senha_hash = await bcrypt.hash(nova_senha, 10);

  const { error } = await supabase
    .from("usuario")
    .update({ senha_hash: nova_senha_hash })
    .eq("id", id);

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao alterar senha.", detalhe: error.message });
  }

  return res.status(200).json({ mensagem: "Senha alterada com sucesso!" });
};

module.exports = { getPerfil, atualizarPerfil, alterarSenha };

const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

const getPerfil = async (req, res) => {
  const { id } = req.params;

  if (req.usuario.id !== id) {
    return res.status(403).json({ erro: "Acesso negado." });
  }

  const { data, error } = await supabase
    .from("usuario")
    .select("id, nome, email, criado_em")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: "Usuário não encontrado." });
  }

  return res.status(200).json(data);
};

const atualizarPerfil = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (req.usuario.id !== id) {
    return res.status(403).json({ erro: "Acesso negado." });
  }

  if (!nome) {
    return res.status(400).json({ erro: "Nome é obrigatório." });
  }

  const { data, error } = await supabase
    .from("usuario")
    .update({ nome })
    .eq("id", id)
    .select("id, nome, email, criado_em")
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
      .json({ erro: "Todos os campos de senha são obrigatórios." });
  }

  if (nova_senha !== confirmar_senha) {
    return res
      .status(400)
      .json({ erro: "Nova senha e confirmação não coincidem." });
  }

  const { data: usuario } = await supabase
    .from("usuario")
    .select("senha_hash")
    .eq("id", id)
    .single();

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

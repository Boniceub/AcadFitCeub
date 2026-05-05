const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const register = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Valida campos obrigatórios
  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ erro: "Nome, e-mail e senha são obrigatórios." });
  }

  // Verifica se o e-mail já está cadastrado
  const { data: usuarioExistente } = await supabase
    .from("usuario")
    .select("id")
    .eq("email", email)
    .single();

  if (usuarioExistente) {
    return res.status(400).json({ erro: "E-mail já cadastrado." });
  }

  // Criptografa a senha
  const senha_hash = await bcrypt.hash(senha, 10);

  // Insere o usuário no banco
  const { data, error } = await supabase
    .from("usuario")
    .insert([{ nome, email, senha_hash }])
    .select("id, nome, email, criado_em")
    .single();

  if (error) {
    return res
      .status(500)
      .json({ erro: "Erro ao cadastrar usuário.", detalhe: error.message });
  }

  return res
    .status(201)
    .json({ mensagem: "Usuário cadastrado com sucesso!", usuario: data });
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  // Busca o usuário pelo e-mail
  const { data: usuario } = await supabase
    .from("usuario")
    .select("*")
    .eq("email", email)
    .single();

  if (!usuario) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  // Verifica a senha
  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaValida) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  // Gera o token JWT
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.status(200).json({
    mensagem: "Login realizado com sucesso!",
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
};

module.exports = { register, login };

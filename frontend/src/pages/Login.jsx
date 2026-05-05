import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

function Login() {
  const navigate = useNavigate();
  const [aba, setAba] = useState("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [erroServidor, setErroServidor] = useState("");

  const validar = () => {
    const novosErros = {};
    if (!email.includes("@")) novosErros.email = "E-mail inválido";
    if (senha.length < 8)
      novosErros.senha = "Senha deve ter no mínimo 8 caracteres";
    if (aba === "cadastrar" && nome.trim() === "")
      novosErros.nome = "Nome obrigatório";
    return novosErros;
  };

  const handleSubmit = async () => {
    const errosEncontrados = validar();
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      return;
    }

    setErros({});
    setErroServidor("");
    setCarregando(true);

    try {
      if (aba === "cadastrar") {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErroServidor(data.erro || "Erro ao cadastrar.");
          return;
        }

        setAba("entrar");
        setNome("");
        alert("Cadastro realizado! Faça login para continuar.");
      } else {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErroServidor(data.erro || "Credenciais inválidas.");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        navigate("/dashboard");
      }
    } catch (err) {
      setErroServidor("Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          background: "#1a2f4e",
          color: "white",
          width: "45%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            border: "3px solid #c9a84c",
            borderRadius: "50%",
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: "bold",
            color: "#c9a84c",
            marginBottom: 16,
          }}
        >
          AF
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>AcadFitCeub</h1>
        <p style={{ color: "#c9a84c", marginBottom: 32 }}>
          Controle total da sua evolução.
        </p>
        <p style={{ alignSelf: "flex-start", marginBottom: 12 }}>
          O que você encontra aqui:
        </p>
        {[
          "Fichas de treino personalizadas",
          "Diário de dieta e macros",
          "Catálogo de exercícios",
          "Histórico de evolução",
        ].map((item) => (
          <p key={item} style={{ alignSelf: "flex-start", marginBottom: 8 }}>
            ✓ {item}
          </p>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480, padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #ddd",
              marginBottom: 24,
            }}
          >
            {["entrar", "cadastrar"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setAba(tab);
                  setErros({});
                  setErroServidor("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontWeight: aba === tab ? "bold" : "normal",
                  color: aba === tab ? "#1a2f4e" : "#999",
                  borderBottom: aba === tab ? "2px solid #1a2f4e" : "none",
                }}
              >
                {tab === "entrar" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <h2 style={{ marginBottom: 4, color: "#1a2f4e" }}>Bem-vindo!</h2>
          <p style={{ color: "#999", marginBottom: 24 }}>
            Acesse sua conta para continuar.
          </p>

          {erroServidor && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid #ffcccc",
                borderRadius: 6,
                padding: "10px 14px",
                marginBottom: 16,
                color: "#cc0000",
                fontSize: 14,
              }}
            >
              {erroServidor}
            </div>
          )}

          {aba === "cadastrar" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 6, color: "#333" }}
              >
                Nome
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: `1px solid ${erros.nome ? "red" : "#ddd"}`,
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                  background: "#fff",
                  color: "#333",
                }}
              />
              {erros.nome && (
                <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {erros.nome}
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, color: "#333" }}>
              E-mail
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              type="email"
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${erros.email ? "red" : "#ddd"}`,
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
                background: "#fff",
                color: "#333",
              }}
            />
            {erros.email && (
              <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {erros.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", marginBottom: 6, color: "#333" }}>
              Senha
            </label>
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              type="password"
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${erros.senha ? "red" : "#ddd"}`,
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
                background: "#fff",
                color: "#333",
              }}
            />
            {erros.senha && (
              <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {erros.senha}
              </p>
            )}
          </div>

          {aba === "entrar" && (
            <p
              style={{
                textAlign: "right",
                color: "#c9a84c",
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              Esqueci minha senha
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={carregando}
            style={{
              width: "100%",
              padding: "12px",
              background: carregando ? "#aaa" : "#1a2f4e",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: carregando ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {carregando
              ? "Aguarde..."
              : aba === "entrar"
                ? "Entrar"
                : "Cadastrar"}
          </button>

          <p style={{ textAlign: "center", marginTop: 16, color: "#666" }}>
            {aba === "entrar" ? "Não tem conta? " : "Já tem conta? "}
            <span
              onClick={() => {
                setAba(aba === "entrar" ? "cadastrar" : "entrar");
                setErros({});
                setErroServidor("");
              }}
              style={{
                color: "#c9a84c",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {aba === "entrar" ? "Cadastre-se grátis" : "Entrar"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

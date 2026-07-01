import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";

const estadoInicial = {
  nome: "",
  email: "",
  telefone: "",
  data_nascimento: "",
  peso_kg: "",
  altura_cm: "",
  objetivo: "",
  nivel_experiencia: "",
  autorizacao_medica: false,
  observacoes_saude: "",
};

export default function Perfil() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [formulario, setFormulario] = useState(estadoInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!token || !usuarioLocal?.id) {
      navigate("/");
      return;
    }

    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(`${API_URL}/usuario/${usuarioLocal.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Nao foi possivel carregar o perfil.");
      }

      setFormulario({
        nome: dados.nome || "",
        email: dados.email || "",
        telefone: dados.telefone || "",
        data_nascimento: dados.data_nascimento || "",
        peso_kg: dados.peso_kg || "",
        altura_cm: dados.altura_cm || "",
        objetivo: dados.objetivo || "",
        nivel_experiencia: dados.nivel_experiencia || "",
        autorizacao_medica: Boolean(dados.autorizacao_medica),
        observacoes_saude: dados.observacoes_saude || "",
      });
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  const alterarCampo = (campo, valor) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const salvarPerfil = async (event) => {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      setErro("Nome e obrigatorio.");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const resposta = await fetch(`${API_URL}/usuario/${usuarioLocal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: formulario.nome,
          telefone: formulario.telefone,
          data_nascimento: formulario.data_nascimento,
          peso_kg: formulario.peso_kg,
          altura_cm: formulario.altura_cm,
          objetivo: formulario.objetivo,
          nivel_experiencia: formulario.nivel_experiencia,
          autorizacao_medica: formulario.autorizacao_medica,
          observacoes_saude: formulario.observacoes_saude,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Nao foi possivel atualizar o perfil.");
      }

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuarioLocal,
          nome: dados.usuario.nome,
          email: dados.usuario.email,
        }),
      );

      setFormulario({
        nome: dados.usuario.nome || "",
        email: dados.usuario.email || "",
        telefone: dados.usuario.telefone || "",
        data_nascimento: dados.usuario.data_nascimento || "",
        peso_kg: dados.usuario.peso_kg || "",
        altura_cm: dados.usuario.altura_cm || "",
        objetivo: dados.usuario.objetivo || "",
        nivel_experiencia: dados.usuario.nivel_experiencia || "",
        autorizacao_medica: Boolean(dados.usuario.autorizacao_medica),
        observacoes_saude: dados.usuario.observacoes_saude || "",
      });

      setSucesso("Perfil atualizado com sucesso.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={pagina}>
      <Sidebar />

      <main style={conteudo}>
        <header style={cabecalho}>
          <div>
            <h1 style={titulo}>Perfil</h1>
            <p style={subtitulo}>
              Atualize seus dados pessoais, fisicos e informacoes de saude.
            </p>
          </div>

          <button
            type="button"
            onClick={carregarPerfil}
            style={botaoSecundario}
          >
            Atualizar
          </button>
        </header>

        {erro && <div style={alertaErro}>{erro}</div>}
        {sucesso && <div style={alertaSucesso}>{sucesso}</div>}

        {carregando ? (
          <div style={estadoCarregando}>Carregando perfil...</div>
        ) : (
          <form onSubmit={salvarPerfil} style={formularioBox}>
            <section style={painel}>
              <h2 style={painelTitulo}>Dados pessoais</h2>

              <div style={gradeCampos}>
                <CampoTexto
                  label="Nome"
                  value={formulario.nome}
                  onChange={(valor) => alterarCampo("nome", valor)}
                  required
                />

                <CampoTexto
                  label="E-mail"
                  value={formulario.email}
                  disabled
                  onChange={() => {}}
                />

                <CampoTexto
                  label="Telefone"
                  value={formulario.telefone}
                  onChange={(valor) => alterarCampo("telefone", valor)}
                  placeholder="Ex: 61999999999"
                />

                <CampoTexto
                  label="Data de nascimento"
                  type="date"
                  value={formulario.data_nascimento}
                  onChange={(valor) => alterarCampo("data_nascimento", valor)}
                />
              </div>
            </section>

            <section style={painel}>
              <h2 style={painelTitulo}>Dados fisicos</h2>

              <div style={gradeCampos}>
                <CampoTexto
                  label="Peso atual"
                  type="number"
                  value={formulario.peso_kg}
                  onChange={(valor) => alterarCampo("peso_kg", valor)}
                  placeholder="Ex: 78.5"
                  suffix="kg"
                />

                <CampoTexto
                  label="Altura"
                  type="number"
                  value={formulario.altura_cm}
                  onChange={(valor) => alterarCampo("altura_cm", valor)}
                  placeholder="Ex: 175"
                  suffix="cm"
                />

                <CampoSelect
                  label="Objetivo"
                  value={formulario.objetivo}
                  onChange={(valor) => alterarCampo("objetivo", valor)}
                  options={[
                    "Hipertrofia",
                    "Emagrecimento",
                    "Condicionamento",
                    "Saude",
                    "Forca",
                    "Manutencao",
                  ]}
                />

                <CampoSelect
                  label="Nivel de experiencia"
                  value={formulario.nivel_experiencia}
                  onChange={(valor) => alterarCampo("nivel_experiencia", valor)}
                  options={["Iniciante", "Intermediario", "Avancado"]}
                />
              </div>
            </section>

            <section style={painel}>
              <h2 style={painelTitulo}>Saude</h2>

              <label style={checkboxLinha}>
                <input
                  type="checkbox"
                  checked={formulario.autorizacao_medica}
                  onChange={(event) =>
                    alterarCampo("autorizacao_medica", event.target.checked)
                  }
                />
                <span>
                  Possuo autorizacao medica para praticar atividades fisicas
                </span>
              </label>

              <label style={campoGrupo}>
                <span style={label}>Observacoes de saude</span>
                <textarea
                  value={formulario.observacoes_saude}
                  onChange={(event) =>
                    alterarCampo("observacoes_saude", event.target.value)
                  }
                  placeholder="Ex: restricoes, lesoes, cuidados ou informacoes relevantes"
                  style={textarea}
                  rows={5}
                />
              </label>
            </section>

            <div style={acoes}>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={botaoSecundario}
              >
                Voltar
              </button>

              <button type="submit" disabled={salvando} style={botaoPrimario}>
                {salvando ? "Salvando..." : "Salvar perfil"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  required = false,
  suffix = "",
}) {
  return (
    <label style={campoGrupo}>
      <span style={labelStyle}>{label}</span>

      <div style={campoComSufixo}>
        <input
          type={type}
          value={value}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={{
            ...campoTexto,
            ...(disabled ? campoDesabilitado : {}),
          }}
        />

        {suffix && <span style={sufixo}>{suffix}</span>}
      </div>
    </label>
  );
}

function CampoSelect({ label, value, onChange, options }) {
  return (
    <label style={campoGrupo}>
      <span style={labelStyle}>{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={campoTexto}
      >
        <option value="">Selecione</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const pagina = {
  minHeight: "100vh",
  background: "#f0f4f8",
};

const conteudo = {
  marginLeft: 240,
  padding: "28px 34px 48px",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const cabecalho = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  marginBottom: 24,
};

const titulo = {
  margin: 0,
  color: "#102b46",
  fontSize: 28,
  fontWeight: 800,
};

const subtitulo = {
  margin: "6px 0 0",
  color: "#778493",
};

const formularioBox = {
  display: "grid",
  gap: 18,
};

const painel = {
  background: "#fff",
  border: "1px solid #dfe5eb",
  borderRadius: 8,
  padding: 22,
};

const painelTitulo = {
  margin: "0 0 18px",
  color: "#102b46",
  fontSize: 20,
};

const gradeCampos = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
  gap: 16,
};

const campoGrupo = {
  display: "grid",
  gap: 7,
};

const labelStyle = {
  color: "#415365",
  fontSize: 13,
  fontWeight: 700,
};

const label = labelStyle;

const campoComSufixo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const campoTexto = {
  width: "100%",
  minHeight: 42,
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#ffffff",
  color: "#102b46",
  caretColor: "#102b46",
  colorScheme: "light",
  outline: "none",
  fontSize: 14,
};

const campoDesabilitado = {
  background: "#f5f7fa",
  color: "#7a8694",
  cursor: "not-allowed",
};

const sufixo = {
  minWidth: 28,
  color: "#6b7785",
  fontWeight: 700,
};

const textarea = {
  ...campoTexto,
  minHeight: 110,
  resize: "vertical",
  fontFamily: "inherit",
};

const checkboxLinha = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 18,
  color: "#102b46",
  fontWeight: 700,
};

const acoes = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
};

const botaoPrimario = {
  padding: "11px 18px",
  border: 0,
  borderRadius: 8,
  background: "#d8a20d",
  color: "#102b46",
  fontWeight: 800,
  cursor: "pointer",
};

const botaoSecundario = {
  padding: "11px 18px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontWeight: 700,
  cursor: "pointer",
};

const alertaErro = {
  marginBottom: 16,
  padding: "11px 14px",
  border: "1px solid #f0c4c4",
  borderRadius: 8,
  background: "#fff4f4",
  color: "#b42318",
};

const alertaSucesso = {
  marginBottom: 16,
  padding: "11px 14px",
  border: "1px solid #b7dfc4",
  borderRadius: 8,
  background: "#f1fbf4",
  color: "#25703b",
};

const estadoCarregando = {
  padding: 30,
  border: "1px solid #dfe5eb",
  borderRadius: 8,
  background: "#fff",
  color: "#778493",
  textAlign: "center",
};

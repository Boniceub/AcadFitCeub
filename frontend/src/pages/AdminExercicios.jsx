import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";
const TIPOS = ["Máquina", "Halter", "Cabo", "Peso Corporal"];
const FORM_VAZIO = { nome: "", musculo_alvo: "", tipo: "Máquina" };

export default function AdminExercicios() {
  const navigate = useNavigate();
  const [exercicios, setExercicios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [exercicioEditando, setExercicioEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarExercicios();
  }, []);

  const buscarExercicios = async () => {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/exercicios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setExercicios(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = () => {
    setModoEdicao(false);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  };

  const abrirModalEdicao = (ex) => {
    setModoEdicao(true);
    setExercicioEditando(ex);
    setForm({ nome: ex.nome, musculo_alvo: ex.musculo_alvo, tipo: ex.tipo });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setForm(FORM_VAZIO);
    setExercicioEditando(null);
    setErro("");
  };

  const salvar = async () => {
    if (!form.nome || !form.musculo_alvo || !form.tipo) {
      setErro("Preencha todos os campos.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const url = modoEdicao
        ? `${API_URL}/exercicios/${exercicioEditando.id}`
        : `${API_URL}/exercicios`;
      const method = modoEdicao ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      setSucesso(modoEdicao ? "Exercício atualizado!" : "Exercício criado!");
      setTimeout(() => setSucesso(""), 3000);
      fecharModal();
      buscarExercicios();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id, nome) => {
    if (!window.confirm(`Deletar "${nome}"? Esta ação não pode ser desfeita.`))
      return;
    try {
      const res = await fetch(`${API_URL}/exercicios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setSucesso("Exercício deletado!");
      setTimeout(() => setSucesso(""), 3000);
      buscarExercicios();
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: "32px 36px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                color: "#102b46",
                fontWeight: 800,
              }}
            >
              Administração de Exercícios
            </h1>
            <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
              Adicione, edite ou remova exercícios do catálogo.
            </p>
          </div>
          <button
            onClick={abrirModalNovo}
            style={{
              padding: "10px 20px",
              background: "#d8a20d",
              color: "#102b46",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            + Novo Exercício
          </button>
        </header>

        {sucesso && (
          <div
            style={{
              background: "#f0fff4",
              border: "1px solid #b2f5c8",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 16,
              color: "#276749",
              fontSize: 14,
            }}
          >
            ✓ {sucesso}
          </div>
        )}
        {erro && !modalAberto && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #ffcccc",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 16,
              color: "#cc0000",
              fontSize: 14,
            }}
          >
            {erro}
          </div>
        )}

        {carregando ? (
          <p style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            Carregando...
          </p>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Nome", "Músculo Alvo", "Tipo", "Ações"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        color: "#888",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exercicios.map((ex, i) => (
                  <tr
                    key={ex.id}
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#102b46",
                        fontWeight: 700,
                      }}
                    >
                      {ex.nome}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#555",
                      }}
                    >
                      {ex.musculo_alvo}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: "#e8f0fe",
                          color: "#1a4168",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {ex.tipo}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => abrirModalEdicao(ex)}
                          style={{
                            padding: "6px 14px",
                            background: "#1a4168",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletar(ex.id, ex.nome)}
                          style={{
                            padding: "6px 14px",
                            background: "#fff",
                            color: "#cc0000",
                            border: "1px solid #ffcccc",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {exercicios.length === 0 && (
              <p style={{ textAlign: "center", padding: 32, color: "#888" }}>
                Nenhum exercício cadastrado.
              </p>
            )}
          </div>
        )}
      </main>

      {modalAberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharModal();
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#102b46",
                marginBottom: 24,
              }}
            >
              {modoEdicao ? "Editar Exercício" : "Novo Exercício"}
            </h2>

            {erro && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #ffcccc",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  color: "#cc0000",
                  fontSize: 14,
                }}
              >
                {erro}
              </div>
            )}

            <Campo label="Nome do exercício">
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Supino Reto"
                style={inputStyle}
              />
            </Campo>

            <Campo label="Músculo alvo">
              <input
                value={form.musculo_alvo}
                onChange={(e) =>
                  setForm({ ...form, musculo_alvo: e.target.value })
                }
                placeholder="Ex: Peitoral maior"
                style={inputStyle}
              />
            </Campo>

            <Campo label="Tipo de equipamento">
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Campo>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={fecharModal}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                style={{
                  flex: 1,
                  padding: 12,
                  background: salvando ? "#aaa" : "#d8a20d",
                  color: "#102b46",
                  border: "none",
                  borderRadius: 8,
                  cursor: salvando ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {salvando
                  ? "Salvando..."
                  : modoEdicao
                    ? "Salvar alterações"
                    : "Criar exercício"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 13,
          color: "#333",
          fontWeight: 700,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
  color: "#333",
  background: "#fff",
};

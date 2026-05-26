import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";
const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function CriarFicha() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [exercicios, setExercicios] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarExercicios();
  }, []);

  const buscarExercicios = async () => {
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

  const toggleExercicio = (ex) => {
    setSelecionados((prev) => {
      const existe = prev.find((item) => item.id === ex.id);
      if (existe) return prev.filter((item) => item.id !== ex.id);
      return [...prev, { ...ex, series: 3, repeticoes: 10, carga_kg: "" }];
    });
  };

  const atualizarCampo = (id, campo, valor) => {
    setSelecionados((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)),
    );
  };

  const criarFicha = async () => {
    if (!nome.trim()) {
      setErro("Digite um nome para a ficha.");
      return;
    }
    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um exercício.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      const resF = await fetch(`${API_URL}/fichas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, dia_semana: diaSemana || null }),
      });
      const dataF = await resF.json();
      if (!resF.ok) throw new Error(dataF.erro);

      const fichaId = dataF.ficha.id;

      await Promise.all(
        selecionados.map((ex) =>
          fetch(`${API_URL}/fichas/${fichaId}/exercicios`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              exercicio_id: ex.id,
              series: Number(ex.series),
              repeticoes: Number(ex.repeticoes),
              carga_kg: ex.carga_kg ? Number(ex.carga_kg) : null,
            }),
          }),
        ),
      );

      navigate("/meus-treinos");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const exerciciosFiltrados = exercicios.filter(
    (ex) =>
      ex.nome.toLowerCase().includes(busca.toLowerCase()) ||
      ex.musculo_alvo.toLowerCase().includes(busca.toLowerCase()),
  );

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
              Criar Ficha
            </h1>
            <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
              Defina um nome e selecione exercícios do catálogo.
            </p>
          </div>
          <button
            onClick={() => navigate("/meus-treinos")}
            style={secondaryButton}
          >
            Voltar
          </button>
        </header>

        {erro && <div style={alertaErro}>{erro}</div>}

        <section style={panelStyle}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={labelStyle}>Nome da ficha</label>
              <input
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErro("");
                }}
                placeholder="Ex: Ficha A — Peito e Tríceps"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Dia da semana (opcional)</label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                style={inputStyle}
              >
                <option value="">Sem dia definido</option>
                {DIAS_SEMANA.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 20,
            marginTop: 20,
          }}
        >
          <div style={panelStyle}>
            <h2 style={{ margin: "0 0 16px", color: "#102b46", fontSize: 18 }}>
              Catálogo de Exercícios
            </h2>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exercício..."
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            {carregando ? (
              <p style={{ color: "#888" }}>Carregando exercícios...</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {exerciciosFiltrados.map((ex) => {
                  const ativo = selecionados.some((s) => s.id === ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => toggleExercicio(ex)}
                      style={{
                        textAlign: "left",
                        padding: 14,
                        borderRadius: 10,
                        border: ativo
                          ? "2px solid #d8a20d"
                          : "1px solid #d9dee5",
                        background: ativo ? "#fff8e5" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          color: "#102b46",
                          marginBottom: 3,
                        }}
                      >
                        {ex.nome}
                      </strong>
                      <span style={{ color: "#7b8794", fontSize: 12 }}>
                        {ex.musculo_alvo}
                      </span>
                      <div style={{ marginTop: 8 }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: "#e5f1fb",
                            color: "#1a4168",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {ex.tipo}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside style={panelStyle}>
            <h2 style={{ margin: "0 0 6px", color: "#102b46", fontSize: 18 }}>
              Selecionados
            </h2>
            <p style={{ margin: "0 0 16px", color: "#7b8794", fontSize: 13 }}>
              {selecionados.length} exercícios
            </p>

            {selecionados.length === 0 ? (
              <p style={{ color: "#7b8794", fontSize: 13 }}>
                Selecione exercícios ao lado.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {selecionados.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#f7f9fb",
                      border: "1px solid #edf1f5",
                    }}
                  >
                    <strong style={{ color: "#102b46", fontSize: 13 }}>
                      {ex.nome}
                    </strong>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      <div>
                        <label style={{ fontSize: 10, color: "#7b8794" }}>
                          SÉRIES
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={ex.series}
                          onChange={(e) =>
                            atualizarCampo(ex.id, "series", e.target.value)
                          }
                          style={smallInput}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: "#7b8794" }}>
                          REPS
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={ex.repeticoes}
                          onChange={(e) =>
                            atualizarCampo(ex.id, "repeticoes", e.target.value)
                          }
                          style={smallInput}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: "#7b8794" }}>
                          CARGA (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ex.carga_kg}
                          onChange={(e) =>
                            atualizarCampo(ex.id, "carga_kg", e.target.value)
                          }
                          placeholder="0"
                          style={smallInput}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={criarFicha}
              disabled={salvando}
              style={{
                ...primaryButton,
                width: "100%",
                opacity: salvando ? 0.7 : 1,
              }}
            >
              {salvando ? "Criando..." : "Criar ficha"}
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

const panelStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 22,
  boxShadow: "0 1px 6px rgba(16,43,70,0.08)",
};
const labelStyle = {
  display: "block",
  color: "#102b46",
  fontWeight: 700,
  marginBottom: 6,
  fontSize: 13,
};
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #d9dee5",
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontSize: 14,
  boxSizing: "border-box",
};
const smallInput = {
  width: "100%",
  padding: "7px 8px",
  border: "1px solid #d9dee5",
  borderRadius: 6,
  background: "#fff",
  color: "#102b46",
  fontSize: 13,
  boxSizing: "border-box",
};
const primaryButton = {
  padding: "12px 20px",
  border: 0,
  borderRadius: 8,
  background: "#d8a20d",
  color: "#102b46",
  fontWeight: 900,
  cursor: "pointer",
};
const secondaryButton = {
  padding: "11px 18px",
  border: "1px solid #d9dee5",
  borderRadius: 9,
  background: "#fff",
  color: "#102b46",
  fontWeight: 700,
  cursor: "pointer",
};
const alertaErro = {
  background: "#fff0f0",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  padding: "10px 16px",
  marginBottom: 16,
  color: "#cc0000",
  fontSize: 14,
};

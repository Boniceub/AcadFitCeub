import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";

export default function TreinoDoDia() {
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [concluidos, setConcluidos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarTreinoDoDia();
  }, []);

  const buscarTreinoDoDia = async () => {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch(`${API_URL}/fichas/treino-do-dia`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setFicha(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const toggleConcluido = (id) => {
    setConcluidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalExercicios = ficha?.ficha_exercicio?.length || 0;
  const totalConcluidos = Object.values(concluidos).filter(Boolean).length;
  const progresso =
    totalExercicios > 0 ? (totalConcluidos / totalExercicios) * 100 : 0;

  const concluirTreino = async () => {
    if (!ficha) return;
    setRegistrando(true);
    setErro("");
    try {
      const res = await fetch(`${API_URL}/treinos-realizados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ficha_id: ficha.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setSucesso("Treino concluído e registrado com sucesso!");
      setTimeout(() => navigate("/meus-treinos"), 2000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setRegistrando(false);
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
              Treino do Dia
            </h1>
            <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </p>
          </div>
          <button
            onClick={() => navigate("/meus-treinos")}
            style={secondaryButton}
          >
            ← Voltar
          </button>
        </header>

        {sucesso && <div style={alertaSucesso}>✓ {sucesso}</div>}
        {erro && (
          <div style={panelStyle}>
            <p style={{ color: "#7b8794", margin: "0 0 16px" }}>{erro}</p>
            <button
              onClick={() => navigate("/criar-ficha")}
              style={primaryButton}
            >
              Criar ficha para hoje
            </button>
          </div>
        )}

        {carregando && <LoadingState mensagem="Carregando treino..." />}

        {ficha && !carregando && (
          <>
            <section style={{ ...panelStyle, marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, color: "#102b46", fontSize: 20 }}>
                    {ficha.nome}
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#7b8794",
                      fontSize: 14,
                    }}
                  >
                    {totalConcluidos} de {totalExercicios} exercícios concluídos
                  </p>
                </div>
                <span
                  style={{ fontSize: 22, fontWeight: 900, color: "#d8a20d" }}
                >
                  {Math.round(progresso)}%
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "#eceff2",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progresso}%`,
                    background: "#d8a20d",
                    borderRadius: 99,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </section>

            <section
              style={{
                ...panelStyle,
                padding: 0,
                overflow: "hidden",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
                  padding: "12px 22px",
                  background: "#f7f9fb",
                  color: "#7b8794",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>EXERCÍCIO</span>
                <span>SÉRIES</span>
                <span>REPS</span>
                <span>CARGA</span>
                <span>FEITO</span>
              </div>

              {ficha.ficha_exercicio?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
                    padding: "16px 22px",
                    borderTop: "1px solid #edf1f5",
                    alignItems: "center",
                    background: concluidos[item.id] ? "#f0fff4" : "#fff",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        color: "#102b46",
                        textDecoration: concluidos[item.id]
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {item.exercicio?.nome}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        color: "#7b8794",
                        fontSize: 13,
                      }}
                    >
                      {item.exercicio?.musculo_alvo}
                    </p>
                  </div>
                  <span style={{ color: "#56616d" }}>{item.series}</span>
                  <span style={{ color: "#56616d" }}>{item.repeticoes}</span>
                  <span style={{ color: "#56616d" }}>
                    {item.carga_kg ? `${item.carga_kg} kg` : "—"}
                  </span>
                  <div
                    onClick={() => toggleConcluido(item.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: concluidos[item.id]
                        ? "2px solid #16a34a"
                        : "2px solid #d9dee5",
                      background: concluidos[item.id] ? "#16a34a" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {concluidos[item.id] ? "✓" : ""}
                  </div>
                </div>
              ))}
            </section>

            <button
              onClick={concluirTreino}
              disabled={registrando || totalConcluidos === 0}
              style={{
                ...primaryButton,
                padding: "14px 32px",
                fontSize: 16,
                opacity: registrando || totalConcluidos === 0 ? 0.6 : 1,
                cursor:
                  registrando || totalConcluidos === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {registrando ? "Registrando..." : "Concluir treino"}
            </button>
            {totalConcluidos === 0 && (
              <p style={{ color: "#7b8794", fontSize: 13, marginTop: 8 }}>
                Marque pelo menos um exercício como feito para concluir.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const panelStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 24,
  boxShadow: "0 1px 6px rgba(16,43,70,0.08)",
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
const alertaSucesso = {
  background: "#f0fff4",
  border: "1px solid #b2f5c8",
  borderRadius: 8,
  padding: "10px 16px",
  marginBottom: 16,
  color: "#276749",
  fontSize: 14,
};

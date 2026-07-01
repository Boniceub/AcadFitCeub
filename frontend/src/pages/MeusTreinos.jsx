import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";

export default function MeusTreinos() {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [fichaAtiva, setFichaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarFichas();
  }, []);

  const buscarFichas = async () => {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch(`${API_URL}/fichas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao buscar fichas.");
      setFichas(data);
      if (data.length > 0) buscarFichaDetalhada(data[0].id);
      else setCarregando(false);
    } catch (err) {
      setErro(err.message);
      setCarregando(false);
    }
  };

  const buscarFichaDetalhada = async (id) => {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/fichas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao buscar ficha.");
      setFichaAtiva(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const deletarFicha = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta ficha?")) return;
    try {
      const res = await fetch(`${API_URL}/fichas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      setSucesso("Ficha excluída com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      buscarFichas();
      setFichaAtiva(null);
    } catch (err) {
      setErro(err.message);
    }
  };

  const removerExercicio = async (fichaId, fichaExercicioId) => {
    try {
      const res = await fetch(
        `${API_URL}/fichas/${fichaId}/exercicios/${fichaExercicioId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
      buscarFichaDetalhada(fichaId);
    } catch (err) {
      setErro(err.message);
    }
  };

  const agruparPorMusculo = (exercicios) => {
    return exercicios.reduce((acc, item) => {
      const grupo = item.exercicio?.musculo_alvo || "Outros";
      if (!acc[grupo]) acc[grupo] = [];
      acc[grupo].push(item);
      return acc;
    }, {});
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
              Meus Treinos
            </h1>
            <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
              Gerencie suas fichas e registre seus treinos.
            </p>
          </div>
          <button
            onClick={() => navigate("/criar-ficha")}
            style={primaryButton}
          >
            + Nova ficha
          </button>
        </header>

        {sucesso && <div style={alertaSucesso}>✓ {sucesso}</div>}
        {erro && <div style={alertaErro}>{erro}</div>}

        {carregando ? (
          <LoadingState mensagem="Carregando fichas..." />
        ) : fichas.length === 0 ? (
          <section style={panelStyle}>
            <h2 style={{ margin: "0 0 8px", color: "#102b46" }}>
              Nenhuma ficha criada
            </h2>
            <p style={{ color: "#7b8794" }}>
              Crie sua primeira ficha de treino.
            </p>
            <button
              onClick={() => navigate("/criar-ficha")}
              style={{ ...primaryButton, marginTop: 14 }}
            >
              Criar ficha
            </button>
          </section>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {fichas.map((ficha) => (
                <button
                  key={ficha.id}
                  onClick={() => buscarFichaDetalhada(ficha.id)}
                  style={{
                    padding: "12px 20px",
                    border: "1px solid #d9dee5",
                    borderRadius: 9,
                    background:
                      fichaAtiva?.id === ficha.id ? "#1a4168" : "#fff",
                    color: fichaAtiva?.id === ficha.id ? "#fff" : "#102b46",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {ficha.nome}
                </button>
              ))}
            </div>

            {fichaAtiva && (
              <section
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 1px 6px rgba(16,43,70,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "22px 26px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #edf1f5",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, color: "#102b46", fontSize: 22 }}>
                      {fichaAtiva.nome}
                    </h2>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#7b8794",
                        fontSize: 14,
                      }}
                    >
                      {fichaAtiva.dia_semana
                        ? `Dia: ${fichaAtiva.dia_semana}`
                        : "Sem dia definido"}{" "}
                      · {fichaAtiva.ficha_exercicio?.length || 0} exercícios
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => navigate(`/editar-ficha/${fichaAtiva.id}`)}
                      style={outlineButton}
                    >
                      Editar ficha
                    </button>
                    <button
                      onClick={() => navigate(`/treino-do-dia`)}
                      style={primaryButton}
                    >
                      Iniciar treino
                    </button>
                    <button
                      onClick={() => deletarFicha(fichaAtiva.id)}
                      style={dangerButton}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {fichaAtiva.ficha_exercicio?.length === 0 ? (
                  <p style={{ padding: 24, color: "#7b8794" }}>
                    Nenhum exercício nesta ficha.{" "}
                    <span
                      style={{
                        color: "#d8a20d",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      onClick={() => navigate(`/editar-ficha/${fichaAtiva.id}`)}
                    >
                      Adicionar exercícios
                    </span>
                  </p>
                ) : (
                  Object.entries(
                    agruparPorMusculo(fichaAtiva.ficha_exercicio || []),
                  ).map(([grupo, itens]) => (
                    <div key={grupo}>
                      <div
                        style={{
                          padding: "10px 22px",
                          background: "#fff1d1",
                          color: "#b27600",
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {grupo}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
                          padding: "10px 22px",
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
                        <span></span>
                      </div>
                      {itens.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
                            padding: "14px 22px",
                            borderTop: "1px solid #edf1f5",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                margin: 0,
                                color: "#102b46",
                                fontWeight: 700,
                              }}
                            >
                              {item.exercicio?.nome}
                            </p>
                          </div>
                          <span style={{ color: "#56616d" }}>
                            {item.series}
                          </span>
                          <span style={{ color: "#56616d" }}>
                            {item.repeticoes}
                          </span>
                          <span style={{ color: "#56616d" }}>
                            {item.carga_kg ? `${item.carga_kg} kg` : "—"}
                          </span>
                          <button
                            onClick={() =>
                              removerExercicio(fichaAtiva.id, item.id)
                            }
                            style={{
                              border: 0,
                              background: "transparent",
                              color: "#b91c1c",
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const primaryButton = {
  padding: "11px 20px",
  border: 0,
  borderRadius: 8,
  background: "#d8a20d",
  color: "#102b46",
  fontWeight: 900,
  cursor: "pointer",
};
const outlineButton = {
  padding: "11px 20px",
  border: "1px solid #1a4168",
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontWeight: 700,
  cursor: "pointer",
};
const dangerButton = {
  padding: "11px 14px",
  border: 0,
  borderRadius: 8,
  background: "#fff1f1",
  color: "#b91c1c",
  fontWeight: 700,
  cursor: "pointer",
};
const panelStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 28,
  boxShadow: "0 1px 6px rgba(16,43,70,0.08)",
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
const alertaErro = {
  background: "#fff0f0",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  padding: "10px 16px",
  marginBottom: 16,
  color: "#cc0000",
  fontSize: 14,
};

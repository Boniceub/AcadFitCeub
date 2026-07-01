import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";

export default function TreinoDoDia() {
  const navigate = useNavigate();

  const [ficha, setFicha] = useState(null);
  const [seriesPorExercicio, setSeriesPorExercicio] = useState({});
  const [exerciciosConcluidos, setExerciciosConcluidos] = useState({});
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarTreinoDoDia();
  }, []);

  const montarSeriesIniciais = (fichaData) => {
    const seriesIniciais = {};

    fichaData.ficha_exercicio?.forEach((item) => {
      const quantidadeSeries = Math.max(Number(item.series) || 1, 1);

      seriesIniciais[item.id] = Array.from(
        { length: quantidadeSeries },
        (_, index) => ({
          numero_serie: index + 1,
          repeticoes: item.repeticoes || "",
          carga_kg: item.carga_kg ?? "",
          concluida: true,
        }),
      );
    });

    setSeriesPorExercicio(seriesIniciais);
  };

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
      montarSeriesIniciais(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const atualizarSerie = (fichaExercicioId, indiceSerie, campo, valor) => {
    setSeriesPorExercicio((prev) => ({
      ...prev,
      [fichaExercicioId]: prev[fichaExercicioId].map((serie, index) =>
        index === indiceSerie ? { ...serie, [campo]: valor } : serie,
      ),
    }));

    setExerciciosConcluidos((prev) => ({
      ...prev,
      [fichaExercicioId]: false,
    }));
  };

  const adicionarSerie = (fichaExercicioId) => {
    setSeriesPorExercicio((prev) => {
      const seriesAtuais = prev[fichaExercicioId] || [];

      return {
        ...prev,
        [fichaExercicioId]: [
          ...seriesAtuais,
          {
            numero_serie: seriesAtuais.length + 1,
            repeticoes: "",
            carga_kg: "",
            concluida: true,
          },
        ],
      };
    });

    setExerciciosConcluidos((prev) => ({
      ...prev,
      [fichaExercicioId]: false,
    }));
  };

  const removerSerie = (fichaExercicioId, indiceSerie) => {
    setSeriesPorExercicio((prev) => {
      const seriesAtuais = prev[fichaExercicioId] || [];

      if (seriesAtuais.length <= 1) {
        return prev;
      }

      const novasSeries = seriesAtuais
        .filter((_, index) => index !== indiceSerie)
        .map((serie, index) => ({
          ...serie,
          numero_serie: index + 1,
        }));

      return {
        ...prev,
        [fichaExercicioId]: novasSeries,
      };
    });

    setExerciciosConcluidos((prev) => ({
      ...prev,
      [fichaExercicioId]: false,
    }));
  };

  const exercicioTemSerieValida = (fichaExercicioId) => {
    const series = seriesPorExercicio[fichaExercicioId] || [];

    return series.some((serie) => Number(serie.repeticoes) > 0);
  };

  const concluirExercicioAtual = () => {
    const exercicioAtual = ficha?.ficha_exercicio?.[indiceAtual];

    if (!exercicioAtual) return;

    if (!exercicioTemSerieValida(exercicioAtual.id)) {
      setErro("Informe pelo menos uma serie valida para este exercicio.");
      return;
    }

    setErro("");

    setExerciciosConcluidos((prev) => ({
      ...prev,
      [exercicioAtual.id]: true,
    }));

    const ultimoIndice = (ficha?.ficha_exercicio?.length || 1) - 1;

    if (indiceAtual < ultimoIndice) {
      setIndiceAtual((prev) => prev + 1);
    }
  };

  const voltarExercicio = () => {
    setErro("");
    setIndiceAtual((prev) => Math.max(prev - 1, 0));
  };

  const avancarExercicio = () => {
    setErro("");
    const ultimoIndice = (ficha?.ficha_exercicio?.length || 1) - 1;
    setIndiceAtual((prev) => Math.min(prev + 1, ultimoIndice));
  };

  const todosExerciciosConcluidos = () => {
    if (!ficha?.ficha_exercicio?.length) return false;

    return ficha.ficha_exercicio.every(
      (item) =>
        exerciciosConcluidos[item.id] && exercicioTemSerieValida(item.id),
    );
  };

  const montarPayloadSeries = () => {
    return Object.entries(seriesPorExercicio).flatMap(
      ([fichaExercicioId, series]) =>
        series
          .filter((serie) => Number(serie.repeticoes) > 0)
          .map((serie, index) => ({
            ficha_exercicio_id: fichaExercicioId,
            numero_serie: index + 1,
            repeticoes: Number(serie.repeticoes),
            carga_kg:
              serie.carga_kg === "" ||
              serie.carga_kg === null ||
              serie.carga_kg === undefined
                ? null
                : Number(serie.carga_kg),
            concluida: true,
          })),
    );
  };

  const finalizarTreino = async () => {
    if (!ficha) return;

    if (!todosExerciciosConcluidos()) {
      setErro("Conclua todos os exercicios antes de finalizar o treino.");
      return;
    }

    setRegistrando(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/treinos-realizados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ficha_id: ficha.id,
          series: montarPayloadSeries(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      setSucesso("Treino finalizado e registrado com sucesso!");
      setTimeout(() => navigate("/meus-treinos"), 2000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setRegistrando(false);
    }
  };

  const totalExercicios = ficha?.ficha_exercicio?.length || 0;
  const totalConcluidos =
    ficha?.ficha_exercicio?.filter((item) => exerciciosConcluidos[item.id])
      .length || 0;

  const progresso =
    totalExercicios > 0 ? (totalConcluidos / totalExercicios) * 100 : 0;

  const exercicioAtual = ficha?.ficha_exercicio?.[indiceAtual];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar />

      <main style={{ marginLeft: 240, padding: "32px 36px" }}>
        <header style={headerStyle}>
          <div>
            <h1 style={tituloStyle}>Treino do Dia</h1>
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
            Voltar
          </button>
        </header>

        {sucesso && <div style={alertaSucesso}>{sucesso}</div>}
        {erro && <div style={alertaErro}>{erro}</div>}

        {carregando && <LoadingState mensagem="Carregando treino..." />}

        {!carregando && erro && !ficha && (
          <section style={panelStyle}>
            <p style={{ color: "#7b8794", margin: "0 0 16px" }}>
              Nenhuma ficha foi encontrada para hoje.
            </p>

            <button
              onClick={() => navigate("/criar-ficha")}
              style={primaryButton}
            >
              Criar ficha para hoje
            </button>
          </section>
        )}

        {ficha && !carregando && !treinoIniciado && (
          <>
            <section style={{ ...panelStyle, marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: "#102b46", fontSize: 22 }}>
                {ficha.nome}
              </h2>

              <p style={{ margin: "8px 0 0", color: "#7b8794" }}>
                {totalExercicios} exercicios planejados para hoje.
              </p>

              <div style={resumoLista}>
                {ficha.ficha_exercicio?.map((item) => (
                  <div key={item.id} style={resumoItem}>
                    <div>
                      <strong style={{ color: "#102b46" }}>
                        {item.exercicio?.nome}
                      </strong>

                      <p style={{ margin: "4px 0 0", color: "#7b8794" }}>
                        {item.series}x{item.repeticoes}
                        {item.carga_kg ? ` - ${item.carga_kg} kg` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={() => setTreinoIniciado(true)}
              style={{ ...primaryButton, padding: "14px 28px" }}
            >
              Iniciar treino
            </button>
          </>
        )}

        {ficha && !carregando && treinoIniciado && exercicioAtual && (
          <>
            <section style={{ ...panelStyle, marginBottom: 20 }}>
              <div style={progressoHeader}>
                <div>
                  <h2 style={{ margin: 0, color: "#102b46", fontSize: 20 }}>
                    {ficha.nome}
                  </h2>

                  <p style={{ margin: "4px 0 0", color: "#7b8794" }}>
                    Exercicio {indiceAtual + 1} de {totalExercicios} ·{" "}
                    {totalConcluidos} concluidos
                  </p>
                </div>

                <span style={percentualStyle}>{Math.round(progresso)}%</span>
              </div>

              <div style={barraProgresso}>
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

            <section style={panelStyle}>
              <div style={exercicioHeader}>
                <div>
                  <h2 style={{ margin: 0, color: "#102b46", fontSize: 24 }}>
                    {exercicioAtual.exercicio?.nome}
                  </h2>

                  <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
                    {exercicioAtual.exercicio?.musculo_alvo}
                  </p>

                  <p style={{ margin: "10px 0 0", color: "#56616d" }}>
                    Planejado: {exercicioAtual.series}x
                    {exercicioAtual.repeticoes}
                    {exercicioAtual.carga_kg
                      ? ` - ${exercicioAtual.carga_kg} kg`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => adicionarSerie(exercicioAtual.id)}
                  style={smallPrimaryButton}
                >
                  + Serie
                </button>
              </div>

              <div style={seriesHeader}>
                <span>Serie</span>
                <span>Repeticoes</span>
                <span>Carga</span>
                <span></span>
              </div>

              {(seriesPorExercicio[exercicioAtual.id] || []).map(
                (serie, index) => (
                  <div key={`${exercicioAtual.id}-${index}`} style={serieRow}>
                    <strong style={{ color: "#102b46" }}>
                      {serie.numero_serie}
                    </strong>

                    <input
                      type="number"
                      min="1"
                      value={serie.repeticoes}
                      onChange={(e) =>
                        atualizarSerie(
                          exercicioAtual.id,
                          index,
                          "repeticoes",
                          e.target.value,
                        )
                      }
                      placeholder="Ex: 10"
                      style={inputStyle}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={serie.carga_kg}
                      onChange={(e) =>
                        atualizarSerie(
                          exercicioAtual.id,
                          index,
                          "carga_kg",
                          e.target.value,
                        )
                      }
                      placeholder="kg"
                      style={inputStyle}
                    />

                    <button
                      type="button"
                      onClick={() => removerSerie(exercicioAtual.id, index)}
                      disabled={
                        (seriesPorExercicio[exercicioAtual.id] || []).length <=
                        1
                      }
                      style={{
                        ...removeButton,
                        opacity:
                          (seriesPorExercicio[exercicioAtual.id] || [])
                            .length <= 1
                            ? 0.35
                            : 1,
                        cursor:
                          (seriesPorExercicio[exercicioAtual.id] || [])
                            .length <= 1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ),
              )}

              <div style={acoesTreino}>
                <button
                  type="button"
                  onClick={voltarExercicio}
                  disabled={indiceAtual === 0}
                  style={{
                    ...secondaryButton,
                    opacity: indiceAtual === 0 ? 0.5 : 1,
                    cursor: indiceAtual === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={concluirExercicioAtual}
                  style={primaryButton}
                >
                  {exerciciosConcluidos[exercicioAtual.id]
                    ? "Atualizar exercicio"
                    : "Concluir exercicio"}
                </button>

                <button
                  type="button"
                  onClick={avancarExercicio}
                  disabled={indiceAtual === totalExercicios - 1}
                  style={{
                    ...secondaryButton,
                    opacity: indiceAtual === totalExercicios - 1 ? 0.5 : 1,
                    cursor:
                      indiceAtual === totalExercicios - 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Proximo
                </button>
              </div>
            </section>

            <div style={rodapeTreino}>
              <button
                type="button"
                onClick={finalizarTreino}
                disabled={registrando || !todosExerciciosConcluidos()}
                style={{
                  ...primaryButton,
                  padding: "14px 32px",
                  fontSize: 16,
                  opacity:
                    registrando || !todosExerciciosConcluidos() ? 0.6 : 1,
                  cursor:
                    registrando || !todosExerciciosConcluidos()
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {registrando ? "Registrando..." : "Finalizar treino"}
              </button>

              {!todosExerciciosConcluidos() && (
                <p style={{ margin: "10px 0 0", color: "#7b8794" }}>
                  Conclua todos os exercicios para finalizar o treino.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
};

const tituloStyle = {
  margin: 0,
  fontSize: 28,
  color: "#102b46",
  fontWeight: 800,
};

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

const smallPrimaryButton = {
  padding: "8px 14px",
  border: 0,
  borderRadius: 8,
  background: "#d8a20d",
  color: "#102b46",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d9dee5",
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontSize: 14,
  boxSizing: "border-box",
};

const resumoLista = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 18,
};

const resumoItem = {
  padding: 14,
  borderRadius: 10,
  background: "#f7f9fb",
  border: "1px solid #edf1f5",
};

const progressoHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
};

const percentualStyle = {
  fontSize: 22,
  fontWeight: 900,
  color: "#d8a20d",
};

const barraProgresso = {
  height: 10,
  background: "#eceff2",
  borderRadius: 99,
  overflow: "hidden",
};

const exercicioHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 18,
};

const seriesHeader = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 1fr 110px",
  gap: 12,
  color: "#7b8794",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 8,
};

const serieRow = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 1fr 110px",
  gap: 12,
  alignItems: "center",
  padding: "10px 0",
  borderTop: "1px solid #edf1f5",
};

const removeButton = {
  padding: "9px 12px",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  background: "#fff5f5",
  color: "#b91c1c",
  fontWeight: 800,
};

const acoesTreino = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 22,
  flexWrap: "wrap",
};

const rodapeTreino = {
  marginTop: 20,
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

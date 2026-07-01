import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";

export default function TreinoDoDia() {
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [seriesPorExercicio, setSeriesPorExercicio] = useState({});
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
  };

  const seriesValidas = () => {
    if (!ficha?.ficha_exercicio?.length) return false;

    return ficha.ficha_exercicio.every((item) => {
      const series = seriesPorExercicio[item.id] || [];

      return series.some(
        (serie) => Number(serie.repeticoes) > 0 && Number(serie.carga_kg) >= 0,
      );
    });
  };

  const totalExercicios = ficha?.ficha_exercicio?.length || 0;

  const totalExerciciosComSeries =
    ficha?.ficha_exercicio?.filter((item) => {
      const series = seriesPorExercicio[item.id] || [];

      return series.some((serie) => Number(serie.repeticoes) > 0);
    }).length || 0;

  const progresso =
    totalExercicios > 0
      ? (totalExerciciosComSeries / totalExercicios) * 100
      : 0;

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

  const concluirTreino = async () => {
    if (!ficha) return;

    if (!seriesValidas()) {
      setErro("Informe pelo menos uma serie valida para cada exercicio.");
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

      setSucesso("Treino concluido e registrado com sucesso!");
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
            Voltar
          </button>
        </header>

        {sucesso && <div style={alertaSucesso}>{sucesso}</div>}

        {erro && (
          <div style={alertaErro}>
            <p style={{ margin: 0 }}>{erro}</p>
          </div>
        )}

        {carregando && <LoadingState mensagem="Carregando treino..." />}

        {!carregando && erro && !ficha && (
          <div style={panelStyle}>
            <p style={{ color: "#7b8794", margin: "0 0 16px" }}>
              Nenhuma ficha foi encontrada para hoje.
            </p>

            <button
              onClick={() => navigate("/criar-ficha")}
              style={primaryButton}
            >
              Criar ficha para hoje
            </button>
          </div>
        )}

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
                    {totalExerciciosComSeries} de {totalExercicios} exercicios
                    com series preenchidas
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
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {ficha.ficha_exercicio?.map((item) => (
                <div key={item.id} style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#102b46",
                          fontSize: 18,
                          fontWeight: 800,
                        }}
                      >
                        {item.exercicio?.nome}
                      </h3>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#7b8794",
                          fontSize: 13,
                        }}
                      >
                        {item.exercicio?.musculo_alvo}
                      </p>

                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "#56616d",
                          fontSize: 13,
                        }}
                      >
                        Planejado: {item.series}x{item.repeticoes}
                        {item.carga_kg ? ` - ${item.carga_kg} kg` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => adicionarSerie(item.id)}
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

                  {(seriesPorExercicio[item.id] || []).map((serie, index) => (
                    <div key={`${item.id}-${index}`} style={serieRow}>
                      <strong style={{ color: "#102b46" }}>
                        {serie.numero_serie}
                      </strong>

                      <input
                        type="number"
                        min="1"
                        value={serie.repeticoes}
                        onChange={(e) =>
                          atualizarSerie(
                            item.id,
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
                            item.id,
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
                        onClick={() => removerSerie(item.id, index)}
                        disabled={
                          (seriesPorExercicio[item.id] || []).length <= 1
                        }
                        style={{
                          ...removeButton,
                          opacity:
                            (seriesPorExercicio[item.id] || []).length <= 1
                              ? 0.35
                              : 1,
                          cursor:
                            (seriesPorExercicio[item.id] || []).length <= 1
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <button
              onClick={concluirTreino}
              disabled={registrando || !seriesValidas()}
              style={{
                ...primaryButton,
                padding: "14px 32px",
                fontSize: 16,
                opacity: registrando || !seriesValidas() ? 0.6 : 1,
                cursor:
                  registrando || !seriesValidas() ? "not-allowed" : "pointer",
              }}
            >
              {registrando ? "Registrando..." : "Concluir treino"}
            </button>

            {!seriesValidas() && (
              <p style={{ color: "#7b8794", fontSize: 13, marginTop: 8 }}>
                Preencha pelo menos uma serie valida para cada exercicio.
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

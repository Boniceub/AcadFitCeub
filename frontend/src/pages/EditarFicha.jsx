import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";
const DIAS_SEMANA = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo",
];

export default function EditarFicha() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ficha, setFicha] = useState(null);
  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [exercicios, setExercicios] = useState([]);
  const [busca, setBusca] = useState("");
  const [edicoes, setEdicoes] = useState({});
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [novoExercicio, setNovoExercicio] = useState({
    series: 3,
    repeticoes: 10,
    carga_kg: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarDados();
  }, [id]);

  const montarEdicoes = (fichaData) => {
    const valores = {};

    fichaData.ficha_exercicio?.forEach((item) => {
      valores[item.id] = {
        series: item.series || 1,
        repeticoes: item.repeticoes || 1,
        carga_kg: item.carga_kg ?? "",
      };
    });

    setEdicoes(valores);
  };

  const buscarDados = async () => {
    setCarregando(true);
    setErro("");

    try {
      const [resF, resE] = await Promise.all([
        fetch(`${API_URL}/fichas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/exercicios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataF = await resF.json();
      const dataE = await resE.json();

      if (!resF.ok) throw new Error(dataF.erro);
      if (!resE.ok) throw new Error(dataE.erro);

      setFicha(dataF);
      setNome(dataF.nome);
      setDiaSemana(dataF.dia_semana || "");
      setExercicios(dataE);
      montarEdicoes(dataF);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const salvarFicha = async () => {
    if (!nome.trim()) {
      setErro("Nome e obrigatorio.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/fichas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, dia_semana: diaSemana || null }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      setSucesso("Ficha salva com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const atualizarEdicao = (fichaExercicioId, campo, valor) => {
    setEdicoes((prev) => ({
      ...prev,
      [fichaExercicioId]: {
        ...prev[fichaExercicioId],
        [campo]: valor,
      },
    }));
  };

  const salvarExercicioDaFicha = async (fichaExercicioId) => {
    const dados = edicoes[fichaExercicioId];

    if (!dados || Number(dados.series) <= 0 || Number(dados.repeticoes) <= 0) {
      setErro("Series e repeticoes devem ser maiores que zero.");
      return;
    }

    if (
      dados.carga_kg !== "" &&
      dados.carga_kg !== null &&
      Number(dados.carga_kg) < 0
    ) {
      setErro("Carga deve ser um valor positivo.");
      return;
    }

    setErro("");

    try {
      const res = await fetch(
        `${API_URL}/fichas/${id}/exercicios/${fichaExercicioId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            series: Number(dados.series),
            repeticoes: Number(dados.repeticoes),
            carga_kg:
              dados.carga_kg === "" || dados.carga_kg === null
                ? null
                : Number(dados.carga_kg),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      setSucesso("Exercicio atualizado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      buscarDados();
    } catch (err) {
      setErro(err.message);
    }
  };

  const selecionarExercicio = (ex) => {
    setExercicioSelecionado(ex);
    setNovoExercicio({
      series: 3,
      repeticoes: 10,
      carga_kg: "",
    });
    setErro("");
  };

  const adicionarExercicio = async () => {
    if (!exercicioSelecionado) {
      setErro("Selecione um exercicio.");
      return;
    }

    if (
      Number(novoExercicio.series) <= 0 ||
      Number(novoExercicio.repeticoes) <= 0
    ) {
      setErro("Series e repeticoes devem ser maiores que zero.");
      return;
    }

    if (
      novoExercicio.carga_kg !== "" &&
      novoExercicio.carga_kg !== null &&
      Number(novoExercicio.carga_kg) < 0
    ) {
      setErro("Carga deve ser um valor positivo.");
      return;
    }

    setErro("");

    try {
      const res = await fetch(`${API_URL}/fichas/${id}/exercicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exercicio_id: exercicioSelecionado.id,
          series: Number(novoExercicio.series),
          repeticoes: Number(novoExercicio.repeticoes),
          carga_kg:
            novoExercicio.carga_kg === "" || novoExercicio.carga_kg === null
              ? null
              : Number(novoExercicio.carga_kg),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      setSucesso("Exercicio adicionado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      setExercicioSelecionado(null);
      setBusca("");
      buscarDados();
    } catch (err) {
      setErro(err.message);
    }
  };

  const removerExercicio = async (fichaExercicioId) => {
    try {
      const res = await fetch(
        `${API_URL}/fichas/${id}/exercicios/${fichaExercicioId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      setSucesso("Exercicio removido com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      buscarDados();
    } catch (err) {
      setErro(err.message);
    }
  };

  const exerciciosNaFicha =
    ficha?.ficha_exercicio?.map((fe) => fe.exercicio_id) || [];

  const exerciciosFiltrados = exercicios.filter(
    (ex) =>
      !exerciciosNaFicha.includes(ex.id) &&
      (ex.nome.toLowerCase().includes(busca.toLowerCase()) ||
        ex.musculo_alvo.toLowerCase().includes(busca.toLowerCase())),
  );

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
        <Sidebar />
        <main style={{ marginLeft: 240, padding: "32px 36px" }}>
          <LoadingState mensagem="Carregando ficha..." />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar />

      <main style={{ marginLeft: 240, padding: "32px 36px" }}>
        <header style={headerStyle}>
          <div>
            <h1 style={tituloStyle}>Editar Ficha</h1>
            <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
              Ajuste nome, dia e exercicios da ficha.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => navigate("/meus-treinos")}
              style={secondaryButton}
            >
              Cancelar
            </button>

            <button
              onClick={salvarFicha}
              disabled={salvando}
              style={{
                ...primaryButton,
                opacity: salvando ? 0.7 : 1,
                cursor: salvando ? "not-allowed" : "pointer",
              }}
            >
              {salvando ? "Salvando..." : "Salvar ficha"}
            </button>
          </div>
        </header>

        {sucesso && <div style={alertaSucesso}>{sucesso}</div>}
        {erro && <div style={alertaErro}>{erro}</div>}

        <section style={panelStyle}>
          <div style={formGrid}>
            <div>
              <label style={labelStyle}>Nome da ficha</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Dia da semana</label>
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

        <section style={contentGrid}>
          <div style={panelStyle}>
            <h2 style={subtituloStyle}>Exercicios na ficha</h2>

            {ficha?.ficha_exercicio?.length === 0 ? (
              <p style={{ color: "#7b8794", fontSize: 14 }}>
                Nenhum exercicio adicionado ainda.
              </p>
            ) : (
              <div style={listaVertical}>
                {ficha?.ficha_exercicio?.map((item) => {
                  const edicao = edicoes[item.id] || {
                    series: item.series || 1,
                    repeticoes: item.repeticoes || 1,
                    carga_kg: item.carga_kg ?? "",
                  };

                  return (
                    <div key={item.id} style={exerciseCard}>
                      <div style={exerciseCardHeader}>
                        <div>
                          <strong style={{ color: "#102b46", fontSize: 15 }}>
                            {item.exercicio?.nome}
                          </strong>

                          <p
                            style={{
                              margin: "3px 0 0",
                              color: "#7b8794",
                              fontSize: 12,
                            }}
                          >
                            {item.exercicio?.musculo_alvo}
                          </p>
                        </div>

                        <button
                          onClick={() => removerExercicio(item.id)}
                          style={dangerIconButton}
                        >
                          Remover
                        </button>
                      </div>

                      <div style={smallFormGrid}>
                        <div>
                          <label style={smallLabel}>Series</label>
                          <input
                            type="number"
                            min="1"
                            value={edicao.series}
                            onChange={(e) =>
                              atualizarEdicao(item.id, "series", e.target.value)
                            }
                            style={smallInput}
                          />
                        </div>

                        <div>
                          <label style={smallLabel}>Repeticoes</label>
                          <input
                            type="number"
                            min="1"
                            value={edicao.repeticoes}
                            onChange={(e) =>
                              atualizarEdicao(
                                item.id,
                                "repeticoes",
                                e.target.value,
                              )
                            }
                            style={smallInput}
                          />
                        </div>

                        <div>
                          <label style={smallLabel}>Carga (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={edicao.carga_kg}
                            onChange={(e) =>
                              atualizarEdicao(
                                item.id,
                                "carga_kg",
                                e.target.value,
                              )
                            }
                            placeholder="Opcional"
                            style={smallInput}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => salvarExercicioDaFicha(item.id)}
                        style={{ ...primaryButton, marginTop: 12 }}
                      >
                        Salvar exercicio
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={panelStyle}>
            <h2 style={subtituloStyle}>Adicionar exercicios</h2>

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exercicio..."
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <div style={catalogList}>
              {exerciciosFiltrados.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => selecionarExercicio(ex)}
                  style={{
                    ...catalogItem,
                    border:
                      exercicioSelecionado?.id === ex.id
                        ? "2px solid #d8a20d"
                        : "1px solid #edf1f5",
                    background:
                      exercicioSelecionado?.id === ex.id ? "#fff8e5" : "#fff",
                  }}
                >
                  <div>
                    <strong style={{ color: "#102b46", fontSize: 13 }}>
                      {ex.nome}
                    </strong>

                    <p
                      style={{
                        margin: "2px 0 0",
                        color: "#7b8794",
                        fontSize: 11,
                      }}
                    >
                      {ex.musculo_alvo}
                    </p>
                  </div>
                </button>
              ))}

              {exerciciosFiltrados.length === 0 && (
                <p style={{ color: "#7b8794", fontSize: 13 }}>
                  Nenhum exercicio disponivel.
                </p>
              )}
            </div>

            {exercicioSelecionado && (
              <div style={novoExercicioBox}>
                <h3 style={{ margin: "0 0 6px", color: "#102b46" }}>
                  {exercicioSelecionado.nome}
                </h3>

                <p
                  style={{ margin: "0 0 14px", color: "#7b8794", fontSize: 13 }}
                >
                  Defina como este exercicio entrara na ficha.
                </p>

                <div style={smallFormGrid}>
                  <div>
                    <label style={smallLabel}>Series</label>
                    <input
                      type="number"
                      min="1"
                      value={novoExercicio.series}
                      onChange={(e) =>
                        setNovoExercicio((prev) => ({
                          ...prev,
                          series: e.target.value,
                        }))
                      }
                      style={smallInput}
                    />
                  </div>

                  <div>
                    <label style={smallLabel}>Repeticoes</label>
                    <input
                      type="number"
                      min="1"
                      value={novoExercicio.repeticoes}
                      onChange={(e) =>
                        setNovoExercicio((prev) => ({
                          ...prev,
                          repeticoes: e.target.value,
                        }))
                      }
                      style={smallInput}
                    />
                  </div>

                  <div>
                    <label style={smallLabel}>Carga (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={novoExercicio.carga_kg}
                      onChange={(e) =>
                        setNovoExercicio((prev) => ({
                          ...prev,
                          carga_kg: e.target.value,
                        }))
                      }
                      placeholder="Opcional"
                      style={smallInput}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={adicionarExercicio}
                    style={primaryButton}
                  >
                    Adicionar a ficha
                  </button>

                  <button
                    type="button"
                    onClick={() => setExercicioSelecionado(null)}
                    style={secondaryButton}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
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
  padding: 22,
  boxShadow: "0 1px 6px rgba(16,43,70,0.08)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const contentGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 20,
};

const listaVertical = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const exerciseCard = {
  padding: 14,
  borderRadius: 10,
  background: "#f7f9fb",
  border: "1px solid #edf1f5",
};

const exerciseCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
};

const smallFormGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 8,
};

const labelStyle = {
  display: "block",
  color: "#102b46",
  fontWeight: 700,
  marginBottom: 6,
  fontSize: 13,
};

const smallLabel = {
  display: "block",
  color: "#7b8794",
  fontWeight: 800,
  marginBottom: 4,
  fontSize: 11,
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
  padding: "8px 10px",
  border: "1px solid #d9dee5",
  borderRadius: 7,
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

const dangerIconButton = {
  padding: "8px 10px",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  background: "#fff5f5",
  color: "#b91c1c",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 12,
};

const catalogList = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxHeight: 320,
  overflowY: "auto",
};

const catalogItem = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

const novoExercicioBox = {
  marginTop: 16,
  padding: 14,
  borderRadius: 10,
  border: "1px solid #edf1f5",
  background: "#f7f9fb",
};

const subtituloStyle = {
  margin: "0 0 14px",
  color: "#102b46",
  fontSize: 17,
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

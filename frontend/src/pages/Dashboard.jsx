import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";
const META_AGUA_ML = 2000;

function obterDataLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterUltimosDias(quantidade) {
  const dias = [];
  const hoje = new Date();

  for (let indice = quantidade - 1; indice >= 0; indice -= 1) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - indice);

    dias.push({
      data: formatarDataISO(data),
      label: data.toLocaleDateString("pt-BR", { weekday: "short" }),
    });
  }

  return dias;
}

function arredondar(valor, casas = 1) {
  return Number(valor || 0).toFixed(casas);
}

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");

  const [fichas, setFichas] = useState([]);
  const [treinoHoje, setTreinoHoje] = useState(null);
  const [treinosRealizados, setTreinosRealizados] = useState([]);
  const [resumoDia, setResumoDia] = useState(null);
  const [aguaHistorico, setAguaHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const dataHoje = obterDataLocal();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    setCarregando(true);
    setErro("");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        resFichas,
        resTreinoHoje,
        resTreinos,
        resResumoDia,
        resAguaHistorico,
      ] = await Promise.all([
        fetch(`${API_URL}/fichas`, { headers }),
        fetch(`${API_URL}/fichas/treino-do-dia`, { headers }),
        fetch(`${API_URL}/treinos-realizados`, { headers }),
        fetch(`${API_URL}/dashboard/${usuario.id}?data=${dataHoje}`, {
          headers,
        }),
        fetch(`${API_URL}/agua`, { headers }),
      ]);

      if (resFichas.ok) {
        const data = await resFichas.json();
        setFichas(Array.isArray(data) ? data : []);
      }

      if (resTreinoHoje.ok) {
        const data = await resTreinoHoje.json();
        setTreinoHoje(data);
      }

      if (resTreinos.ok) {
        const data = await resTreinos.json();
        setTreinosRealizados(Array.isArray(data) ? data : []);
      }

      if (resResumoDia.ok) {
        const data = await resResumoDia.json();
        setResumoDia(data);
      }

      if (resAguaHistorico.ok) {
        const data = await resAguaHistorico.json();
        setAguaHistorico(Array.isArray(data.registros) ? data.registros : []);
      }
    } catch (error) {
      setErro("Não foi possível carregar os dados do dashboard.");
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setCarregando(false);
    }
  };

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const treinosEsteMes = treinosRealizados.filter((treino) => {
    const data = new Date(treino.data);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  }).length;

  const calcularSequencia = () => {
    const datas = new Set(treinosRealizados.map((treino) => treino.data));
    let sequencia = 0;
    const dataAtual = new Date();

    while (true) {
      const dataFormatada = dataAtual.toISOString().split("T")[0];

      if (!datas.has(dataFormatada)) break;

      sequencia += 1;
      dataAtual.setDate(dataAtual.getDate() - 1);
    }

    return sequencia;
  };

  const dadosTreinoSemana = useMemo(() => {
    const ultimosDias = obterUltimosDias(7);

    return ultimosDias.map((dia) => {
      const total = treinosRealizados.filter(
        (treino) => treino.data === dia.data && treino.concluido,
      ).length;

      return {
        ...dia,
        total,
      };
    });
  }, [treinosRealizados]);

  const dadosAguaSemana = useMemo(() => {
    const ultimosDias = obterUltimosDias(7);

    return ultimosDias.map((dia) => {
      const total = aguaHistorico
        .filter((registro) => registro.data === dia.data)
        .reduce(
          (soma, registro) => soma + Number(registro.quantidade_ml || 0),
          0,
        );

      return {
        ...dia,
        total,
      };
    });
  }, [aguaHistorico]);

  const dieta = resumoDia?.dieta || {};
  const agua = resumoDia?.agua || {};
  const suplementos = resumoDia?.suplementos || {};
  const treinoResumo = resumoDia?.treino || {};

  const totalExerciciosHoje = treinoHoje?.ficha_exercicio?.length || 0;
  const sequencia = calcularSequencia();
  const percentualAgua = Math.min(
    ((Number(agua.total_ml) || 0) / META_AGUA_ML) * 100,
    100,
  );

  const suplementosDoDia = suplementos.registros || [];
  const refeicoesDoDia = dieta.refeicoes || [];

  const treinoDoDiaTexto = useMemo(() => {
    if (carregando) return "...";

    if (treinoResumo.concluidos > 0) {
      return `${treinoResumo.concluidos}`;
    }

    return totalExerciciosHoje;
  }, [carregando, treinoResumo.concluidos, totalExerciciosHoje]);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Sidebar />

      <main style={{ marginLeft: 240, padding: "32px 30px" }}>
        <header style={cabecalho}>
          <div>
            <h1 style={titulo}>
              Olá, {usuario?.nome?.split(" ")[0] || "usuário"}!
            </h1>

            <p style={subtitulo}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            style={{
              ...botaoSecundario,
              opacity: carregando ? 0.7 : 1,
              cursor: carregando ? "not-allowed" : "pointer",
            }}
            onClick={carregarDashboard}
            disabled={carregando}
          >
            {carregando ? "Atualizando..." : "Atualizar"}
          </button>
        </header>

        {erro && <div style={alertaErro}>{erro}</div>}

        <section style={cardsGrid}>
          <Card
            label="Treinos este mês"
            value={carregando ? "..." : treinosEsteMes}
            detail={`${fichas.length} ficha${fichas.length === 1 ? "" : "s"} criada${fichas.length === 1 ? "" : "s"}`}
          />

          <Card
            label="Treino de hoje"
            value={treinoDoDiaTexto}
            detail={
              treinoResumo.concluidos > 0
                ? "treinos concluídos hoje"
                : "exercícios planejados"
            }
          />

          <Card
            label="Dieta"
            value={carregando ? "..." : `${arredondar(dieta.calorias, 0)} kcal`}
            detail={`${arredondar(dieta.proteinas_g)}g prot · ${arredondar(
              dieta.carboidratos_g,
            )}g carb · ${arredondar(dieta.gorduras_g)}g gord`}
          />

          <Card
            label="Água"
            value={carregando ? "..." : `${agua.total_ml || 0} ml`}
            detail={`Meta: ${META_AGUA_ML} ml`}
          />
        </section>

        <section style={conteudoGrid}>
          <div style={painel}>
            <h2 style={painelTitulo}>Treino de hoje</h2>

            {carregando && <LoadingState mensagem="Carregando treino..." />}

            {!carregando && !treinoHoje && (
              <>
                <p style={textoCinza}>
                  Nenhuma ficha foi encontrada para hoje.
                </p>

                <button
                  style={botaoPrimario}
                  onClick={() => navigate("/criar-ficha")}
                >
                  Criar ficha
                </button>
              </>
            )}

            {!carregando && treinoHoje && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ margin: 0, color: "#102b46" }}>
                    {treinoHoje.nome}
                  </h3>

                  <p style={textoCinza}>
                    {totalExerciciosHoje} exercício
                    {totalExerciciosHoje === 1 ? "" : "s"} para hoje
                  </p>
                </div>

                {treinoHoje.ficha_exercicio?.slice(0, 4).map((item) => (
                  <div key={item.id} style={linhaTreino}>
                    <div>
                      <strong style={{ color: "#102b46" }}>
                        {item.exercicio?.nome}
                      </strong>

                      <p style={{ margin: "3px 0 0", color: "#6b7280" }}>
                        {item.series}x{item.repeticoes}
                        {item.carga_kg ? ` - ${item.carga_kg} kg` : ""}
                      </p>
                    </div>

                    <span style={tagMusculo}>
                      {item.exercicio?.musculo_alvo || "Treino"}
                    </span>
                  </div>
                ))}

                <button
                  style={botaoPrimario}
                  onClick={() => navigate("/treino-do-dia")}
                >
                  Iniciar treino
                </button>
              </>
            )}
          </div>

          <div style={painel}>
            <h2 style={painelTitulo}>Macros e suplementos</h2>

            <ResumoLinha
              label="Calorias do dia"
              valor={`${arredondar(dieta.calorias, 0)} kcal`}
            />
            <ResumoLinha
              label="Proteínas"
              valor={`${arredondar(dieta.proteinas_g)} g`}
            />
            <ResumoLinha
              label="Carboidratos"
              valor={`${arredondar(dieta.carboidratos_g)} g`}
            />
            <ResumoLinha
              label="Gorduras"
              valor={`${arredondar(dieta.gorduras_g)} g`}
            />
            <ResumoLinha
              label="Suplementos"
              valor={suplementos.total_registros || 0}
            />

            <button
              style={{ ...botaoSecundario, marginTop: 18 }}
              onClick={() => navigate(`/dieta?data=${dataHoje}`)}
            >
              Abrir diário de dieta
            </button>
          </div>

          <div style={painel}>
            <h2 style={painelTitulo}>Treinos concluídos na última semana</h2>

            <GraficoBarras
              dados={dadosTreinoSemana}
              valorMaximo={Math.max(
                1,
                ...dadosTreinoSemana.map((item) => item.total),
              )}
              cor="#d8a20d"
              sufixo=""
            />
          </div>

          <div style={painel}>
            <h2 style={painelTitulo}>Consumo de água na última semana</h2>

            <GraficoBarras
              dados={dadosAguaSemana}
              valorMaximo={META_AGUA_ML}
              cor="#2b8fd8"
              sufixo="ml"
            />
          </div>

          <div style={painel}>
            <h2 style={painelTitulo}>Água do dia</h2>

            <div style={aguaResumo}>
              <strong style={aguaValor}>{agua.total_ml || 0} ml</strong>
              <span style={textoCinza}>de {META_AGUA_ML} ml</span>
            </div>

            <div style={barraFundo}>
              <div
                style={{ ...barraPreenchida, width: `${percentualAgua}%` }}
              />
            </div>

            <p style={textoCinza}>
              {agua.total_registros || 0} registro
              {(agua.total_registros || 0) === 1 ? "" : "s"} de água hoje.
            </p>

            <button
              style={botaoSecundario}
              onClick={() => navigate(`/dieta?data=${dataHoje}`)}
            >
              Registrar água
            </button>
          </div>

          <div style={painel}>
            <h2 style={painelTitulo}>Resumo do dia</h2>

            <ResumoLinha
              label="Refeições registradas"
              valor={dieta.total_refeicoes || 0}
            />
            <ResumoLinha
              label="Suplementos registrados"
              valor={suplementos.total_registros || 0}
            />
            <ResumoLinha
              label="Treinos concluídos"
              valor={treinoResumo.concluidos || 0}
            />
            <ResumoLinha label="Sequência atual" valor={`${sequencia} dias`} />

            {refeicoesDoDia.length > 0 && (
              <div style={listaCompacta}>
                {refeicoesDoDia.slice(0, 3).map((refeicao) => (
                  <div key={refeicao.id} style={itemCompacto}>
                    <strong>{refeicao.nome || refeicao.tipo}</strong>
                    <span>{arredondar(refeicao.calorias, 0)} kcal</span>
                  </div>
                ))}
              </div>
            )}

            {suplementosDoDia.length > 0 && (
              <div style={listaCompacta}>
                {suplementosDoDia.slice(0, 3).map((suplemento) => (
                  <div key={suplemento.id} style={itemCompacto}>
                    <strong>{suplemento.nome}</strong>
                    <span>{suplemento.horario?.slice(0, 5) || "--:--"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({ label, value, detail }) {
  return (
    <div style={card}>
      <p style={cardLabel}>{label}</p>
      <strong style={cardValue}>{value}</strong>
      <p style={cardDetail}>{detail}</p>
    </div>
  );
}

function ResumoLinha({ label, valor }) {
  return (
    <div style={resumoLinha}>
      <span>{label}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function GraficoBarras({ dados, valorMaximo, cor, sufixo }) {
  return (
    <div style={grafico}>
      {dados.map((item) => {
        const altura = Math.max(
          (item.total / valorMaximo) * 100,
          item.total > 0 ? 8 : 0,
        );

        return (
          <div key={item.data} style={barraItem}>
            <div style={barraArea}>
              <div
                title={`${item.total} ${sufixo}`}
                style={{
                  ...barraVertical,
                  height: `${altura}%`,
                  background: cor,
                }}
              />
            </div>

            <strong style={barraValor}>
              {item.total}
              {sufixo ? ` ${sufixo}` : ""}
            </strong>

            <span style={barraLabel}>{item.label.replace(".", "")}</span>
          </div>
        );
      })}
    </div>
  );
}

const cabecalho = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 26,
};

const titulo = {
  margin: 0,
  color: "#102b46",
  fontSize: 28,
  fontWeight: 800,
};

const subtitulo = {
  margin: "6px 0 0",
  color: "#7b8794",
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
  gap: 16,
  marginBottom: 26,
};

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "20px 20px",
};

const cardLabel = {
  margin: "0 0 8px",
  color: "#6b7280",
  fontSize: 14,
  textTransform: "uppercase",
};

const cardValue = {
  display: "block",
  color: "#0b3764",
  fontSize: 30,
  lineHeight: 1,
};

const cardDetail = {
  margin: "8px 0 0",
  color: "#d99a00",
  fontSize: 13,
};

const conteudoGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};

const painel = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 22,
};

const painelTitulo = {
  margin: "0 0 18px",
  color: "#102b46",
  fontSize: 20,
};

const textoCinza = {
  color: "#6b7280",
  margin: "4px 0 16px",
};

const linhaTreino = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #edf1f5",
  padding: "12px 0",
};

const tagMusculo = {
  background: "#e7f1fb",
  color: "#0b5da8",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 700,
};

const resumoLinha = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "1px solid #edf1f5",
  padding: "12px 0",
  color: "#374151",
};

const aguaResumo = {
  display: "flex",
  alignItems: "baseline",
  gap: 10,
  marginBottom: 14,
};

const aguaValor = {
  color: "#0b3764",
  fontSize: 32,
};

const barraFundo = {
  height: 10,
  borderRadius: 999,
  background: "#e7edf3",
  overflow: "hidden",
  marginBottom: 14,
};

const barraPreenchida = {
  height: "100%",
  borderRadius: 999,
  background: "#2b8fd8",
};

const grafico = {
  height: 220,
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 12,
  alignItems: "end",
};

const barraItem = {
  minWidth: 0,
  display: "grid",
  gridTemplateRows: "1fr auto auto",
  gap: 8,
  alignItems: "end",
  height: "100%",
  textAlign: "center",
};

const barraArea = {
  height: 130,
  display: "flex",
  alignItems: "end",
  justifyContent: "center",
  borderRadius: 8,
  background: "#f3f6f9",
  overflow: "hidden",
};

const barraVertical = {
  width: "60%",
  minHeight: 0,
  borderRadius: "8px 8px 0 0",
  transition: "height 0.2s",
};

const barraValor = {
  color: "#102b46",
  fontSize: 12,
  minHeight: 16,
};

const barraLabel = {
  color: "#7b8794",
  fontSize: 12,
  textTransform: "capitalize",
};

const listaCompacta = {
  marginTop: 14,
  display: "grid",
  gap: 8,
};

const itemCompacto = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "9px 10px",
  border: "1px solid #edf1f5",
  borderRadius: 8,
  color: "#102b46",
  background: "#fbfcfd",
  fontSize: 13,
};

const alertaErro = {
  marginBottom: 16,
  padding: "11px 14px",
  border: "1px solid #f0c4c4",
  borderRadius: 8,
  background: "#fff4f4",
  color: "#b42318",
};

const botaoPrimario = {
  marginTop: 18,
  padding: "11px 20px",
  border: 0,
  borderRadius: 8,
  background: "#d8a20d",
  color: "#102b46",
  fontWeight: 800,
  cursor: "pointer",
};

const botaoSecundario = {
  padding: "11px 20px",
  border: "1px solid #d9dee5",
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontWeight: 700,
  cursor: "pointer",
};

export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");

  const [fichas, setFichas] = useState([]);
  const [treinoHoje, setTreinoHoje] = useState(null);
  const [treinosRealizados, setTreinosRealizados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    setCarregando(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resFichas, resTreinoHoje, resTreinos] = await Promise.all([
        fetch(`${API_URL}/fichas`, { headers }),
        fetch(`${API_URL}/fichas/treino-do-dia`, { headers }),
        fetch(`${API_URL}/treinos-realizados`, { headers }),
      ]);

      if (resFichas.ok) {
        const data = await resFichas.json();
        setFichas(data);
      }

      if (resTreinoHoje.ok) {
        const data = await resTreinoHoje.json();
        setTreinoHoje(data);
      }

      if (resTreinos.ok) {
        const data = await resTreinos.json();
        setTreinosRealizados(data);
      }
    } catch (error) {
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

  const totalExerciciosHoje = treinoHoje?.ficha_exercicio?.length || 0;
  const sequencia = calcularSequencia();

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Sidebar />

      <main style={{ marginLeft: 240, padding: "32px 30px" }}>
        <header style={{ marginBottom: 26 }}>
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
        </header>

        <section style={cardsGrid}>
          <Card
            label="Treinos este mês"
            value={carregando ? "..." : treinosEsteMes}
            detail={`${fichas.length} ficha${fichas.length === 1 ? "" : "s"} criada${fichas.length === 1 ? "" : "s"}`}
          />

          <Card
            label="Treino de hoje"
            value={carregando ? "..." : totalExerciciosHoje}
            detail="exercícios planejados"
          />

          <Card
            label="Sequência"
            value={carregando ? "..." : `${sequencia} dias`}
            detail="treinos consecutivos"
          />

          <Card label="Dieta" value="Em breve" detail="calorias e macros" />
        </section>

        <section style={conteudoGrid}>
          <div style={painel}>
            <h2 style={painelTitulo}>Treino de hoje</h2>

            {carregando && <p style={textoCinza}>Carregando treino...</p>}

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
            <h2 style={painelTitulo}>Resumo do projeto</h2>

            <ResumoLinha label="Fichas criadas" valor={fichas.length} />
            <ResumoLinha
              label="Treinos registrados"
              valor={treinosRealizados.length}
            />
            <ResumoLinha label="Treinos neste mês" valor={treinosEsteMes} />
            <ResumoLinha label="Sequência atual" valor={`${sequencia} dias`} />

            <button
              style={{ ...botaoSecundario, marginTop: 18 }}
              onClick={() => navigate("/meus-treinos")}
            >
              Ver meus treinos
            </button>
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

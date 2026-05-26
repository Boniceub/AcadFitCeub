import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditarFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [exercicios, setExercicios] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarDados();
  }, [id]);

  const buscarDados = async () => {
    setCarregando(true);
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
      setFicha(dataF);
      setNome(dataF.nome);
      setDiaSemana(dataF.dia_semana || "");
      setExercicios(dataE);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const salvarFicha = async () => {
    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
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

  const adicionarExercicio = async (ex) => {
    try {
      const res = await fetch(`${API_URL}/fichas/${id}/exercicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exercicio_id: ex.id,
          series: 3,
          repeticoes: 10,
          carga_kg: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);
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
          <p style={{ color: "#888" }}>Carregando...</p>
        </main>
      </div>
    );
  }

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
              Editar Ficha
            </h1>
            <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
              Ajuste nome, dia e exercícios da ficha.
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
              style={{ ...primaryButton, opacity: salvando ? 0.7 : 1 }}
            >
              {salvando ? "Salvando..." : "Salvar ficha"}
            </button>
          </div>
        </header>

        {sucesso && <div style={alertaSucesso}>✓ {sucesso}</div>}
        {erro && <div style={alertaErro}>{erro}</div>}

        <section style={panelStyle}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
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

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 20,
          }}
        >
          <div style={panelStyle}>
            <h2 style={{ margin: "0 0 14px", color: "#102b46", fontSize: 17 }}>
              Exercícios na ficha
            </h2>
            {ficha?.ficha_exercicio?.length === 0 ? (
              <p style={{ color: "#7b8794", fontSize: 14 }}>
                Nenhum exercício adicionado ainda.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {ficha?.ficha_exercicio?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "#f7f9fb",
                      border: "1px solid #edf1f5",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#102b46", fontSize: 14 }}>
                        {item.exercicio?.nome}
                      </strong>
                      <p
                        style={{
                          margin: "2px 0 0",
                          color: "#7b8794",
                          fontSize: 12,
                        }}
                      >
                        {item.series}x{item.repeticoes}
                        {item.carga_kg ? ` — ${item.carga_kg} kg` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removerExercicio(item.id)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "#b91c1c",
                        cursor: "pointer",
                        fontSize: 20,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={panelStyle}>
            <h2 style={{ margin: "0 0 14px", color: "#102b46", fontSize: 17 }}>
              Adicionar exercícios
            </h2>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exercício..."
              style={{ ...inputStyle, marginBottom: 12 }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {exerciciosFiltrados.map((ex) => (
                <div
                  key={ex.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #edf1f5",
                    background: "#fff",
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
                  <button
                    onClick={() => adicionarExercicio(ex)}
                    style={{
                      padding: "6px 12px",
                      border: 0,
                      borderRadius: 6,
                      background: "#d8a20d",
                      color: "#102b46",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    + Adicionar
                  </button>
                </div>
              ))}
              {exerciciosFiltrados.length === 0 && (
                <p style={{ color: "#7b8794", fontSize: 13 }}>
                  Nenhum exercício disponível.
                </p>
              )}
            </div>
          </div>
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
const alertaErro = {
  background: "#fff0f0",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  padding: "10px 16px",
  marginBottom: 16,
  color: "#cc0000",
  fontSize: 14,
};

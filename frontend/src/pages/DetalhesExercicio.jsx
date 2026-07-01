import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";

const COR_TIPO = {
  Máquina: "#dbeafe",
  Halter: "#fef9c3",
  Cabo: "#ede9fe",
  "Peso Corporal": "#dcfce7",
};

export default function DetalhesExercicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercicio, setExercicio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await fetch(`${API_URL}/exercicios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || "Exercício não encontrado.");
        setExercicio(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    buscar();
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: "32px 36px" }}>
        <button
          onClick={() => navigate("/catalogo")}
          style={{
            marginBottom: 24,
            padding: "10px 18px",
            border: "1px solid #d9dee5",
            borderRadius: 8,
            background: "#fff",
            color: "#102b46",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← Voltar ao Catálogo
        </button>

        {carregando && <LoadingState mensagem="Carregando exercicio..." />}
        {erro && <p style={{ color: "red" }}>{erro}</p>}

        {exercicio && (
          <div style={{ maxWidth: 600 }}>
            <div
              style={{
                background: COR_TIPO[exercicio.tipo] || "#e5f1fb",
                borderRadius: 16,
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                color: "#1a4168",
                marginBottom: 24,
              }}
            >
              {exercicio.tipo}
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#102b46",
                marginBottom: 8,
              }}
            >
              {exercicio.nome}
            </h1>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <span
                style={{
                  background: "#e2f1ff",
                  color: "#075985",
                  padding: "4px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {exercicio.tipo}
              </span>
              <span
                style={{
                  background: "#fff8e8",
                  color: "#c9a84c",
                  padding: "4px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {exercicio.musculo_alvo}
              </span>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  color: "#888",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Informações
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f0f0f0",
                  paddingBottom: 12,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 14, color: "#888" }}>
                  Músculo alvo
                </span>
                <span
                  style={{ fontSize: 14, color: "#102b46", fontWeight: 700 }}
                >
                  {exercicio.musculo_alvo}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#888" }}>Equipamento</span>
                <span
                  style={{ fontSize: 14, color: "#102b46", fontWeight: 700 }}
                >
                  {exercicio.tipo}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/catalogo")}
              style={{
                padding: "12px 24px",
                background: "#1a4168",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ← Voltar ao Catálogo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

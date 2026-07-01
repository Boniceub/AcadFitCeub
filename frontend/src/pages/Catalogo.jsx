import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingState from "../components/LoadingState";

const API_URL = "http://localhost:3000";

const CATEGORIAS = ["Todos", "Máquina", "Halter", "Cabo", "Peso Corporal"];

const COR_TIPO = {
  Máquina: "#dbeafe",
  Halter: "#fef9c3",
  Cabo: "#ede9fe",
  "Peso Corporal": "#dcfce7",
};

export default function Catalogo() {
  const navigate = useNavigate();
  const [exercicios, setExercicios] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    buscarExercicios();
  }, [categoriaSelecionada]);

  const buscarExercicios = async () => {
    setCarregando(true);
    setErro("");
    try {
      const params =
        categoriaSelecionada !== "Todos"
          ? `?tipo=${encodeURIComponent(categoriaSelecionada)}`
          : "";
      const res = await fetch(`${API_URL}/exercicios${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao buscar exercícios.");
      setExercicios(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
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
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              color: "#102b46",
              fontWeight: 800,
            }}
          >
            Catálogo de Exercícios
          </h1>
          <p style={{ margin: "6px 0 0", color: "#7b8794" }}>
            Encontre exercícios e adicione às suas fichas de treino.
          </p>
        </header>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar exercício..."
          style={{
            width: "100%",
            padding: "14px 18px",
            border: "1px solid #d9dee5",
            borderRadius: 10,
            background: "#fff",
            color: "#102b46",
            marginBottom: 18,
            fontSize: 16,
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 9,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                padding: "8px 17px",
                borderRadius: 999,
                border: "1px solid #d9dee5",
                background: categoriaSelecionada === cat ? "#1a4168" : "#fff",
                color: categoriaSelecionada === cat ? "#fff" : "#102b46",
                cursor: "pointer",
                fontWeight: categoriaSelecionada === cat ? 700 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {carregando && <LoadingState mensagem="Carregando exercícios..." />}
        {erro && (
          <p style={{ color: "red", textAlign: "center", marginTop: 40 }}>
            {erro}
          </p>
        )}

        {!carregando && !erro && (
          <>
            {exerciciosFiltrados.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
                Nenhum exercício encontrado.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 20,
                }}
              >
                {exerciciosFiltrados.map((ex) => (
                  <article
                    key={ex.id}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 1px 6px rgba(16,43,70,0.08)",
                    }}
                  >
                    <div
                      style={{
                        height: 112,
                        background: COR_TIPO[ex.tipo] || "#e5f1fb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#1a4168",
                      }}
                    >
                      {ex.tipo}
                    </div>
                    <div style={{ padding: 18 }}>
                      <h3
                        style={{
                          margin: "0 0 4px",
                          color: "#102b46",
                          fontSize: 17,
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(`/catalogo/${ex.id}`)}
                      >
                        {ex.nome}
                      </h3>
                      <p
                        style={{
                          margin: "0 0 12px",
                          color: "#7b8794",
                          fontSize: 14,
                        }}
                      >
                        {ex.musculo_alvo}
                      </p>
                      <div
                        style={{ display: "flex", gap: 8, marginBottom: 14 }}
                      >
                        <span
                          style={{
                            padding: "4px 9px",
                            borderRadius: 999,
                            background: "#e2f1ff",
                            color: "#075985",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {ex.tipo}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/catalogo/${ex.id}`)}
                        style={{
                          width: "100%",
                          padding: 10,
                          border: 0,
                          borderRadius: 8,
                          background: "#d8a20d",
                          color: "#102b46",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        + Ver detalhes
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";

export default function DiarioDieta() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const hoje = new Date().toISOString().split("T")[0];

  const [refeicoes, setRefeicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState({
    nome: "",
    data: hoje,
    tipo: "cafe_da_manha",
    calorias: "",
    proteinas_g: "",
    carboidratos_g: "",
    gorduras_g: "",
    horario: "",
    observacoes: "",
  });

  useEffect(() => {
    buscarRefeicoes(form.data);
  }, []);

  const buscarRefeicoes = async (dataFiltro = form.data) => {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/refeicoes?data=${dataFiltro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao buscar refeições.");
      }

      setRefeicoes(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const totais = useMemo(() => {
    return refeicoes.reduce(
      (acc, refeicao) => {
        acc.calorias += Number(refeicao.calorias || 0);
        acc.proteinas_g += Number(refeicao.proteinas_g || 0);
        acc.carboidratos_g += Number(refeicao.carboidratos_g || 0);
        acc.gorduras_g += Number(refeicao.gorduras_g || 0);
        return acc;
      },
      {
        calorias: 0,
        proteinas_g: 0,
        carboidratos_g: 0,
        gorduras_g: 0,
      },
    );
  }, [refeicoes]);

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const salvarRefeicao = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!form.data || !form.tipo) {
      setErro("Data e tipo são obrigatórios.");
      return;
    }

    setSalvando(true);

    try {
      const res = await fetch(`${API_URL}/refeicoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          calorias: Number(form.calorias || 0),
          proteinas_g: Number(form.proteinas_g || 0),
          carboidratos_g: Number(form.carboidratos_g || 0),
          gorduras_g: Number(form.gorduras_g || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao cadastrar refeição.");
      }

      setSucesso("Refeição registrada com sucesso!");
      setForm((prev) => ({
        ...prev,
        nome: "",
        calorias: "",
        proteinas_g: "",
        carboidratos_g: "",
        gorduras_g: "",
        horario: "",
        observacoes: "",
      }));

      buscarRefeicoes(form.data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const deletarRefeicao = async (id) => {
    const confirmar = window.confirm("Deseja remover esta refeição?");
    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      const res = await fetch(`${API_URL}/refeicoes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao remover refeição.");
      }

      setSucesso("Refeição removida com sucesso!");
      buscarRefeicoes(form.data);
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar />

      <main style={{ marginLeft: 240, padding: "32px 36px" }}>
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Diário de Dieta</h1>
            <p style={subtitleStyle}>
              Registre refeições e acompanhe seus macros do dia.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/suplementos")}
            style={secondaryButton}
          >
            Suplementos
          </button>
        </header>

        <section style={cardsGrid}>
          <ResumoCard label="Calorias" valor={totais.calorias} sufixo="kcal" />
          <ResumoCard label="Proteínas" valor={totais.proteinas_g} sufixo="g" />
          <ResumoCard
            label="Carboidratos"
            valor={totais.carboidratos_g}
            sufixo="g"
          />
          <ResumoCard label="Gorduras" valor={totais.gorduras_g} sufixo="g" />
        </section>

        {erro && <div style={alertError}>{erro}</div>}
        {sucesso && <div style={alertSuccess}>{sucesso}</div>}

        <section style={contentGrid}>
          <form onSubmit={salvarRefeicao} style={panelStyle}>
            <h2 style={panelTitle}>Nova refeição</h2>

            <div style={fieldGroup}>
              <label style={labelStyle}>Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => {
                  atualizarCampo("data", e.target.value);
                  buscarRefeicoes(e.target.value);
                }}
                style={inputStyle}
              />
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => atualizarCampo("tipo", e.target.value)}
                style={inputStyle}
              >
                <option value="cafe_da_manha">Café da manhã</option>
                <option value="almoco">Almoço</option>
                <option value="lanche">Lanche</option>
                <option value="jantar">Jantar</option>
                <option value="ceia">Ceia</option>
              </select>
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Nome</label>
              <input
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                placeholder="Ex: Café da manhã"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={fieldGroup}>
                <label style={labelStyle}>Calorias</label>
                <input
                  type="number"
                  min="0"
                  value={form.calorias}
                  onChange={(e) => atualizarCampo("calorias", e.target.value)}
                  placeholder="kcal"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Horário</label>
                <input
                  type="time"
                  value={form.horario}
                  onChange={(e) => atualizarCampo("horario", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <div style={fieldGroup}>
                <label style={labelStyle}>Proteínas</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.proteinas_g}
                  onChange={(e) =>
                    atualizarCampo("proteinas_g", e.target.value)
                  }
                  placeholder="g"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Carboidratos</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.carboidratos_g}
                  onChange={(e) =>
                    atualizarCampo("carboidratos_g", e.target.value)
                  }
                  placeholder="g"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Gorduras</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.gorduras_g}
                  onChange={(e) => atualizarCampo("gorduras_g", e.target.value)}
                  placeholder="g"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => atualizarCampo("observacoes", e.target.value)}
                placeholder="Observações da refeição"
                style={{ ...inputStyle, minHeight: 84, resize: "vertical" }}
              />
            </div>

            <button type="submit" disabled={salvando} style={primaryButton}>
              {salvando ? "Salvando..." : "Registrar refeição"}
            </button>
          </form>

          <section style={panelStyle}>
            <h2 style={panelTitle}>Refeições do dia</h2>

            {carregando && <p style={emptyText}>Carregando refeições...</p>}

            {!carregando && refeicoes.length === 0 && (
              <p style={emptyText}>
                Nenhuma refeição registrada para esta data.
              </p>
            )}

            {!carregando &&
              refeicoes.map((refeicao) => (
                <div key={refeicao.id} style={mealItem}>
                  <div>
                    <strong style={{ color: "#102b46" }}>
                      {refeicao.nome || formatarTipo(refeicao.tipo)}
                    </strong>

                    <p style={mealMeta}>
                      {formatarTipo(refeicao.tipo)}
                      {refeicao.horario ? ` - ${refeicao.horario}` : ""}
                    </p>

                    <p style={mealMeta}>
                      {Number(refeicao.calorias || 0)} kcal |{" "}
                      {Number(refeicao.proteinas_g || 0)}g prot |{" "}
                      {Number(refeicao.carboidratos_g || 0)}g carb |{" "}
                      {Number(refeicao.gorduras_g || 0)}g gord
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deletarRefeicao(refeicao.id)}
                    style={dangerButton}
                  >
                    Remover
                  </button>
                </div>
              ))}
          </section>
        </section>
      </main>
    </div>
  );
}

function ResumoCard({ label, valor, sufixo }) {
  return (
    <div style={cardStyle}>
      <p style={cardLabel}>{label}</p>
      <strong style={cardValue}>
        {Number(valor || 0).toFixed(label === "Calorias" ? 0 : 1)}
      </strong>
      <p style={cardDetail}>{sufixo}</p>
    </div>
  );
}

function formatarTipo(tipo) {
  const tipos = {
    cafe_da_manha: "Café da manhã",
    almoco: "Almoço",
    lanche: "Lanche",
    jantar: "Jantar",
    ceia: "Ceia",
  };

  return tipos[tipo] || tipo;
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
};

const titleStyle = {
  margin: 0,
  fontSize: 28,
  color: "#102b46",
  fontWeight: 800,
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#7b8794",
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
  gap: 16,
  marginBottom: 20,
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 18,
};

const cardLabel = {
  margin: "0 0 8px",
  color: "#6b7280",
  fontSize: 13,
  textTransform: "uppercase",
};

const cardValue = {
  display: "block",
  color: "#0b3764",
  fontSize: 28,
  lineHeight: 1,
};

const cardDetail = {
  margin: "6px 0 0",
  color: "#d99a00",
  fontSize: 13,
};

const contentGrid = {
  display: "grid",
  gridTemplateColumns: "420px 1fr",
  gap: 20,
  alignItems: "start",
};

const panelStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 22,
};

const panelTitle = {
  margin: "0 0 18px",
  color: "#102b46",
  fontSize: 20,
};

const fieldGroup = {
  marginBottom: 14,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  color: "#374151",
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d9dee5",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  color: "#102b46",
  background: "#fff",
};

const primaryButton = {
  width: "100%",
  padding: "12px 18px",
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
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontWeight: 800,
  cursor: "pointer",
};

const dangerButton = {
  padding: "9px 12px",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  background: "#fff5f5",
  color: "#cc0000",
  fontWeight: 700,
  cursor: "pointer",
};

const alertError = {
  background: "#fff0f0",
  border: "1px solid #ffcccc",
  borderRadius: 8,
  padding: "10px 14px",
  marginBottom: 16,
  color: "#cc0000",
};

const alertSuccess = {
  background: "#f0fff4",
  border: "1px solid #b2f5c8",
  borderRadius: 8,
  padding: "10px 14px",
  marginBottom: 16,
  color: "#276749",
};

const mealItem = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 0",
  borderBottom: "1px solid #edf1f5",
};

const mealMeta = {
  margin: "4px 0 0",
  color: "#6b7280",
  fontSize: 13,
};

const emptyText = {
  margin: 0,
  color: "#6b7280",
};

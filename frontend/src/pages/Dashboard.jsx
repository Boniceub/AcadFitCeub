import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: "#1a2f4e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid #c9a84c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "#c9a84c",
            }}
          >
            AF
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>AcadFitCeub</span>
        </div>
        <div
          style={{
            padding: "16px 20px 6px",
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Menu
        </div>
        <div
          style={{
            padding: "12px 20px",
            fontSize: 13,
            background: "rgba(255,255,255,0.1)",
            borderLeft: "3px solid #c9a84c",
            color: "white",
          }}
        >
          🏠 Dashboard
        </div>
        <div
          style={{
            padding: "12px 20px",
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          💪 Meus Treinos
        </div>
        <div
          style={{
            padding: "12px 20px",
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          📋 Catálogo
        </div>
        <div
          style={{
            padding: "12px 20px",
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          🍎 Diário de Dieta
        </div>
        <div
          style={{
            marginTop: "auto",
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#c9a84c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#1a2f4e",
            }}
          >
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: "white" }}>{usuario?.nome}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, background: "#f4f6f9", padding: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1a2f4e",
            marginBottom: 4,
          }}
        >
          Olá, {usuario?.nome?.split(" ")[0]}!
        </h1>
        <p style={{ color: "#888", marginBottom: 24 }}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 24,
            border: "1px solid #eee",
            maxWidth: 500,
          }}
        >
          <p style={{ color: "#1a2f4e", fontWeight: 600, marginBottom: 8 }}>
            ✅ Login realizado com sucesso!
          </p>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            Você está autenticado. As demais funcionalidades serão desenvolvidas
            nas próximas sprints.
          </p>
          <button
            onClick={sair}
            style={{
              padding: "10px 20px",
              background: "#1a2f4e",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import { useLocation, useNavigate } from "react-router-dom";

const menuItem = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 24px",
  color: active ? "#fff" : "#c8d6e6",
  cursor: "pointer",
  fontSize: 14,
  background: active ? "rgba(255,255,255,0.12)" : "transparent",
  borderLeft: active ? "3px solid #d8a20d" : "3px solid transparent",
  transition: "all 0.2s",
});

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "D" },
  { label: "Meus Treinos", path: "/meus-treinos", icon: "T" },
  { label: "Catálogo", path: "/catalogo", icon: "C" },
  { label: "Diário de Dieta", path: "/dieta", icon: "N" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const inicial = usuario?.nome?.charAt(0).toUpperCase() || "?";

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 240,
        height: "100vh",
        background: "#1a4168",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', sans-serif",
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: "30px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              border: "2px solid #d8a20d",
              borderRadius: "50%",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#f6c21a",
            }}
          >
            AF
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
            AcadFitCeub
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, paddingTop: 18 }}>
        <p
          style={{
            color: "#9eb3c8",
            fontSize: 12,
            letterSpacing: 1,
            padding: "0 20px",
            margin: "0 0 10px",
            textTransform: "uppercase",
          }}
        >
          Menu
        </p>

        {navItems.map((item) => (
          <div
            key={item.path}
            style={menuItem(location.pathname === item.path)}
            onClick={() => navigate(item.path)}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  location.pathname === item.path
                    ? "#d8a20d"
                    : "rgba(255,255,255,0.08)",
                color: location.pathname === item.path ? "#102b46" : "#dbeafe",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
        ))}

        <p
          style={{
            color: "#9eb3c8",
            fontSize: 12,
            letterSpacing: 1,
            padding: "22px 20px 10px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Conta
        </p>
        <div style={menuItem(false)}>
          <span style={{ width: 22 }}>P</span>
          <span>Perfil</span>
        </div>
        <div style={menuItem(false)}>
          <span style={{ width: 22 }}>A</span>
          <span>Configurações</span>
        </div>
      </nav>

      <div
        style={{
          padding: "18px 20px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "#d8a20d",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            color: "#102b46",
          }}
        >
          {inicial}
        </div>
        <div>
          <p
            style={{ color: "#fff", fontSize: 14, margin: 0, fontWeight: 600 }}
          >
            {usuario?.nome || "Usuário"}
          </p>
          <button
            onClick={sair}
            style={{
              color: "#9eb3c8",
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

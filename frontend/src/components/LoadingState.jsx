export default function LoadingState({ mensagem = "Carregando..." }) {
  return (
    <div style={container}>
      <div style={spinner} />
      <span style={texto}>{mensagem}</span>
    </div>
  );
}

const container = {
  minHeight: 160,
  display: "grid",
  placeItems: "center",
  gap: 12,
  padding: 30,
  border: "1px solid #dfe5eb",
  borderRadius: 8,
  background: "#fff",
  color: "#778493",
  textAlign: "center",
};

const spinner = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "4px solid #e3e9ef",
  borderTopColor: "#d8a20d",
  animation: "spin 0.9s linear infinite",
};

const texto = {
  color: "#415365",
  fontWeight: 700,
};

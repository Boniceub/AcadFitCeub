import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const dataHoje = () => new Date().toISOString().split("T")[0];

function Suplementos() {
  const navigate = useNavigate();

  const [suplementos, setSuplementos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(dataHoje());
  const [editandoId, setEditandoId] = useState(null);

  const [formulario, setFormulario] = useState({
    nome: "",
    dosagem: "",
    horario: "",
    data: dataHoje(),
    observacoes: "",
  });

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const suplementosOrdenados = useMemo(() => {
    return [...suplementos].sort((a, b) => {
      const horarioA = a.horario || "99:99";
      const horarioB = b.horario || "99:99";
      return horarioA.localeCompare(horarioB);
    });
  }, [suplementos]);

  const totalSuplementos = suplementos.length;

  const proximosHorarios = useMemo(() => {
    return suplementosOrdenados.filter((suplemento) => suplemento.horario);
  }, [suplementosOrdenados]);

  const limparFormulario = () => {
    setFormulario({
      nome: "",
      dosagem: "",
      horario: "",
      data: dataSelecionada,
      observacoes: "",
    });
    setEditandoId(null);
  };

  const buscarSuplementos = async () => {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(
        `${API_URL}/suplementos?data=${dataSelecionada}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao buscar suplementos.");
      }

      setSuplementos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    buscarSuplementos();
  }, [dataSelecionada]);

  useEffect(() => {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      data: dataSelecionada,
    }));
  }, [dataSelecionada]);

  const alterarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  };

  const salvarSuplemento = async (evento) => {
    evento.preventDefault();

    if (!formulario.nome.trim()) {
      setErro("Informe o nome do suplemento.");
      return;
    }

    if (!formulario.dosagem.trim()) {
      setErro("Informe a dosagem do suplemento.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      const url = editandoId
        ? `${API_URL}/suplementos/${editandoId}`
        : `${API_URL}/suplementos`;

      const metodo = editandoId ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers,
        body: JSON.stringify({
          nome: formulario.nome.trim(),
          dosagem: formulario.dosagem.trim(),
          horario: formulario.horario || null,
          data: formulario.data,
          observacoes: formulario.observacoes.trim() || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao salvar suplemento.");
      }

      setMensagem(
        editandoId
          ? "Suplemento atualizado com sucesso!"
          : "Suplemento registrado com sucesso!",
      );

      limparFormulario();
      buscarSuplementos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const prepararEdicao = (suplemento) => {
    setEditandoId(suplemento.id);
    setFormulario({
      nome: suplemento.nome || "",
      dosagem: suplemento.dosagem || "",
      horario: suplemento.horario ? suplemento.horario.slice(0, 5) : "",
      data: suplemento.data || dataSelecionada,
      observacoes: suplemento.observacoes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletarSuplemento = async (id) => {
    const confirmar = window.confirm("Deseja remover este suplemento?");
    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const resposta = await fetch(`${API_URL}/suplementos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao deletar suplemento.");
      }

      setMensagem("Suplemento removido com sucesso!");
      buscarSuplementos();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <main style={estilos.pagina}>
      <section style={estilos.cabecalho}>
        <div>
          <h1 style={estilos.titulo}>Suplementos</h1>
          <p style={estilos.subtitulo}>
            Registre seus suplementos, dosagens e horarios do dia.
          </p>
        </div>

        <button
          style={estilos.botaoSecundario}
          onClick={() => navigate("/dieta")}
        >
          Voltar ao diario
        </button>
      </section>

      <section style={estilos.cardsResumo}>
        <article style={estilos.cardResumo}>
          <span style={estilos.cardLabel}>Data</span>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(evento) => setDataSelecionada(evento.target.value)}
            style={estilos.inputData}
          />
        </article>

        <article style={estilos.cardResumo}>
          <span style={estilos.cardLabel}>Registros</span>
          <strong style={estilos.cardValor}>{totalSuplementos}</strong>
          <small style={estilos.cardDescricao}>suplementos no dia</small>
        </article>

        <article style={estilos.cardResumo}>
          <span style={estilos.cardLabel}>Proximos horarios</span>
          <strong style={estilos.cardValor}>{proximosHorarios.length}</strong>
          <small style={estilos.cardDescricao}>com horario definido</small>
        </article>
      </section>

      <section style={estilos.conteudo}>
        <form style={estilos.formulario} onSubmit={salvarSuplemento}>
          <div style={estilos.formCabecalho}>
            <div>
              <h2 style={estilos.subtituloBloco}>
                {editandoId ? "Editar suplemento" : "Novo suplemento"}
              </h2>
              <p style={estilos.textoApoio}>
                Preencha os dados para registrar o consumo.
              </p>
            </div>

            {editandoId && (
              <button
                type="button"
                style={estilos.botaoLimpar}
                onClick={limparFormulario}
              >
                Cancelar
              </button>
            )}
          </div>

          <label style={estilos.campo}>
            <span style={estilos.label}>Nome</span>
            <input
              type="text"
              name="nome"
              value={formulario.nome}
              onChange={alterarCampo}
              placeholder="Ex: Creatina"
              style={estilos.input}
            />
          </label>

          <label style={estilos.campo}>
            <span style={estilos.label}>Dosagem</span>
            <input
              type="text"
              name="dosagem"
              value={formulario.dosagem}
              onChange={alterarCampo}
              placeholder="Ex: 5g"
              style={estilos.input}
            />
          </label>

          <div style={estilos.linhaCampos}>
            <label style={estilos.campo}>
              <span style={estilos.label}>Horario</span>
              <input
                type="time"
                name="horario"
                value={formulario.horario}
                onChange={alterarCampo}
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>Data</span>
              <input
                type="date"
                name="data"
                value={formulario.data}
                onChange={alterarCampo}
                style={estilos.input}
              />
            </label>
          </div>

          <label style={estilos.campo}>
            <span style={estilos.label}>Observacoes</span>
            <textarea
              name="observacoes"
              value={formulario.observacoes}
              onChange={alterarCampo}
              placeholder="Ex: tomar depois do treino"
              style={estilos.textarea}
            />
          </label>

          {erro && <p style={estilos.erro}>{erro}</p>}
          {mensagem && <p style={estilos.sucesso}>{mensagem}</p>}

          <button
            type="submit"
            style={estilos.botaoPrincipal}
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : editandoId
                ? "Atualizar suplemento"
                : "Registrar suplemento"}
          </button>
        </form>

        <section style={estilos.lista}>
          <div style={estilos.listaCabecalho}>
            <div>
              <h2 style={estilos.subtituloBloco}>Registros do dia</h2>
              <p style={estilos.textoApoio}>
                Acompanhe os suplementos cadastrados para a data selecionada.
              </p>
            </div>
          </div>

          {carregando ? (
            <div style={estilos.estadoVazio}>Carregando suplementos...</div>
          ) : suplementosOrdenados.length === 0 ? (
            <div style={estilos.estadoVazio}>
              Nenhum suplemento registrado para esta data.
            </div>
          ) : (
            <div style={estilos.listaItens}>
              {suplementosOrdenados.map((suplemento) => (
                <article key={suplemento.id} style={estilos.item}>
                  <div style={estilos.itemHorario}>
                    {suplemento.horario
                      ? suplemento.horario.slice(0, 5)
                      : "--:--"}
                  </div>

                  <div style={estilos.itemConteudo}>
                    <strong style={estilos.itemTitulo}>
                      {suplemento.nome}
                    </strong>
                    <span style={estilos.itemDescricao}>
                      Dosagem: {suplemento.dosagem}
                    </span>

                    {suplemento.observacoes && (
                      <span style={estilos.itemObservacao}>
                        {suplemento.observacoes}
                      </span>
                    )}
                  </div>

                  <div style={estilos.itemAcoes}>
                    <button
                      type="button"
                      style={estilos.botaoEditar}
                      onClick={() => prepararEdicao(suplemento)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      style={estilos.botaoExcluir}
                      onClick={() => deletarSuplemento(suplemento.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    width: "100%",
    background: "#f1f5f9",
    color: "#102b46",
    padding: "28px 32px",
    boxSizing: "border-box",
  },
  cabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "28px",
  },
  titulo: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    color: "#082744",
  },
  subtitulo: {
    margin: "6px 0 0",
    color: "#728196",
    fontSize: "16px",
  },
  botaoSecundario: {
    border: "1px solid #d9e2ec",
    background: "#ffffff",
    color: "#082744",
    borderRadius: "8px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cardsResumo: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  cardResumo: {
    background: "#ffffff",
    border: "1px solid #dfe7ef",
    borderRadius: "8px",
    padding: "18px",
    minHeight: "112px",
    boxSizing: "border-box",
  },
  cardLabel: {
    display: "block",
    color: "#6f7f91",
    fontSize: "13px",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  cardValor: {
    display: "block",
    color: "#08345c",
    fontSize: "32px",
    lineHeight: 1,
  },
  cardDescricao: {
    display: "block",
    color: "#d99a00",
    marginTop: "10px",
    fontSize: "13px",
  },
  inputData: {
    width: "100%",
    border: "1px solid #d9e2ec",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    background: "#ffffff",
    color: "#102b46",
    colorScheme: "light",
    boxSizing: "border-box",
  },
  conteudo: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 420px) 1fr",
    gap: "20px",
    alignItems: "start",
  },
  formulario: {
    background: "#ffffff",
    border: "1px solid #dfe7ef",
    borderRadius: "8px",
    padding: "20px",
    boxSizing: "border-box",
  },
  formCabecalho: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
  },
  subtituloBloco: {
    margin: 0,
    color: "#082744",
    fontSize: "21px",
    fontWeight: 800,
  },
  textoApoio: {
    margin: "6px 0 0",
    color: "#728196",
    fontSize: "14px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  label: {
    color: "#42566f",
    fontSize: "13px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    border: "1px solid #d9e2ec",
    borderRadius: "8px",
    padding: "12px",
    background: "#ffffff",
    color: "#102b46",
    caretColor: "#102b46",
    colorScheme: "light",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: "92px",
    border: "1px solid #d9e2ec",
    borderRadius: "8px",
    padding: "12px",
    background: "#ffffff",
    color: "#102b46",
    caretColor: "#102b46",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },
  linhaCampos: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  botaoPrincipal: {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    background: "#dda20a",
    color: "#082744",
    padding: "13px 18px",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "6px",
  },
  botaoLimpar: {
    border: "1px solid #d9e2ec",
    background: "#ffffff",
    color: "#42566f",
    borderRadius: "8px",
    padding: "8px 12px",
    fontWeight: 700,
    cursor: "pointer",
    height: "38px",
  },
  erro: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },
  sucesso: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },
  lista: {
    background: "#ffffff",
    border: "1px solid #dfe7ef",
    borderRadius: "8px",
    padding: "20px",
    minHeight: "420px",
    boxSizing: "border-box",
  },
  listaCabecalho: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "18px",
  },
  listaItens: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    display: "grid",
    gridTemplateColumns: "72px 1fr auto",
    gap: "14px",
    alignItems: "center",
    border: "1px solid #e5edf5",
    borderRadius: "8px",
    padding: "14px",
    background: "#fbfdff",
  },
  itemHorario: {
    background: "#eaf2fb",
    color: "#08345c",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "center",
    fontWeight: 800,
  },
  itemConteudo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  itemTitulo: {
    color: "#082744",
    fontSize: "17px",
  },
  itemDescricao: {
    color: "#53677f",
    fontSize: "14px",
  },
  itemObservacao: {
    color: "#7c8da1",
    fontSize: "13px",
  },
  itemAcoes: {
    display: "flex",
    gap: "8px",
  },
  botaoEditar: {
    border: "1px solid #d9e2ec",
    background: "#ffffff",
    color: "#08345c",
    borderRadius: "8px",
    padding: "9px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  botaoExcluir: {
    border: "1px solid #fecaca",
    background: "#fff5f5",
    color: "#b91c1c",
    borderRadius: "8px",
    padding: "9px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  estadoVazio: {
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    padding: "32px",
    textAlign: "center",
    color: "#728196",
    background: "#f8fafc",
  },
};

export default Suplementos;

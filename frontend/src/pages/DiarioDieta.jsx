import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";
const META_AGUA_ML = 2000;

const REFEICOES_PADRAO = [
  { tipo: "cafe_da_manha", nome: "Café da manhã", simbolo: "☀" },
  { tipo: "almoco", nome: "Almoço", simbolo: "●" },
  { tipo: "jantar", nome: "Jantar", simbolo: "◐" },
  { tipo: "lanche", nome: "Lanches e outros", simbolo: "★" },
];

function obterDataLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function arredondar(valor, casas = 1) {
  return Number(valor || 0).toFixed(casas);
}

function calcularItem(item, campo) {
  const alimento = item.alimento;
  const porcao = Number(alimento?.porcao) || 100;
  const quantidade = Number(item.quantidade_g) || 0;

  return (Number(alimento?.[campo]) || 0) * (quantidade / porcao);
}

export default function DiarioDieta() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dataParametro = searchParams.get("data");
  const token = localStorage.getItem("token");

  const [dataSelecionada, setDataSelecionada] = useState(
    dataParametro || obterDataLocal(),
  );
  const [refeicoes, setRefeicoes] = useState([]);
  const [alimentos, setAlimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [aguaTotal, setAguaTotal] = useState(0);
  const [aguaRegistros, setAguaRegistros] = useState([]);
  const [quantidadeAgua, setQuantidadeAgua] = useState("");

  const [abertas, setAbertas] = useState({
    cafe_da_manha: true,
    almoco: true,
    jantar: false,
    lanche: false,
  });

  const [modal, setModal] = useState(null);
  const [busca, setBusca] = useState("");
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(100);

  const [criandoPersonalizada, setCriandoPersonalizada] = useState(false);
  const [nomePersonalizada, setNomePersonalizada] = useState("");

  const alterarDataSelecionada = (novaData) => {
    setDataSelecionada(novaData);
    setSearchParams({ data: novaData });
  };

  useEffect(() => {
    const dataDaUrl = dataParametro || obterDataLocal();

    setDataSelecionada((dataAtual) =>
      dataAtual === dataDaUrl ? dataAtual : dataDaUrl,
    );
  }, [dataParametro]);

  const requisicao = async (url, opcoes = {}) => {
    const resposta = await fetch(`${API_URL}${url}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opcoes.headers,
      },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Não foi possível concluir a operação.");
    }

    return dados;
  };

  const buscarRefeicoes = async (data) => {
    const dados = await requisicao(`/refeicoes?data=${data}`);
    setRefeicoes(dados);
  };

  const buscarAgua = async (data) => {
    const dados = await requisicao(`/agua?data=${data}`);
    setAguaTotal(Number(dados.total_ml || 0));
    setAguaRegistros(Array.isArray(dados.registros) ? dados.registros : []);
  };

  const carregarDadosDoDia = async (data) => {
    setCarregando(true);
    setErro("");

    try {
      await Promise.all([buscarRefeicoes(data), buscarAgua(data)]);
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

    carregarDadosDoDia(dataSelecionada);
  }, [dataSelecionada, token, navigate]);

  const buscarAlimentos = async () => {
    if (alimentos.length > 0) return;

    try {
      const dados = await requisicao("/alimentos");
      setAlimentos(dados);
    } catch (error) {
      setErro(error.message);
    }
  };

  const registrarAgua = async (quantidadeMl) => {
    const quantidadeNumerica = Number(quantidadeMl);

    if (!quantidadeNumerica || quantidadeNumerica <= 0) {
      setErro("Informe uma quantidade de água maior que zero.");
      return;
    }

    setErro("");
    setSucesso("");

    try {
      await requisicao("/agua", {
        method: "POST",
        body: JSON.stringify({
          quantidade_ml: quantidadeNumerica,
          data: dataSelecionada,
        }),
      });

      setQuantidadeAgua("");
      await buscarAgua(dataSelecionada);
      setSucesso("Registro de água adicionado com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  const removerAgua = async (id) => {
    const confirmar = window.confirm("Deseja remover este registro de água?");
    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      await requisicao(`/agua/${id}`, {
        method: "DELETE",
      });

      await buscarAgua(dataSelecionada);
      setSucesso("Registro de água removido com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  const totais = useMemo(() => {
    return refeicoes.reduce(
      (total, refeicao) => {
        total.calorias += Number(refeicao.calorias || 0);
        total.proteinas_g += Number(refeicao.proteinas_g || 0);
        total.carboidratos_g += Number(refeicao.carboidratos_g || 0);
        total.gorduras_g += Number(refeicao.gorduras_g || 0);

        return total;
      },
      {
        calorias: 0,
        proteinas_g: 0,
        carboidratos_g: 0,
        gorduras_g: 0,
      },
    );
  }, [refeicoes]);

  const grupos = useMemo(() => {
    const padrao = REFEICOES_PADRAO.map((grupo) => ({
      ...grupo,
      refeicao: refeicoes.find((refeicao) => refeicao.tipo === grupo.tipo),
    }));

    const personalizadas = refeicoes
      .filter(
        (refeicao) =>
          !REFEICOES_PADRAO.some((grupo) => grupo.tipo === refeicao.tipo),
      )
      .map((refeicao) => ({
        tipo: refeicao.tipo,
        nome: refeicao.nome || "Refeição personalizada",
        simbolo: "★",
        refeicao,
      }));

    return [...padrao, ...personalizadas];
  }, [refeicoes]);

  const alimentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    if (!termo) return alimentos.slice(0, 40);

    return alimentos
      .filter((alimento) =>
        alimento.nome.toLocaleLowerCase("pt-BR").includes(termo),
      )
      .slice(0, 40);
  }, [alimentos, busca]);

  const abrirCatalogo = async (grupo) => {
    setErro("");
    setSucesso("");
    setBusca("");
    setQuantidade(100);
    setAlimentoSelecionado(null);
    setModal(grupo);

    await buscarAlimentos();
  };

  const fecharCatalogo = () => {
    if (processando) return;

    setModal(null);
    setBusca("");
    setAlimentoSelecionado(null);
    setQuantidade(100);
  };

  const obterOuCriarRefeicao = async (grupo) => {
    if (grupo.refeicao) return grupo.refeicao;

    const resultado = await requisicao("/refeicoes", {
      method: "POST",
      body: JSON.stringify({
        nome: grupo.nome,
        data: dataSelecionada,
        tipo: grupo.tipo,
      }),
    });

    return resultado.refeicao;
  };

  const adicionarAlimento = async () => {
    if (!alimentoSelecionado) {
      setErro("Selecione um alimento.");
      return;
    }

    if (!Number(quantidade) || Number(quantidade) <= 0) {
      setErro("Informe uma quantidade maior que zero.");
      return;
    }

    setProcessando(true);
    setErro("");

    try {
      const refeicao = await obterOuCriarRefeicao(modal);

      await requisicao(`/refeicoes/${refeicao.id}/alimentos`, {
        method: "POST",
        body: JSON.stringify({
          alimento_id: alimentoSelecionado.id,
          quantidade_g: Number(quantidade),
        }),
      });

      await buscarRefeicoes(dataSelecionada);
      setSucesso("Alimento adicionado com sucesso.");
      fecharCatalogo();
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  const editarQuantidade = async (refeicaoId, item) => {
    const novaQuantidade = window.prompt(
      `Informe a nova quantidade de ${item.alimento.nome} em gramas:`,
      item.quantidade_g,
    );

    if (novaQuantidade === null) return;

    if (!Number(novaQuantidade) || Number(novaQuantidade) <= 0) {
      setErro("A quantidade deve ser maior que zero.");
      return;
    }

    setErro("");
    setSucesso("");

    try {
      await requisicao(`/refeicoes/${refeicaoId}/alimentos/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          quantidade_g: Number(novaQuantidade),
        }),
      });

      await buscarRefeicoes(dataSelecionada);
      setSucesso("Quantidade atualizada com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  const removerAlimento = async (refeicaoId, item) => {
    const confirmar = window.confirm(
      `Deseja remover ${item.alimento.nome} desta refeição?`,
    );

    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      await requisicao(`/refeicoes/${refeicaoId}/alimentos/${item.id}`, {
        method: "DELETE",
      });

      await buscarRefeicoes(dataSelecionada);
      setSucesso("Alimento removido com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  const criarRefeicaoPersonalizada = async (event) => {
    event.preventDefault();

    if (!nomePersonalizada.trim()) {
      setErro("Informe o nome da refeição.");
      return;
    }

    setProcessando(true);
    setErro("");

    try {
      const tipo = `personalizada_${Date.now()}`;

      await requisicao("/refeicoes", {
        method: "POST",
        body: JSON.stringify({
          nome: nomePersonalizada.trim(),
          data: dataSelecionada,
          tipo,
        }),
      });

      setNomePersonalizada("");
      setCriandoPersonalizada(false);
      setAbertas((estado) => ({ ...estado, [tipo]: true }));

      await buscarRefeicoes(dataSelecionada);
      setSucesso("Refeição personalizada criada.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  const alternarGrupo = (tipo) => {
    setAbertas((estado) => ({
      ...estado,
      [tipo]: !estado[tipo],
    }));
  };

  return (
    <div style={pagina}>
      <Sidebar />

      <main style={conteudo}>
        <header style={cabecalho}>
          <div>
            <h1 style={titulo}>Diário de Dieta</h1>
            <p style={subtitulo}>
              Registre seus alimentos e acompanhe os macros do dia.
            </p>
          </div>

          <div style={acoesCabecalho}>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(event) => alterarDataSelecionada(event.target.value)}
              style={campoData}
            />

            <button
              type="button"
              onClick={() => navigate(`/suplementos?data=${dataSelecionada}`)}
              style={botaoSecundario}
            >
              Suplementos
            </button>
          </div>
        </header>

        <section style={gradeResumo}>
          <ResumoCard
            label="Calorias"
            valor={totais.calorias}
            unidade="kcal"
            casas={0}
          />
          <ResumoCard
            label="Proteínas"
            valor={totais.proteinas_g}
            unidade="g"
          />
          <ResumoCard
            label="Carboidratos"
            valor={totais.carboidratos_g}
            unidade="g"
          />
          <ResumoCard label="Gorduras" valor={totais.gorduras_g} unidade="g" />
        </section>

        <AguaWidget
          totalMl={aguaTotal}
          metaMl={META_AGUA_ML}
          registros={aguaRegistros}
          quantidade={quantidadeAgua}
          onQuantidadeChange={setQuantidadeAgua}
          onRegistrar={registrarAgua}
          onRemover={removerAgua}
        />

        {erro && <div style={alertaErro}>{erro}</div>}
        {sucesso && <div style={alertaSucesso}>{sucesso}</div>}

        {carregando ? (
          <div style={estadoVazio}>Carregando diário...</div>
        ) : (
          <section style={listaRefeicoes}>
            {grupos.map((grupo) => (
              <RefeicaoCard
                key={grupo.tipo}
                grupo={grupo}
                aberta={Boolean(abertas[grupo.tipo])}
                onAlternar={() => alternarGrupo(grupo.tipo)}
                onAdicionar={() => abrirCatalogo(grupo)}
                onEditar={editarQuantidade}
                onRemover={removerAlimento}
              />
            ))}

            <div style={personalizarBox}>
              {!criandoPersonalizada ? (
                <>
                  <div>
                    <strong style={personalizarTitulo}>
                      Personalizar refeições
                    </strong>
                    <p style={personalizarTexto}>
                      Crie outro período para organizar seus alimentos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCriandoPersonalizada(true)}
                    style={botaoSecundario}
                  >
                    Adicionar
                  </button>
                </>
              ) : (
                <form
                  onSubmit={criarRefeicaoPersonalizada}
                  style={formPersonalizada}
                >
                  <input
                    value={nomePersonalizada}
                    onChange={(event) =>
                      setNomePersonalizada(event.target.value)
                    }
                    placeholder="Nome da refeição"
                    style={campoTexto}
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={processando}
                    style={botaoPrimario}
                  >
                    Criar
                  </button>

                  <button
                    type="button"
                    onClick={() => setCriandoPersonalizada(false)}
                    style={botaoSecundario}
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>

      {modal && (
        <div style={fundoModal} onMouseDown={fecharCatalogo}>
          <div
            style={modalBox}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header style={modalCabecalho}>
              <div>
                <h2 style={modalTitulo}>Adicionar alimento</h2>
                <p style={modalSubtitulo}>{modal.nome}</p>
              </div>

              <button
                type="button"
                onClick={fecharCatalogo}
                style={botaoFechar}
                title="Fechar"
              >
                ×
              </button>
            </header>

            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar alimento no catálogo"
              style={campoBusca}
              autoFocus
            />

            <div style={catalogoLista}>
              {alimentosFiltrados.map((alimento) => {
                const selecionado = alimentoSelecionado?.id === alimento.id;

                return (
                  <button
                    key={alimento.id}
                    type="button"
                    onClick={() => {
                      setAlimentoSelecionado(alimento);
                      setQuantidade(alimento.porcao || 100);
                    }}
                    style={{
                      ...alimentoOpcao,
                      ...(selecionado ? alimentoSelecionadoStyle : {}),
                    }}
                  >
                    <div>
                      <strong style={alimentoNome}>{alimento.nome}</strong>
                      <span style={alimentoDetalhe}>
                        Porção: {alimento.porcao} {alimento.unidade}
                      </span>
                    </div>

                    <div style={alimentoMacros}>
                      <strong>{arredondar(alimento.calorias, 0)} kcal</strong>
                      <span>
                        P {arredondar(alimento.proteinas_g)} · C{" "}
                        {arredondar(alimento.carboidratos_g)} · G{" "}
                        {arredondar(alimento.gorduras_g)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <footer style={modalRodape}>
              <label style={quantidadeLabel}>
                Quantidade
                <span style={quantidadeControle}>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantidade}
                    onChange={(event) => setQuantidade(event.target.value)}
                    style={campoQuantidade}
                  />
                  <span>g</span>
                </span>
              </label>

              <button
                type="button"
                disabled={!alimentoSelecionado || processando}
                onClick={adicionarAlimento}
                style={{
                  ...botaoPrimario,
                  opacity: !alimentoSelecionado || processando ? 0.6 : 1,
                }}
              >
                {processando ? "Adicionando..." : "Adicionar alimento"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumoCard({ label, valor, unidade, casas = 1 }) {
  return (
    <div style={resumoCard}>
      <span style={resumoLabel}>{label}</span>
      <strong style={resumoValor}>{arredondar(valor, casas)}</strong>
      <span style={resumoUnidade}>{unidade}</span>
    </div>
  );
}

function AguaWidget({
  totalMl,
  metaMl,
  registros,
  quantidade,
  onQuantidadeChange,
  onRegistrar,
  onRemover,
}) {
  const progresso = Math.min((totalMl / metaMl) * 100, 100);

  return (
    <section style={aguaBox}>
      <div style={aguaTopo}>
        <div>
          <span style={aguaLabel}>Água</span>
          <strong style={aguaTotal}>{totalMl} ml</strong>
          <p style={aguaMeta}>Meta diária: {metaMl} ml</p>
        </div>

        <div style={aguaAcoes}>
          <button
            type="button"
            style={botaoAguaRapido}
            onClick={() => onRegistrar(250)}
          >
            +250 ml
          </button>

          <button
            type="button"
            style={botaoAguaRapido}
            onClick={() => onRegistrar(500)}
          >
            +500 ml
          </button>
        </div>
      </div>

      <div style={aguaBarraFundo}>
        <div style={{ ...aguaBarraPreenchida, width: `${progresso}%` }} />
      </div>

      <div style={aguaRodape}>
        <label style={aguaCampoLabel}>
          Quantidade personalizada
          <span style={aguaCampoLinha}>
            <input
              type="number"
              min="1"
              step="1"
              value={quantidade}
              onChange={(event) => onQuantidadeChange(event.target.value)}
              placeholder="Ex: 300"
              style={campoAgua}
            />
            <span>ml</span>
          </span>
        </label>

        <button
          type="button"
          style={botaoPrimario}
          onClick={() => onRegistrar(quantidade)}
        >
          Registrar água
        </button>
      </div>

      {registros.length > 0 && (
        <div style={aguaRegistrosLista}>
          {registros.map((registro) => (
            <div key={registro.id} style={aguaRegistroItem}>
              <span>{registro.quantidade_ml} ml</span>

              <button
                type="button"
                style={botaoRemoverAgua}
                onClick={() => onRemover(registro.id)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RefeicaoCard({
  grupo,
  aberta,
  onAlternar,
  onAdicionar,
  onEditar,
  onRemover,
}) {
  const refeicao = grupo.refeicao;
  const itens = refeicao?.itens || [];

  return (
    <article style={refeicaoCard}>
      <header style={refeicaoCabecalho}>
        <button type="button" onClick={onAlternar} style={botaoAbrirRefeicao}>
          <span style={simboloRefeicao}>{grupo.simbolo}</span>

          <span>
            <strong style={nomeRefeicao}>{grupo.nome}</strong>
            <span style={resumoRefeicao}>
              {arredondar(refeicao?.proteinas_g)} g prot ·{" "}
              {arredondar(refeicao?.carboidratos_g)} g carb ·{" "}
              {arredondar(refeicao?.gorduras_g)} g gord
            </span>
          </span>
        </button>

        <div style={acoesRefeicao}>
          <strong style={caloriasRefeicao}>
            {arredondar(refeicao?.calorias, 0)}
            <span> kcal</span>
          </strong>

          <button
            type="button"
            onClick={onAdicionar}
            style={botaoAdicionar}
            title="Adicionar alimento"
          >
            +
          </button>

          <button
            type="button"
            onClick={onAlternar}
            style={botaoSeta}
            title={aberta ? "Recolher" : "Expandir"}
          >
            {aberta ? "⌃" : "⌄"}
          </button>
        </div>
      </header>

      {aberta && (
        <div style={refeicaoConteudo}>
          {itens.length === 0 ? (
            <div style={refeicaoVazia}>
              <span>Nenhum alimento registrado.</span>
              <button type="button" onClick={onAdicionar} style={botaoLink}>
                Adicionar alimento
              </button>
            </div>
          ) : (
            itens.map((item) => (
              <div key={item.id} style={itemLinha}>
                <div>
                  <strong style={itemNome}>{item.alimento.nome}</strong>
                  <span style={itemDetalhe}>
                    {arredondar(item.quantidade_g, 0)} g ·{" "}
                    {arredondar(calcularItem(item, "calorias"), 0)} kcal
                  </span>
                </div>

                <div style={itemMacros}>
                  <span>P {arredondar(calcularItem(item, "proteinas_g"))}</span>
                  <span>
                    C {arredondar(calcularItem(item, "carboidratos_g"))}
                  </span>
                  <span>G {arredondar(calcularItem(item, "gorduras_g"))}</span>

                  <button
                    type="button"
                    onClick={() => onEditar(refeicao.id, item)}
                    style={botaoItem}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemover(refeicao.id, item)}
                    style={botaoRemover}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
}

const pagina = {
  minHeight: "100vh",
  background: "#f0f4f8",
};

const conteudo = {
  marginLeft: 240,
  padding: "28px 34px 48px",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const cabecalho = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  marginBottom: 24,
};

const titulo = {
  margin: 0,
  color: "#102b46",
  fontSize: 28,
  fontWeight: 800,
};

const subtitulo = {
  margin: "6px 0 0",
  color: "#778493",
};

const acoesCabecalho = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const campoData = {
  height: 42,
  padding: "0 12px",
  border: "1px solid #d9dee5",
  borderRadius: 8,
  color: "#102b46",
  background: "#fff",
  colorScheme: "light",
};

const gradeResumo = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(150px, 1fr))",
  gap: 16,
  marginBottom: 22,
};

const resumoCard = {
  background: "#fff",
  border: "1px solid #e1e6eb",
  borderRadius: 8,
  padding: "18px 20px",
};

const resumoLabel = {
  display: "block",
  color: "#6b7785",
  fontSize: 12,
  textTransform: "uppercase",
  marginBottom: 10,
};

const resumoValor = {
  display: "inline-block",
  color: "#0b3764",
  fontSize: 28,
  lineHeight: 1,
};

const resumoUnidade = {
  color: "#d99a00",
  fontSize: 13,
  marginLeft: 6,
};

const aguaBox = {
  background: "#fff",
  border: "1px solid #dfe5eb",
  borderRadius: 8,
  padding: 20,
  marginBottom: 22,
};

const aguaTopo = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
};

const aguaLabel = {
  display: "block",
  color: "#6b7785",
  fontSize: 12,
  textTransform: "uppercase",
  marginBottom: 8,
};

const aguaTotal = {
  display: "block",
  color: "#0b3764",
  fontSize: 30,
  lineHeight: 1,
};

const aguaMeta = {
  margin: "8px 0 0",
  color: "#778493",
  fontSize: 13,
};

const aguaAcoes = {
  display: "flex",
  gap: 10,
};

const botaoAguaRapido = {
  padding: "10px 14px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#eef7ff",
  color: "#0b3764",
  fontWeight: 800,
  cursor: "pointer",
};

const aguaBarraFundo = {
  height: 10,
  marginTop: 18,
  borderRadius: 999,
  background: "#e7edf3",
  overflow: "hidden",
};

const aguaBarraPreenchida = {
  height: "100%",
  borderRadius: 999,
  background: "#2b8fd8",
  transition: "width 0.2s",
};

const aguaRodape = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 16,
  marginTop: 16,
};

const aguaCampoLabel = {
  color: "#415365",
  fontSize: 12,
  fontWeight: 700,
};

const aguaCampoLinha = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  marginTop: 6,
};

const campoAgua = {
  width: 120,
  padding: "9px 10px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#ffffff",
  color: "#102b46",
  caretColor: "#102b46",
  colorScheme: "light",
  outline: "none",
};

const aguaRegistrosLista = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 16,
};

const aguaRegistroItem = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 9px",
  border: "1px solid #dce6ef",
  borderRadius: 8,
  background: "#f8fbfe",
  color: "#173a59",
  fontSize: 13,
};

const botaoRemoverAgua = {
  border: 0,
  background: "transparent",
  color: "#b42318",
  fontWeight: 700,
  cursor: "pointer",
};

const listaRefeicoes = {
  display: "grid",
  gap: 14,
};

const refeicaoCard = {
  overflow: "hidden",
  background: "#fff",
  border: "1px solid #dfe5eb",
  borderRadius: 8,
};

const refeicaoCabecalho = {
  minHeight: 78,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "0 18px",
  background: "#fff",
};

const botaoAbrirRefeicao = {
  minWidth: 0,
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: 14,
  border: 0,
  padding: "16px 0",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
};

const simboloRefeicao = {
  width: 40,
  height: 40,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  borderRadius: "50%",
  background: "#fff4cc",
  color: "#d99a00",
  fontSize: 21,
  fontWeight: 800,
};

const nomeRefeicao = {
  display: "block",
  color: "#102b46",
  fontSize: 18,
};

const resumoRefeicao = {
  display: "block",
  marginTop: 5,
  color: "#7a8694",
  fontSize: 13,
};

const acoesRefeicao = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const caloriasRefeicao = {
  minWidth: 86,
  textAlign: "right",
  color: "#102b46",
  fontSize: 22,
};

const botaoAdicionar = {
  width: 38,
  height: 38,
  border: 0,
  borderRadius: "50%",
  background: "#d8a20d",
  color: "#102b46",
  fontSize: 26,
  lineHeight: 1,
  cursor: "pointer",
};

const botaoSeta = {
  width: 32,
  height: 32,
  border: 0,
  background: "transparent",
  color: "#667483",
  fontSize: 20,
  cursor: "pointer",
};

const refeicaoConteudo = {
  borderTop: "1px solid #e7ebef",
  padding: "0 18px",
  background: "#fbfcfd",
};

const refeicaoVazia = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 2px",
  color: "#7a8694",
};

const itemLinha = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  padding: "15px 2px",
  borderBottom: "1px solid #e7ebef",
};

const itemNome = {
  display: "block",
  color: "#18354f",
  fontSize: 14,
};

const itemDetalhe = {
  display: "block",
  marginTop: 4,
  color: "#7a8694",
  fontSize: 12,
};

const itemMacros = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#536273",
  fontSize: 12,
};

const botaoItem = {
  padding: "7px 10px",
  border: "1px solid #d6dde4",
  borderRadius: 6,
  background: "#fff",
  color: "#163a5d",
  fontWeight: 700,
  cursor: "pointer",
};

const botaoRemover = {
  padding: "7px 10px",
  border: "1px solid #f0c4c4",
  borderRadius: 6,
  background: "#fff",
  color: "#b42318",
  fontWeight: 700,
  cursor: "pointer",
};

const personalizarBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  padding: 20,
  border: "1px dashed #bdc7d1",
  borderRadius: 8,
  background: "#fff",
};

const personalizarTitulo = {
  color: "#102b46",
  fontSize: 17,
};

const personalizarTexto = {
  margin: "5px 0 0",
  color: "#778493",
  fontSize: 13,
};

const formPersonalizada = {
  width: "100%",
  display: "flex",
  gap: 10,
};

const campoTexto = {
  flex: 1,
  minWidth: 0,
  padding: "10px 12px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  color: "#102b46",
};

const botaoPrimario = {
  padding: "10px 16px",
  border: 0,
  borderRadius: 8,
  background: "#d8a20d",
  color: "#102b46",
  fontWeight: 800,
  cursor: "pointer",
};

const botaoSecundario = {
  padding: "10px 16px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#fff",
  color: "#102b46",
  fontWeight: 700,
  cursor: "pointer",
};

const botaoLink = {
  border: 0,
  padding: 0,
  background: "transparent",
  color: "#0b5b9d",
  fontWeight: 700,
  cursor: "pointer",
};

const alertaErro = {
  marginBottom: 16,
  padding: "11px 14px",
  border: "1px solid #f0c4c4",
  borderRadius: 8,
  background: "#fff4f4",
  color: "#b42318",
};

const alertaSucesso = {
  marginBottom: 16,
  padding: "11px 14px",
  border: "1px solid #b7dfc4",
  borderRadius: 8,
  background: "#f1fbf4",
  color: "#25703b",
};

const estadoVazio = {
  padding: 30,
  border: "1px solid #dfe5eb",
  borderRadius: 8,
  background: "#fff",
  color: "#778493",
  textAlign: "center",
};

const fundoModal = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "rgba(10, 25, 40, 0.55)",
};

const modalBox = {
  width: "min(720px, 100%)",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: 8,
  background: "#fff",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
};

const modalCabecalho = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "20px 22px 14px",
};

const modalTitulo = {
  margin: 0,
  color: "#102b46",
  fontSize: 21,
};

const modalSubtitulo = {
  margin: "4px 0 0",
  color: "#778493",
  fontSize: 13,
};

const botaoFechar = {
  width: 34,
  height: 34,
  border: 0,
  background: "transparent",
  color: "#627181",
  fontSize: 27,
  cursor: "pointer",
};

const campoBusca = {
  margin: "0 22px 14px",
  padding: "11px 13px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#ffffff",
  color: "#102b46",
  caretColor: "#102b46",
  colorScheme: "light",
  outline: "none",
};

const catalogoLista = {
  flex: 1,
  overflowY: "auto",
  padding: "0 22px",
};

const alimentoOpcao = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  padding: "13px 12px",
  border: "1px solid transparent",
  borderBottomColor: "#e8edf1",
  background: "#fff",
  textAlign: "left",
  cursor: "pointer",
};

const alimentoSelecionadoStyle = {
  borderColor: "#d8a20d",
  background: "#fff9e8",
};

const alimentoNome = {
  display: "block",
  color: "#173a59",
  fontSize: 14,
};

const alimentoDetalhe = {
  display: "block",
  marginTop: 4,
  color: "#7a8694",
  fontSize: 12,
};

const alimentoMacros = {
  display: "grid",
  gap: 4,
  color: "#536273",
  fontSize: 12,
  textAlign: "right",
};

const modalRodape = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 20,
  padding: "16px 22px 20px",
  borderTop: "1px solid #e5eaee",
};

const quantidadeLabel = {
  color: "#415365",
  fontSize: 12,
  fontWeight: 700,
};

const quantidadeControle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  marginTop: 6,
};

const campoQuantidade = {
  width: 100,
  padding: "9px 10px",
  border: "1px solid #d6dde4",
  borderRadius: 8,
  background: "#ffffff",
  color: "#102b46",
  caretColor: "#102b46",
  colorScheme: "light",
  outline: "none",
};

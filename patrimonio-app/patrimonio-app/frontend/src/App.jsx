import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Wallet, Coins, TrendingUp, ChevronRight, Check, Loader2 } from "lucide-react";
import {
  API_BASE_URL,
  PLUGGY_CONNECT_SCRIPT_URL,
  styles,
  fontImports,
  SUBTLE,
} from "./shared.js";
import CarteiraPage from "./CarteiraPage.jsx";
import ProventosPage from "./ProventosPage.jsx";
import RendimentoAnualPage from "./RendimentoAnualPage.jsx";

const TICKERS_ACOES_FIIS_DEMO = ["PETR4", "ITSA4", "MXRF11", "HGLG11"];
const PARES_CRIPTO_DEMO = ["BTCBRL", "ETHBRL"];

const ATIVOS_DEMO = [
  { id: "demo-petr4", ticker: "PETR4", nome: "Petrobras PN", classe: "acoes", valor: 4820.5, corretora: "Rico", variacaoAtual: -1.8 },
  { id: "demo-mxrf11", ticker: "MXRF11", nome: "Maxi Renda FII", classe: "fiis", valor: 2870.3, corretora: "Inter", variacaoAtual: 0.3 },
  { id: "demo-cdb", ticker: "CDB Inter 118%", nome: "CDB pós-fixado", classe: "rendafixa", valor: 6200.0, corretora: "Inter", variacaoAtual: 0.04 },
  { id: "demo-btc", ticker: "BTCBRL", nome: "Bitcoin", classe: "cripto", valor: 1980.0, corretora: "Binance", variacaoAtual: 2.4 },
];

const BANCOS = [
  { nome: "Inter", cor: "#FF7A00" },
  { nome: "Nubank", cor: "#8A05BE" },
  { nome: "Rico", cor: "#00A868" },
  { nome: "Binance", cor: "#F0B90B" },
  { nome: "XP Investimentos", cor: "#1C1C1C" },
];

// Ver docs.pluggy.ai (Investments) antes de produção — valores de type/subtype
// podem mudar; isto é um ponto de partida, não uma tabela oficial garantida.
function mapTipoPluggyParaClasse(investimento) {
  const tipo = (investimento.type || "").toUpperCase();
  const subtipo = (investimento.subtype || "").toUpperCase();
  if (tipo === "EQUITY" || subtipo.includes("STOCK") || subtipo.includes("ACAO")) return "acoes";
  if (subtipo.includes("FII") || subtipo.includes("REAL_ESTATE")) return "fiis";
  if (tipo === "FIXED_INCOME" && subtipo.includes("TREASURY")) return "tesouro";
  if (tipo === "FIXED_INCOME") return "rendafixa";
  if (tipo === "MUTUAL_FUND") return "rendafixa";
  return "rendafixa";
}

function normalizarInvestimentosPluggy(investimentos, nomeBanco, itemId) {
  return investimentos.map((inv) => ({
    id: `${itemId}-${inv.id}`,
    ticker: inv.code || inv.name,
    nome: inv.name,
    classe: mapTipoPluggyParaClasse(inv),
    valor: inv.balance ?? inv.amount ?? 0,
    corretora: nomeBanco,
    variacaoAtual: inv.annualRate ? inv.annualRate / 100 : 0,
    origem: "pluggy",
  }));
}

function usePluggyConnectScript() {
  const [carregado, setCarregado] = useState(typeof window !== "undefined" && !!window.PluggyConnect);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.PluggyConnect) return setCarregado(true);
    const script = document.createElement("script");
    script.src = PLUGGY_CONNECT_SCRIPT_URL;
    script.async = true;
    script.onload = () => setCarregado(true);
    document.body.appendChild(script);
  }, []);
  return carregado;
}

function useConexoesPluggy(onNovosInvestimentos) {
  const [itemsPorBanco, setItemsPorBanco] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pluggy_items") || "{}");
    } catch {
      return {};
    }
  });
  const [conectando, setConectando] = useState(null);
  const scriptCarregado = usePluggyConnectScript();

  const buscarInvestimentosDoItem = useCallback(
    async (itemId, nomeBanco) => {
      const resp = await fetch(`${API_BASE_URL}/bank/investments/${itemId}`);
      if (!resp.ok) throw new Error("Falha ao buscar investimentos");
      const investimentos = await resp.json();
      onNovosInvestimentos(nomeBanco, normalizarInvestimentosPluggy(investimentos, nomeBanco, itemId));
    },
    [onNovosInvestimentos]
  );

  const conectar = useCallback(
    async (nomeBanco) => {
      if (!scriptCarregado) return;
      setConectando(nomeBanco);
      try {
        const resp = await fetch(`${API_BASE_URL}/bank/connect-token`, { method: "POST" });
        if (!resp.ok) throw new Error("Backend não respondeu");
        const { connectToken } = await resp.json();

        const widget = new window.PluggyConnect({
          connectToken,
          includeSandbox: true, // remova em produção
          onSuccess: async (data) => {
            const itemId = data.item.id;
            const novosItems = { ...itemsPorBanco, [nomeBanco]: itemId };
            setItemsPorBanco(novosItems);
            localStorage.setItem("pluggy_items", JSON.stringify(novosItems));
            await buscarInvestimentosDoItem(itemId, nomeBanco);
            setConectando(null);
          },
          onError: (err) => {
            console.error("Pluggy Connect:", err);
            setConectando(null);
          },
          onClose: () => setConectando(null),
        });
        widget.init();
      } catch (e) {
        console.error("Não foi possível abrir a conexão:", e.message);
        setConectando(null);
      }
    },
    [scriptCarregado, itemsPorBanco, buscarInvestimentosDoItem]
  );

  const desconectar = useCallback(
    (nomeBanco) => {
      const novosItems = { ...itemsPorBanco };
      delete novosItems[nomeBanco];
      setItemsPorBanco(novosItems);
      localStorage.setItem("pluggy_items", JSON.stringify(novosItems));
      onNovosInvestimentos(nomeBanco, []);
    },
    [itemsPorBanco, onNovosInvestimentos]
  );

  useEffect(() => {
    Object.entries(itemsPorBanco).forEach(([nomeBanco, itemId]) => {
      buscarInvestimentosDoItem(itemId, nomeBanco).catch((e) =>
        console.error(`Falha ao recarregar ${nomeBanco}:`, e.message)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { bancosConectados: Object.keys(itemsPorBanco), conectando, conectar, desconectar, scriptCarregado };
}

function useCotacoes(ativosReais) {
  const [cotacoes, setCotacoes] = useState({});
  const [online, setOnline] = useState(false);

  const buscar = useCallback(async () => {
    try {
      const tickers = [...new Set(ativosReais.filter((a) => a.classe === "acoes" || a.classe === "fiis").map((a) => a.ticker))];
      const cripto = [...new Set(ativosReais.filter((a) => a.classe === "cripto").map((a) => a.ticker))];
      const novasCotacoes = {};

      const listaAcoes = tickers.length > 0 ? tickers : ativosReais.length === 0 ? TICKERS_ACOES_FIIS_DEMO : [];
      const listaCripto = cripto.length > 0 ? cripto : ativosReais.length === 0 ? PARES_CRIPTO_DEMO : [];

      if (listaAcoes.length > 0) {
        const r = await fetch(`${API_BASE_URL}/quotes?tickers=${listaAcoes.join(",")}`);
        if (r.ok) (await r.json()).forEach((d) => (novasCotacoes[d.ticker] = d.variacaoPct));
      }
      if (listaCripto.length > 0) {
        const r = await fetch(`${API_BASE_URL}/binance/prices?symbols=${listaCripto.join(",")}`);
        if (r.ok) (await r.json()).forEach((d) => (novasCotacoes[d.symbol] = d.variacaoPct));
      }

      setCotacoes(novasCotacoes);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [ativosReais]);

  useEffect(() => {
    buscar();
    const id = setInterval(buscar, 15000);
    return () => clearInterval(id);
  }, [buscar]);

  return { cotacoes, online, recarregar: buscar };
}

const ABAS = [
  { key: "carteira", label: "Carteira", Icone: Wallet },
  { key: "proventos", label: "Proventos", Icone: Coins },
  { key: "rendimento", label: "Rendimento", Icone: TrendingUp },
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("carteira");
  const [ativosPorBanco, setAtivosPorBanco] = useState({});
  const [mostrarConexoes, setMostrarConexoes] = useState(false);

  const atualizarAtivosDoBanco = useCallback((nomeBanco, ativos) => {
    setAtivosPorBanco((prev) => ({ ...prev, [nomeBanco]: ativos }));
  }, []);

  const { bancosConectados, conectando, conectar, desconectar, scriptCarregado } =
    useConexoesPluggy(atualizarAtivosDoBanco);

  const ativosReais = useMemo(() => Object.values(ativosPorBanco).flat(), [ativosPorBanco]);
  const usandoDemo = ativosReais.length === 0;
  const ativosBase = usandoDemo ? ATIVOS_DEMO : ativosReais;

  const { cotacoes, online, recarregar } = useCotacoes(ativosReais);

  const ativos = useMemo(
    () => ativosBase.map((a) => ({ ...a, variacaoAtual: cotacoes[a.ticker] ?? a.variacaoAtual })),
    [ativosBase, cotacoes]
  );

  const tickers = useMemo(
    () => [...new Set(ativos.filter((a) => a.classe === "acoes" || a.classe === "fiis").map((a) => a.ticker))],
    [ativos]
  );

  const toggleBanco = (nome) => (bancosConectados.includes(nome) ? desconectar(nome) : conectar(nome));

  return (
    <div style={styles.page}>
      <style>{fontImports}</style>

      {abaAtiva === "carteira" && (
        <CarteiraPage
          ativos={ativos}
          usandoDemo={usandoDemo}
          online={online}
          bancosConectados={bancosConectados}
          onRecarregar={recarregar}
          onAbrirConexoes={() => setMostrarConexoes(true)}
        />
      )}
      {abaAtiva === "proventos" && <ProventosPage tickers={tickers} />}
      {abaAtiva === "rendimento" && <RendimentoAnualPage ativos={ativos} />}

      <div style={styles.tabBar}>
        {ABAS.map(({ key, label, Icone }) => (
          <button key={key} style={styles.tabBtn(abaAtiva === key)} onClick={() => setAbaAtiva(key)}>
            <Icone size={20} />
            {label}
          </button>
        ))}
      </div>

      {mostrarConexoes && (
        <ConexoesModal
          bancosConectados={bancosConectados}
          conectando={conectando}
          scriptCarregado={scriptCarregado}
          onToggle={toggleBanco}
          onFechar={() => setMostrarConexoes(false)}
        />
      )}
    </div>
  );
}

function ConexoesModal({ bancosConectados, conectando, scriptCarregado, onToggle, onFechar }) {
  return (
    <div style={styles.modalOverlay} onClick={onFechar}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalTitulo}>Conectar contas</div>
        <div style={styles.modalSubtitulo}>
          {scriptCarregado
            ? "Você vai fazer login diretamente com o banco — sua senha não passa pelo app."
            : "Carregando widget de conexão..."}
        </div>
        {BANCOS.map((b) => {
          const conectado = bancosConectados.includes(b.nome);
          const carregandoEsse = conectando === b.nome;
          return (
            <button
              key={b.nome}
              style={styles.bancoLinha}
              onClick={() => onToggle(b.nome)}
              disabled={carregandoEsse || !scriptCarregado}
            >
              <span style={{ ...styles.bancoBadge, background: b.cor }}>{b.nome[0]}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{b.nome}</span>
              {carregandoEsse ? (
                <Loader2 size={16} color={SUBTLE} className="girando" />
              ) : conectado ? (
                <span style={styles.conectadoTag}>
                  <Check size={12} /> conectado
                </span>
              ) : (
                <ChevronRight size={16} color={SUBTLE} />
              )}
            </button>
          );
        })}
        <button style={styles.fecharBtn} onClick={onFechar}>
          Concluído
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { Coins, Calendar } from "lucide-react";
import { API_BASE_URL, styles, formatBRL, formatData, SUBTLE, COLOR_UP, GOLD, LINE } from "./shared.js";

// Cor por tipo de provento — ajuda a diferenciar dividendo/JCP/rendimento de FII num relance.
const CORES_TIPO = {
  DIVIDENDO: COLOR_UP,
  JCP: GOLD,
  RENDIMENTO: "#6E9BD9",
};
function corDoTipo(tipo) {
  const chave = (tipo || "").toUpperCase();
  return CORES_TIPO[chave] || SUBTLE;
}

export default function ProventosPage({ tickers }) {
  const [proventos, setProventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (tickers.length === 0) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    fetch(`${API_BASE_URL}/dividends?tickers=${tickers.join(",")}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setProventos(data);
        setErro(false);
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, [tickers]);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const { proximos, pagos, totalRecebidoAnoPorCota } = useMemo(() => {
    const proximos = proventos
      .filter((p) => p.dataPagamento && new Date(p.dataPagamento) >= hoje)
      .sort((a, b) => new Date(a.dataPagamento) - new Date(b.dataPagamento));

    const pagos = proventos
      .filter((p) => p.dataPagamento && new Date(p.dataPagamento) < hoje)
      .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));

    const totalRecebidoAnoPorCota = proventos
      .filter((p) => p.dataPagamento && new Date(p.dataPagamento).getFullYear() === anoAtual && new Date(p.dataPagamento) < hoje)
      .reduce((s, p) => s + (p.valorPorCota || 0), 0);

    return { proximos, pagos, totalRecebidoAnoPorCota };
  }, [proventos]);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>PROVENTOS · {anoAtual}</div>
          <div style={styles.totalValor}>{totalRecebidoAnoPorCota.toFixed(2)} <span style={{ fontSize: 16, color: SUBTLE }}>/ cota, no ano</span></div>
          <div style={{ fontSize: 12, color: SUBTLE, marginTop: 8 }}>
            Dividendos, JCP e rendimentos de FII já pagos em {anoAtual}, por cota. Multiplique pela
            sua quantidade de cada ativo para saber o valor total recebido.
          </div>
        </div>
      </div>

      {tickers.length === 0 && (
        <div style={styles.avisoDemo}>Conecte uma conta ou defina ativos para ver os proventos.</div>
      )}
      {erro && <div style={styles.avisoDemo}>Não consegui buscar os proventos agora — confira se o backend está no ar.</div>}
      {carregando && <div style={{ ...styles.avisoDemo, color: SUBTLE }}>Carregando proventos...</div>}

      {proximos.length > 0 && (
        <>
          <div style={styles.sectionHeaderRow}>
            <div style={styles.sectionTitle}>
              <Calendar size={14} style={{ marginRight: 6 }} />
              A RECEBER
            </div>
          </div>
          <div style={styles.card}>
            {proximos.map((p, i) => (
              <ProventoLinha key={`${p.ticker}-${p.dataPagamento}-${i}`} provento={p} isLast={i === proximos.length - 1} />
            ))}
          </div>
        </>
      )}

      {pagos.length > 0 && (
        <>
          <div style={styles.sectionHeaderRow}>
            <div style={styles.sectionTitle}>
              <Coins size={14} style={{ marginRight: 6 }} />
              HISTÓRICO
            </div>
          </div>
          <div style={styles.card}>
            {pagos.map((p, i) => (
              <ProventoLinha key={`${p.ticker}-${p.dataPagamento}-${i}`} provento={p} isLast={i === pagos.length - 1} />
            ))}
          </div>
        </>
      )}

      {!carregando && !erro && proximos.length === 0 && pagos.length === 0 && tickers.length > 0 && (
        <div style={{ ...styles.card, textAlign: "center", color: SUBTLE, fontSize: 13 }}>
          Nenhum provento encontrado para os ativos da sua carteira nos últimos registros da B3.
        </div>
      )}
    </div>
  );
}

function ProventoLinha({ provento, isLast }) {
  return (
    <div style={{ ...styles.proventoLinha, borderBottom: isLast ? "none" : `1px solid ${LINE}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={styles.ativoTicker}>{provento.ticker}</span>
          <span style={styles.proventoTipoTag(corDoTipo(provento.tipo))}>{provento.tipo}</span>
        </div>
        <div style={styles.ativoNome}>
          data-com {formatData(provento.dataComData)} · pagamento {formatData(provento.dataPagamento)}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={styles.ativoValor}>{formatBRL(provento.valorPorCota)} / cota</div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { API_BASE_URL, styles, CLASSES, formatBRL, formatPct, SUBTLE, COLOR_UP, COLOR_DOWN, LINE } from "./shared.js";

// A rentabilidade do ano (YTD) é calculada comparando o preço do início do ano
// com o preço atual — cripto usa a variação 24h da Binance como aproximação,
// já que o backend atual não guarda histórico anual de cripto (ver README).
export default function RendimentoAnualPage({ ativos }) {
  const [performancePorTicker, setPerformancePorTicker] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const tickersAcoesFiis = useMemo(
    () => [...new Set(ativos.filter((a) => a.classe === "acoes" || a.classe === "fiis").map((a) => a.ticker))],
    [ativos]
  );

  useEffect(() => {
    if (tickersAcoesFiis.length === 0) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    fetch(`${API_BASE_URL}/performance?tickers=${tickersAcoesFiis.join(",")}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        const mapa = {};
        data.forEach((d) => (mapa[d.ticker] = d.variacaoAnoPct));
        setPerformancePorTicker(mapa);
        setErro(false);
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, [tickersAcoesFiis]);

  const ativosComPerformance = useMemo(
    () =>
      ativos.map((a) => ({
        ...a,
        // renda fixa/tesouro não têm preço de mercado diário — usamos a
        // variacaoAtual (rentabilidade acumulada, quando disponível) como proxy.
        variacaoAnoPct:
          a.classe === "acoes" || a.classe === "fiis" ? performancePorTicker[a.ticker] : a.variacaoAtual,
      })),
    [ativos, performancePorTicker]
  );

  const patrimonioTotal = ativos.reduce((s, a) => s + a.valor, 0);

  const rendimentoAnoPct = useMemo(() => {
    const comDado = ativosComPerformance.filter((a) => typeof a.variacaoAnoPct === "number");
    if (comDado.length === 0) return null;
    const somaValor = comDado.reduce((s, a) => s + a.valor, 0);
    const somaPonderada = comDado.reduce((s, a) => s + a.valor * a.variacaoAnoPct, 0);
    return somaValor ? somaPonderada / somaValor : null;
  }, [ativosComPerformance]);

  const rendimentoAnoValor = rendimentoAnoPct != null ? patrimonioTotal * (rendimentoAnoPct / 100) : null;

  const porClasse = useMemo(() => {
    return CLASSES.map((c) => {
      const doGrupo = ativosComPerformance.filter((a) => a.classe === c.key);
      const valor = doGrupo.reduce((s, a) => s + a.valor, 0);
      const comDado = doGrupo.filter((a) => typeof a.variacaoAnoPct === "number");
      const pct = comDado.length
        ? comDado.reduce((s, a) => s + a.valor * a.variacaoAnoPct, 0) / comDado.reduce((s, a) => s + a.valor, 0)
        : null;
      return { ...c, valor, pct };
    }).filter((c) => c.valor > 0);
  }, [ativosComPerformance]);

  const positivo = (rendimentoAnoPct ?? 0) >= 0;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>RENDIMENTO NO ANO</div>
          {rendimentoAnoPct != null ? (
            <>
              <div style={{ ...styles.totalValor, color: positivo ? COLOR_UP : COLOR_DOWN }}>
                {formatPct(rendimentoAnoPct)}
              </div>
              <div style={{ ...styles.variacaoDia, color: positivo ? COLOR_UP : COLOR_DOWN }}>
                {positivo ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {formatBRL(Math.abs(rendimentoAnoValor))} desde janeiro
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: SUBTLE, marginTop: 8 }}>
              {carregando ? "Calculando..." : "Sem dados suficientes ainda."}
            </div>
          )}
        </div>
      </div>

      {erro && <div style={styles.avisoDemo}>Não consegui calcular a rentabilidade agora — confira o backend.</div>}

      <div style={styles.sectionHeaderRow}>
        <div style={styles.sectionTitle}>POR CLASSE DE ATIVO</div>
      </div>
      <div style={styles.card}>
        {porClasse.map((c, i) => (
          <div key={c.key} style={{ marginBottom: i === porClasse.length - 1 ? 0 : 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...styles.dot, background: c.color }} />
                {c.label}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: c.pct == null ? SUBTLE : c.pct >= 0 ? COLOR_UP : COLOR_DOWN,
                }}
              >
                {c.pct == null ? "sem dado" : formatPct(c.pct)}
              </span>
            </div>
            <div style={styles.barraFundo}>
              {c.pct != null && <div style={styles.barraPreenchida(c.pct, c.pct >= 0 ? COLOR_UP : COLOR_DOWN)} />}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.sectionHeaderRow}>
        <div style={styles.sectionTitle}>POR ATIVO</div>
      </div>
      <div style={styles.card}>
        {ativosComPerformance.map((a, i) => (
          <div
            key={a.id || a.ticker}
            style={{ ...styles.ativoLinha, borderBottom: i === ativosComPerformance.length - 1 ? "none" : `1px solid ${LINE}` }}
          >
            <div style={{ flex: 1 }}>
              <div style={styles.ativoTicker}>{a.ticker}</div>
              <div style={styles.ativoNome}>{a.nome}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  ...styles.variacaoNum,
                  color: a.variacaoAnoPct == null ? SUBTLE : a.variacaoAnoPct >= 0 ? COLOR_UP : COLOR_DOWN,
                }}
              >
                {a.variacaoAnoPct == null ? "—" : formatPct(a.variacaoAnoPct)}
              </div>
              <div style={styles.ativoValor}>{formatBRL(a.valor)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

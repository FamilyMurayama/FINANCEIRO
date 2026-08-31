import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Link2, RefreshCw, Bell, WifiOff } from "lucide-react";
import { styles, CLASSES, formatBRL, formatPct, COLOR_UP, COLOR_DOWN, COLOR_UP_BG, COLOR_DOWN_BG, LINE } from "./shared.js";

export default function CarteiraPage({ ativos, usandoDemo, online, bancosConectados, onRecarregar, onAbrirConexoes }) {
  const patrimonioTotal = useMemo(() => ativos.reduce((s, a) => s + a.valor, 0), [ativos]);
  const variacaoDiaValor = useMemo(
    () => ativos.reduce((s, a) => s + a.valor * (a.variacaoAtual / 100), 0),
    [ativos]
  );
  const variacaoDiaPct = patrimonioTotal ? (variacaoDiaValor / patrimonioTotal) * 100 : 0;

  const dadosPizza = useMemo(() => {
    return CLASSES.map((c) => {
      const total = ativos.filter((a) => a.classe === c.key).reduce((s, a) => s + a.valor, 0);
      return { ...c, valor: total, pct: patrimonioTotal ? (total / patrimonioTotal) * 100 : 0 };
    }).filter((c) => c.valor > 0);
  }, [ativos, patrimonioTotal]);

  const maioresMovimentos = useMemo(
    () => [...ativos].sort((a, b) => Math.abs(b.variacaoAtual) - Math.abs(a.variacaoAtual)).slice(0, 3),
    [ativos]
  );

  return (
    <div>
      {usandoDemo && (
        <div style={styles.avisoDemo}>
          <WifiOff size={13} />
          {bancosConectados.length === 0
            ? "Nenhum banco conectado ainda — exibindo carteira de exemplo."
            : "Conta conectada, mas sem investimentos retornados ainda."}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>PATRIMÔNIO TOTAL</div>
          <div style={styles.totalValor}>{formatBRL(patrimonioTotal)}</div>
          <div style={{ ...styles.variacaoDia, color: variacaoDiaValor >= 0 ? COLOR_UP : COLOR_DOWN }}>
            {variacaoDiaValor >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {formatBRL(Math.abs(variacaoDiaValor))} ({formatPct(variacaoDiaPct)}) hoje
          </div>
        </div>
        <button style={styles.iconBtn} onClick={onAbrirConexoes}>
          <Link2 size={18} color="#0B1220" />
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.donutWrap}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={dadosPizza}
                dataKey="valor"
                nameKey="label"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={3}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {dadosPizza.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.donutCenter}>
            <div style={styles.donutCenterLabel}>ALOCAÇÃO</div>
            <div style={styles.donutCenterValue}>{dadosPizza.length} classes</div>
          </div>
        </div>

        <div style={styles.legendaGrid}>
          {[...dadosPizza].sort((a, b) => b.valor - a.valor).map((d) => (
            <div key={d.key} style={styles.legendaItem}>
              <span style={{ ...styles.dot, background: d.color }} />
              <span style={styles.legendaLabel}>{d.label}</span>
              <span style={styles.legendaPct}>{d.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionHeaderRow}>
        <div style={styles.sectionTitle}>
          <Bell size={14} style={{ marginRight: 6 }} />
          MAIORES MOVIMENTOS
        </div>
        <button style={styles.liveTag} onClick={onRecarregar}>
          <RefreshCw size={11} />
          {online ? "ao vivo" : "tentar de novo"}
        </button>
      </div>
      <div style={styles.card}>
        {maioresMovimentos.map((a, i) => (
          <AlertaLinha key={a.id || a.ticker} ativo={a} isLast={i === maioresMovimentos.length - 1} />
        ))}
      </div>

      <div style={styles.sectionHeaderRow}>
        <div style={styles.sectionTitle}>SEUS ATIVOS</div>
      </div>
      <div style={styles.card}>
        {CLASSES.map((c) => {
          const doGrupo = ativos.filter((a) => a.classe === c.key);
          if (doGrupo.length === 0) return null;
          return (
            <div key={c.key} style={{ marginBottom: 18 }}>
              <div style={styles.grupoLabel}>
                <span style={{ ...styles.dot, background: c.color }} />
                {c.label}
              </div>
              {doGrupo.map((a, i) => (
                <AtivoLinha key={a.id || a.ticker} ativo={a} isLast={i === doGrupo.length - 1} />
              ))}
            </div>
          );
        })}
      </div>

      <div style={styles.rodape}>
        <RefreshCw size={12} />
        {usandoDemo ? "carteira de exemplo" : `${bancosConectados.length} conta(s) conectada(s)`}
      </div>
    </div>
  );
}

function AlertaLinha({ ativo, isLast }) {
  const subiu = ativo.variacaoAtual >= 0;
  return (
    <div style={{ ...styles.alertaLinha, borderBottom: isLast ? "none" : `1px solid ${LINE}` }}>
      <div style={{ ...styles.alertaIcone, background: subiu ? COLOR_UP_BG : COLOR_DOWN_BG }}>
        {subiu ? <ArrowUpRight size={16} color={COLOR_UP} /> : <ArrowDownRight size={16} color={COLOR_DOWN} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={styles.ativoTicker}>{ativo.ticker}</div>
        <div style={styles.ativoNome}>{ativo.nome}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ ...styles.variacaoNum, color: subiu ? COLOR_UP : COLOR_DOWN }}>
          {formatPct(ativo.variacaoAtual)}
        </div>
        <div style={styles.ativoValor}>{formatBRL(ativo.valor)}</div>
      </div>
    </div>
  );
}

function AtivoLinha({ ativo, isLast }) {
  const subiu = ativo.variacaoAtual >= 0;
  return (
    <div style={{ ...styles.ativoLinha, borderBottom: isLast ? "none" : `1px solid ${LINE}` }}>
      <div style={{ flex: 1 }}>
        <div style={styles.ativoTicker}>{ativo.ticker}</div>
        <div style={styles.ativoNome}>
          {ativo.nome} · <span style={{ opacity: 0.7 }}>{ativo.corretora}</span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={styles.ativoValor}>{formatBRL(ativo.valor)}</div>
        <div style={{ ...styles.variacaoNumSmall, color: subiu ? COLOR_UP : COLOR_DOWN }}>
          {subiu ? "▲" : "▼"} {formatPct(ativo.variacaoAtual)}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Trash2, Plus, Loader2 } from "lucide-react";
import { API_BASE_URL, styles, SUBTLE, LINE, PAPER, COLOR_UP, COLOR_DOWN } from "./shared.js";

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ticker, setTicker] = useState("");
  const [tipo, setTipo] = useState("acao");
  const [limiteQueda, setLimiteQueda] = useState("-5");
  const [limiteAlta, setLimiteAlta] = useState("5");

  const carregar = useCallback(() => {
    setCarregando(true);
    fetch(`${API_BASE_URL}/alerts`)
      .then((r) => r.json())
      .then((data) => setAlertas(data))
      .catch(() => setAlertas([]))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(e) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setSalvando(true);
    try {
      await fetch(`${API_BASE_URL}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          tipo,
          limiteQuedaPct: Number(limiteQueda),
          limiteAltaPct: Number(limiteAlta),
        }),
      });
      setTicker("");
      setLimiteQueda("-5");
      setLimiteAlta("5");
      setMostrarForm(false);
      carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(tickerAlvo) {
    setAlertas((prev) => prev.filter((a) => a.ticker !== tickerAlvo));
    await fetch(`${API_BASE_URL}/alerts/${tickerAlvo}`, { method: "DELETE" });
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>ALERTAS DE PREÇO</div>
          <div style={{ ...styles.totalValor, fontSize: 22 }}>
            {alertas.length} {alertas.length === 1 ? "ativo monitorado" : "ativos monitorados"}
          </div>
        </div>
        <button style={styles.iconBtn} onClick={() => setMostrarForm(true)}>
          <Plus size={18} />
        </button>
      </div>

      <div style={styles.avisoDemo}>
        Verificação a cada 5 minutos. Hoje o aviso aparece nos logs do backend — ainda não envia
        notificação para o celular.
      </div>

      <div style={styles.sectionHeaderRow}>
        <div style={styles.sectionTitle}>SEUS ALERTAS</div>
      </div>

      <div style={styles.card}>
        {carregando ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20, color: SUBTLE }}>
            <Loader2 size={18} className="girando" />
          </div>
        ) : alertas.length === 0 ? (
          <div style={{ fontSize: 13, color: SUBTLE, textAlign: "center", padding: "12px 0" }}>
            Nenhum alerta configurado ainda. Toque em "+" para criar o primeiro.
          </div>
        ) : (
          alertas.map((a, i) => (
            <div
              key={a.ticker}
              style={{
                ...styles.alertaLinha,
                borderBottom: i === alertas.length - 1 ? "none" : `1px solid ${LINE}`,
              }}
            >
              <div style={{ ...styles.alertaIcone, background: "rgba(212,175,122,0.12)" }}>
                <Bell size={16} color="#D4AF7A" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.ativoTicker}>{a.ticker}</div>
                <div style={styles.ativoNome}>
                  <span style={{ color: COLOR_DOWN }}>{a.limiteQuedaPct}%</span>
                  {"  /  "}
                  <span style={{ color: COLOR_UP }}>+{a.limiteAltaPct}%</span>
                </div>
              </div>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: SUBTLE }}
                onClick={() => remover(a.ticker)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {mostrarForm && (
        <div style={styles.modalOverlay} onClick={() => setMostrarForm(false)}>
          <form style={styles.modalCard} onClick={(e) => e.stopPropagation()} onSubmit={salvar}>
            <div style={styles.modalTitulo}>Novo alerta</div>
            <div style={styles.modalSubtitulo}>Avisa quando o ativo passar dos limites abaixo.</div>

            <label style={{ fontSize: 12, color: SUBTLE, display: "block", marginBottom: 6 }}>
              Ticker (ex: PETR4, BTCBRL)
            </label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="PETR4"
              style={campoEstilo}
              autoCapitalize="characters"
            />

            <label style={{ fontSize: 12, color: SUBTLE, display: "block", margin: "14px 0 6px" }}>
              Tipo
            </label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={campoEstilo}>
              <option value="acao">Ação</option>
              <option value="fii">FII</option>
              <option value="cripto">Cripto</option>
            </select>

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: SUBTLE, display: "block", marginBottom: 6 }}>
                  Avisar se cair (%)
                </label>
                <input
                  type="number"
                  value={limiteQueda}
                  onChange={(e) => setLimiteQueda(e.target.value)}
                  style={campoEstilo}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: SUBTLE, display: "block", marginBottom: 6 }}>
                  Avisar se subir (%)
                </label>
                <input
                  type="number"
                  value={limiteAlta}
                  onChange={(e) => setLimiteAlta(e.target.value)}
                  style={campoEstilo}
                />
              </div>
            </div>

            <button type="submit" disabled={salvando} style={styles.fecharBtn}>
              {salvando ? "Salvando..." : "Salvar alerta"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              style={{ ...styles.fecharBtn, background: "transparent", color: PAPER, border: `1px solid ${LINE}`, marginTop: 8 }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const campoEstilo = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  padding: "10px 12px",
  color: PAPER,
  fontSize: 14,
  boxSizing: "border-box",
};

// ---------------------------------------------------------------------------
// Configuração e design tokens compartilhados por todas as telas do app.
// ---------------------------------------------------------------------------
// Em produção, defina VITE_API_BASE_URL nas variáveis de ambiente do Vercel
// (ex: https://seu-backend.onrender.com/api). Sem isso, usa localhost — bom
// para desenvolver na sua máquina.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api";
export const PLUGGY_CONNECT_SCRIPT_URL = "https://cdn.pluggy.ai/pluggy-connect/latest/pluggy-connect.js";
export const CLASSES = [
  { key: "acoes", label: "Ações", color: "#E8604C" },
  { key: "fiis", label: "FIIs", color: "#D4AF7A" },
  { key: "rendafixa", label: "Renda Fixa", color: "#2DD4BF" },
  { key: "tesouro", label: "Tesouro Direto", color: "#6E9BD9" },
  { key: "cripto", label: "Cripto", color: "#9B7FD4" },
];

export const INK = "#0B1220";
export const PAPER = "#F6F4EF";
export const SUBTLE = "#8A8F98";
export const LINE = "#2A3242";
export const COLOR_UP = "#2DD4BF";
export const COLOR_UP_BG = "rgba(45,212,191,0.12)";
export const COLOR_DOWN = "#E8604C";
export const COLOR_DOWN_BG = "rgba(232,96,76,0.12)";
export const GOLD = "#D4AF7A";

export function formatBRL(v) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function formatPct(v) {
  const sinal = v > 0 ? "+" : "";
  return `${sinal}${(v ?? 0).toFixed(2)}%`;
}
export function formatData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export const fontImports = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
.girando { animation: girar 1s linear infinite; }
@keyframes girar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export const styles = {
  page: {
    minHeight: "100vh",
    background: INK,
    color: PAPER,
    fontFamily: "'Inter', sans-serif",
    padding: "20px 16px 96px",
    maxWidth: 480,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  avisoDemo: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(212,175,122,0.12)", border: `1px solid ${LINE}`, color: GOLD,
    fontSize: 12, padding: "10px 12px", borderRadius: 12, marginBottom: 16, lineHeight: 1.4,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: "0.12em", color: SUBTLE, fontWeight: 600, marginBottom: 6 },
  totalValor: { fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 600, lineHeight: 1.1 },
  variacaoDia: { display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 },
  iconBtn: { background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}`, borderRadius: 12, padding: 10, cursor: "pointer" },
  card: { background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}`, borderRadius: 20, padding: 18, marginBottom: 20 },
  donutWrap: { position: "relative" },
  donutCenter: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" },
  donutCenterLabel: { fontSize: 10, letterSpacing: "0.1em", color: SUBTLE, fontWeight: 600 },
  donutCenterValue: { fontFamily: "'Fraunces', serif", fontSize: 16, marginTop: 4 },
  legendaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: 8 },
  legendaItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  legendaLabel: { flex: 1, color: PAPER },
  legendaPct: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: SUBTLE },
  sectionHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingLeft: 4 },
  sectionTitle: { fontSize: 11, letterSpacing: "0.1em", fontWeight: 700, color: SUBTLE, display: "flex", alignItems: "center" },
  liveTag: { fontSize: 11, color: COLOR_UP, display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", padding: 0 },
  alertaLinha: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0" },
  alertaIcone: { width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  grupoLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: SUBTLE, marginBottom: 8, letterSpacing: "0.02em" },
  ativoLinha: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0" },
  ativoTicker: { fontSize: 14, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" },
  ativoNome: { fontSize: 12, color: SUBTLE, marginTop: 2 },
  ativoValor: { fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" },
  variacaoNum: { fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 },
  variacaoNumSmall: { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 },
  rodape: { display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 11, color: SUBTLE, marginTop: 8 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 },
  modalCard: { background: "#111827", width: "100%", maxWidth: 480, borderRadius: "24px 24px 0 0", padding: 22, border: `1px solid ${LINE}` },
  modalTitulo: { fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 4 },
  modalSubtitulo: { fontSize: 13, color: SUBTLE, marginBottom: 18 },
  bancoLinha: { display: "flex", alignItems: "center", gap: 12, width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, padding: "12px 0", cursor: "pointer", color: PAPER },
  bancoBadge: { width: 30, height: 30, borderRadius: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  conectadoTag: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLOR_UP },
  fecharBtn: { width: "100%", marginTop: 18, background: PAPER, color: INK, border: "none", borderRadius: 14, padding: "14px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" },

  // Navegação por abas (fixa no rodapé)
  tabBar: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480, display: "flex", background: "#0F1626",
    borderTop: `1px solid ${LINE}`, padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
  },
  tabBtn: (ativo) => ({
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    background: "transparent", border: "none", cursor: "pointer",
    color: ativo ? PAPER : SUBTLE, fontSize: 11, padding: "4px 0",
  }),

  // Proventos
  proventoLinha: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0" },
  proventoTipoTag: (cor) => ({
    fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: cor,
    background: `${cor}22`, borderRadius: 6, padding: "3px 7px", textTransform: "uppercase",
  }),

  // Rendimento anual
  resumoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  resumoCard: { background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}`, borderRadius: 16, padding: 14 },
  resumoLabel: { fontSize: 10, letterSpacing: "0.08em", color: SUBTLE, fontWeight: 600, marginBottom: 6 },
  resumoValor: { fontFamily: "'Fraunces', serif", fontSize: 20 },
  barraFundo: { background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 8, overflow: "hidden" },
  barraPreenchida: (pct, cor) => ({ width: `${Math.min(100, Math.abs(pct))}%`, background: cor, height: "100%" }),
};

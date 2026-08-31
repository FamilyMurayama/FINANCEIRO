// Armazenamento em memória para simplificar o exemplo.
// Em produção, troque por um banco (Postgres, SQLite, etc.) por usuário.

const alertas = new Map();

export function listarAlertas() {
  return Array.from(alertas.values());
}

export function salvarAlerta({ ticker, tipo, limiteQuedaPct = -3, limiteAltaPct = 5 }) {
  const alerta = { ticker: ticker.toUpperCase(), tipo, limiteQuedaPct, limiteAltaPct };
  alertas.set(alerta.ticker, alerta);
  return alerta;
}

export function removerAlerta(ticker) {
  alertas.delete(ticker.toUpperCase());
}

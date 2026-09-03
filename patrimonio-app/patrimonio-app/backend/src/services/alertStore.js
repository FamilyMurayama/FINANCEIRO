import axios from "axios";

const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(path) {
  const { data } = await axios.get(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return data.result;
}

export async function listarAlertas() {
  if (!BASE || !TOKEN) return [];
  const tickers = (await redis(`/smembers/alertas:tickers`)) || [];
  if (tickers.length === 0) return [];
  const valores = await Promise.all(tickers.map((t) => redis(`/get/alerta:${t}`)));
  return valores.filter(Boolean).map((v) => JSON.parse(v));
}

export async function salvarAlerta({ ticker, tipo, limiteQuedaPct = -3, limiteAltaPct = 5 }) {
  const alerta = { ticker: ticker.toUpperCase(), tipo, limiteQuedaPct, limiteAltaPct };
  await redis(`/sadd/alertas:tickers/${alerta.ticker}`);
  await redis(`/set/alerta:${alerta.ticker}/${encodeURIComponent(JSON.stringify(alerta))}`);
  return alerta;
}

export async function removerAlerta(ticker) {
  const t = ticker.toUpperCase();
  await redis(`/srem/alertas:tickers/${t}`);
  await redis(`/del/alerta:${t}`);
}

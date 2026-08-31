import { Router } from "express";
import axios from "axios";
import crypto from "crypto";

const router = Router();
const BASE_URL = "https://api.binance.com";

// ---------------------------------------------------------------------------
// GET /api/binance/prices?symbols=BTCBRL,ETHBRL
// Endpoint PÚBLICO — não precisa de API key. Bom para mostrar cotação em tempo real.
// ---------------------------------------------------------------------------
router.get("/prices", async (req, res) => {
  const symbols = (req.query.symbols || "BTCBRL").toString().split(",");

  try {
    const requisicoes = symbols.map((symbol) =>
      axios.get(`${BASE_URL}/api/v3/ticker/24hr`, { params: { symbol: symbol.trim() } })
    );
    const respostas = await Promise.all(requisicoes);

    const resultado = respostas.map((r) => ({
      symbol: r.data.symbol,
      preco: parseFloat(r.data.lastPrice),
      variacaoPct: parseFloat(r.data.priceChangePercent),
      maxima24h: parseFloat(r.data.highPrice),
      minima24h: parseFloat(r.data.lowPrice),
    }));

    res.json(resultado);
  } catch (err) {
    res.status(502).json({ error: "Falha ao consultar Binance", detalhe: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/binance/balance
// Endpoint PRIVADO — exige BINANCE_API_KEY e BINANCE_API_SECRET no .env
// Use uma chave "somente leitura" (sem permissão de saque/trade).
// Retorna os ativos com saldo > 0 na conta Spot.
// ---------------------------------------------------------------------------
router.get("/balance", async (_req, res) => {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(400).json({
      error: "Configure BINANCE_API_KEY e BINANCE_API_SECRET no .env para ver o saldo real.",
    });
  }

  try {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = crypto.createHmac("sha256", apiSecret).update(query).digest("hex");

    const { data } = await axios.get(`${BASE_URL}/api/v3/account`, {
      params: { timestamp, signature },
      headers: { "X-MBX-APIKEY": apiKey },
    });

    const saldosComValor = (data.balances || []).filter(
      (b) => parseFloat(b.free) + parseFloat(b.locked) > 0
    );

    res.json(
      saldosComValor.map((b) => ({
        ativo: b.asset,
        disponivel: parseFloat(b.free),
        bloqueado: parseFloat(b.locked),
      }))
    );
  } catch (err) {
    res.status(502).json({
      error: "Falha ao consultar saldo na Binance. Confira as chaves e o IP liberado.",
      detalhe: err.response?.data || err.message,
    });
  }
});

export default router;

import { Router } from "express";
import axios from "axios";

const router = Router();

// GET /api/quotes?tickers=PETR4,ITSA4,MXRF11,HGLG11
router.get("/", async (req, res) => {
  const tickers = (req.query.tickers || "").toString();
  if (!tickers) return res.status(400).json({ error: "Informe ?tickers=PETR4,MXRF11" });

  try {
    const { data } = await axios.get(
      `https://brapi.dev/api/quote/${encodeURIComponent(tickers)}`,
      { params: { token: process.env.BRAPI_TOKEN } }
    );

    const resultado = (data.results || []).map((a) => ({
      ticker: a.symbol,
      nome: a.longName || a.shortName,
      preco: a.regularMarketPrice,
      variacaoPct: a.regularMarketChangePercent,
      variacaoValor: a.regularMarketChange,
      moeda: a.currency,
      atualizadoEm: a.regularMarketTime,
    }));

    res.json(resultado);
  } catch (err) {
    res.status(502).json({ error: "Falha ao consultar brapi.dev", detalhe: err.message });
  }
});

export default router;

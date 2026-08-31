import { Router } from "express";
import axios from "axios";

const router = Router();

// GET /api/performance?tickers=PETR4,MXRF11
// Calcula a variação do ano (YTD) de cada ativo usando o histórico de preços
// da brapi.dev (range=ytd). Cripto não passa por aqui — ver /api/binance.
router.get("/", async (req, res) => {
  const tickers = (req.query.tickers || "").toString().split(",").filter(Boolean);
  if (tickers.length === 0) return res.status(400).json({ error: "Informe ?tickers=PETR4,MXRF11" });

  try {
    const requisicoes = tickers.map((ticker) =>
      axios
        .get(`https://brapi.dev/api/quote/${ticker}`, {
          params: { token: process.env.BRAPI_TOKEN, range: "ytd", interval: "1mo" },
        })
        .then((r) => ({ ticker, resultado: r.data.results?.[0] }))
        .catch(() => ({ ticker, resultado: null }))
    );

    const respostas = await Promise.all(requisicoes);

    const performance = respostas.map(({ ticker, resultado }) => {
      const historico = resultado?.historicalDataPrice || [];
      const precoInicioAno = historico[0]?.close;
      const precoAtual = resultado?.regularMarketPrice;
      const variacaoAnoPct =
        precoInicioAno && precoAtual ? ((precoAtual - precoInicioAno) / precoInicioAno) * 100 : null;

      return { ticker, variacaoAnoPct, precoInicioAno: precoInicioAno ?? null, precoAtual: precoAtual ?? null };
    });

    res.json(performance);
  } catch (err) {
    res.status(502).json({ error: "Falha ao calcular rentabilidade do ano", detalhe: err.message });
  }
});

export default router;

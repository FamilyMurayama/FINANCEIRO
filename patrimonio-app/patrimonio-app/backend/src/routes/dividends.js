import { Router } from "express";
import axios from "axios";

const router = Router();

// GET /api/dividends?tickers=PETR4,MXRF11
// Usa o módulo "dividends" da brapi.dev, que traz o histórico de proventos
// pagos (dividendo, JCP, rendimento de FII) por ativo.
router.get("/", async (req, res) => {
  const tickers = (req.query.tickers || "").toString().split(",").filter(Boolean);
  if (tickers.length === 0) return res.status(400).json({ error: "Informe ?tickers=PETR4,MXRF11" });

  try {
    const requisicoes = tickers.map((ticker) =>
      axios
        .get(`https://brapi.dev/api/quote/${ticker}`, {
          params: { token: process.env.BRAPI_TOKEN, dividends: "true" },
        })
        .then((r) => ({ ticker, resultado: r.data.results?.[0] }))
        .catch(() => ({ ticker, resultado: null }))
    );

    const respostas = await Promise.all(requisicoes);

    const proventos = respostas.flatMap(({ ticker, resultado }) => {
      const historico = resultado?.dividendsData?.cashDividends || [];
      return historico.map((d) => ({
        ticker,
        tipo: d.label || "Provento", // ex: "DIVIDENDO", "JCP", "RENDIMENTO"
        valorPorCota: d.rate,
        dataComData: d.lastDatePriorEx, // data-com (precisa ter o ativo até aqui)
        dataPagamento: d.paymentDate,
      }));
    });

    // Mais recente primeiro
    proventos.sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));

    res.json(proventos);
  } catch (err) {
    res.status(502).json({ error: "Falha ao consultar proventos", detalhe: err.message });
  }
});

export default router;

import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
const router = Router();

// GET /api/dividends?tickers=PETR4,MXRF11
// Fonte: fundamentus.com.br (scraping da página pública de proventos).
// Não exige token, mas é sensível a mudanças no layout do site.
async function buscarProventosFundamentus(ticker) {
  const url = `https://www.fundamentus.com.br/proventos.php?papel=${ticker}&tipo=2`;
  const { data: html } = await axios.get(url, {
    headers: {
      // Fundamentus bloqueia requisições sem um User-Agent de navegador
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(html);
  const proventos = [];

  $("table.data tbody tr").each((_, linha) => {
    const colunas = $(linha).find("td").map((__, td) => $(td).text().trim()).get();
    // Colunas típicas: [Data, Valor, Data de Pagamento, Tipo] — pode variar
    if (colunas.length >= 3) {
      const [dataComData, valorTexto, dataPagamento, tipo] = colunas;
      const valorPorCota = parseFloat(valorTexto.replace(",", "."));
      if (!isNaN(valorPorCota)) {
        proventos.push({
          ticker,
          tipo: tipo || "Provento",
          valorPorCota,
          dataComData,
          dataPagamento: dataPagamento || dataComData,
        });
      }
    }
  });

  return proventos;
}

router.get("/", async (req, res) => {
  const tickers = (req.query.tickers || "").toString().split(",").filter(Boolean);
  if (tickers.length === 0) return res.status(400).json({ error: "Informe ?tickers=PETR4,MXRF11" });

  try {
    const requisicoes = tickers.map((ticker) =>
      buscarProventosFundamentus(ticker).catch((e) => {
        console.error(`Erro ao buscar proventos de ${ticker} (Fundamentus):`, e.message);
        return [];
      })
    );
    const resultados = await Promise.all(requisicoes);
    const proventos = resultados.flat();

    proventos.sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));
    res.json(proventos);
  } catch (err) {
    res.status(502).json({ error: "Falha ao consultar proventos", detalhe: err.message });
  }
});

export default router;

import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
const router = Router();

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
};

// Ações: tabela costuma vir como Data-com | Valor | Data Pagamento | Tipo
async function buscarProventosAcao(ticker) {
  const url = `https://www.fundamentus.com.br/proventos.php?papel=${ticker}&tipo=2`;
  const { data: html } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
  const $ = cheerio.load(html);
  const proventos = [];

  $("table.data tbody tr").each((_, linha) => {
    const colunas = $(linha).find("td").map((__, td) => $(td).text().trim()).get();
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

// FIIs: tabela vem como Última Data Com | Tipo | Data de Pagamento | Valor
async function buscarProventosFii(ticker) {
  const url = `https://www.fundamentus.com.br/fii_proventos.php?papel=${ticker}&tipo=2`;
  const { data: html } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
  const $ = cheerio.load(html);
  const proventos = [];

  $("table tbody tr").each((_, linha) => {
    const colunas = $(linha).find("td").map((__, td) => $(td).text().trim()).get();
    if (colunas.length >= 4) {
      const [dataComData, tipo, dataPagamento, valorTexto] = colunas;
      const valorPorCota = parseFloat(valorTexto.replace(",", "."));
      if (!isNaN(valorPorCota)) {
        proventos.push({
          ticker,
          tipo: tipo || "Rendimento",
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
  // classes[i] corresponde a tickers[i] — "acoes" ou "fiis". Se não vier, assume ação.
  const classes = (req.query.classes || "").toString().split(",");

  if (tickers.length === 0) return res.status(400).json({ error: "Informe ?tickers=PETR4,MXRF11" });

  try {
    const requisicoes = tickers.map((ticker, i) => {
      const classe = classes[i];
      const buscar = classe === "fiis" ? buscarProventosFii : buscarProventosAcao;
      return buscar(ticker).catch((e) => {
        console.error(`Erro ao buscar proventos de ${ticker} (Fundamentus, ${classe || "acoes"}):`, e.message);
        return [];
      });
    });
    const resultados = await Promise.all(requisicoes);
    const proventos = resultados.flat();

    proventos.sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));
    res.json(proventos);
  } catch (err) {
    res.status(502).json({ error: "Falha ao consultar proventos", detalhe: err.message });
  }
});

export default router;

import express from "express";
import cors from "cors";
import "dotenv/config";

import quotesRouter from "./routes/quotes.js";
import binanceRouter from "./routes/binance.js";
import bankRouter from "./routes/bank.js";
import alertsRouter from "./routes/alerts.js";
import dividendsRouter from "./routes/dividends.js";
import performanceRouter from "./routes/performance.js";
import { startAlertWatcher } from "./services/alertWatcher.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/quotes", quotesRouter);     // ações e FIIs (brapi.dev)
app.use("/api/binance", binanceRouter);   // cripto (Binance)
app.use("/api/bank", bankRouter);         // contas bancárias (Pluggy / Open Finance)
app.use("/api/alerts", alertsRouter);     // limites de alerta configurados pelo usuário
app.use("/api/dividends", dividendsRouter); // proventos (dividendos, JCP, rendimentos de FII)
app.use("/api/performance", performanceRouter); // rentabilidade do ano (YTD) por ativo

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  startAlertWatcher(); // verifica variações periodicamente e dispara alertas
});

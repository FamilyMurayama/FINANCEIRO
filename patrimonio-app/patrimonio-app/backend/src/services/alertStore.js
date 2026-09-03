import { Router } from "express";
import { listarAlertas, salvarAlerta, removerAlerta } from "../services/alertStore.js";

const router = Router();

// GET /api/alerts — lista os limites configurados
router.get("/", async (_req, res) => {
  res.json(await listarAlertas());
});

// POST /api/alerts
// body: { ticker: "PETR4", tipo: "acao" | "cripto", limiteQuedaPct: -3, limiteAltaPct: 5 }
router.post("/", async (req, res) => {
  const { ticker, tipo, limiteQuedaPct, limiteAltaPct } = req.body;
  if (!ticker || !tipo) return res.status(400).json({ error: "ticker e tipo são obrigatórios" });

  const alerta = await salvarAlerta({ ticker, tipo, limiteQuedaPct, limiteAltaPct });
  res.status(201).json(alerta);
});

// DELETE /api/alerts/:ticker
router.delete("/:ticker", async (req, res) => {
  await removerAlerta(req.params.ticker);
  res.status(204).send();
});

export default router;

import { Router } from "express";
import axios from "axios";

const router = Router();
const PLUGGY_URL = "https://api.pluggy.ai";

async function getPluggyApiKey() {
  const { data } = await axios.post(`${PLUGGY_URL}/auth`, {
    clientId: process.env.PLUGGY_CLIENT_ID,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET,
  });
  return data.apiKey;
}

// POST /api/bank/connect-token
// Gera o token de conexão que o app usa para abrir o widget do Pluggy
// (o usuário escolhe o banco — Inter, Nubank, etc. — e faz login lá dentro).
router.post("/connect-token", async (_req, res) => {
  try {
    const apiKey = await getPluggyApiKey();
    const { data } = await axios.post(
      `${PLUGGY_URL}/connect_token`,
      {},
      { headers: { "X-API-KEY": apiKey } }
    );
    res.json({ connectToken: data.accessToken });
  } catch (err) {
    res.status(502).json({ error: "Falha ao gerar token do Pluggy", detalhe: err.message });
  }
});

// GET /api/bank/accounts/:itemId
// Depois que o usuário conecta o banco, o Pluggy retorna um itemId.
// Use-o aqui para buscar contas, saldos e investimentos daquela instituição.
router.get("/accounts/:itemId", async (req, res) => {
  try {
    const apiKey = await getPluggyApiKey();
    const { data } = await axios.get(`${PLUGGY_URL}/accounts`, {
      params: { itemId: req.params.itemId },
      headers: { "X-API-KEY": apiKey },
    });
    res.json(data.results);
  } catch (err) {
    res.status(502).json({ error: "Falha ao buscar contas", detalhe: err.message });
  }
});

// GET /api/bank/investments/:itemId
router.get("/investments/:itemId", async (req, res) => {
  try {
    const apiKey = await getPluggyApiKey();
    const { data } = await axios.get(`${PLUGGY_URL}/investments`, {
      params: { itemId: req.params.itemId },
      headers: { "X-API-KEY": apiKey },
    });
    res.json(data.results);
  } catch (err) {
    res.status(502).json({ error: "Falha ao buscar investimentos", detalhe: err.message });
  }
});

export default router;

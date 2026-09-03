import cron from "node-cron";
import axios from "axios";
import { listarAlertas } from "./alertStore.js";

async function dispararNotificacao(alerta, variacaoAtual) {
  const direcao = variacaoAtual <= alerta.limiteQuedaPct ? "caiu" : "subiu";
  const texto =
    `🔔 ALERTA: ${alerta.ticker} ${direcao} ${variacaoAtual.toFixed(2)}% ` +
    `(limite configurado: queda ${alerta.limiteQuedaPct}% / alta ${alerta.limiteAltaPct}%)`;
  console.log(texto);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

    try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: texto,
    });
  } catch (err) {
    console.error("Erro ao enviar notificação no Telegram:", err.message);
  }
}

async function checarAcoesEFiis(alertasAcoes) {
  if (alertasAcoes.length === 0) return;
  const tickers = alertasAcoes.map((a) => a.ticker).join(",");
  try {
    const { data } = await axios.get(`http://localhost:${process.env.PORT || 3333}/api/quotes`, {
      params: { tickers },
    });
    data.forEach((cotacao) => {
      const alerta = alertasAcoes.find((a) => a.ticker === cotacao.ticker);
      if (!alerta) return;
      if (cotacao.variacaoPct <= alerta.limiteQuedaPct || cotacao.variacaoPct >= alerta.limiteAltaPct) {
        await dispararNotificacao(alerta, cotacao.variacaoPct);
      }
    });
  } catch (err) {
    console.error("Erro ao checar ações/FIIs:", err.message);
  }
}

async function checarCripto(alertasCripto) {
  if (alertasCripto.length === 0) return;
  const symbols = alertasCripto.map((a) => a.ticker).join(",");
  try {
    const { data } = await axios.get(`http://localhost:${process.env.PORT || 3333}/api/binance/prices`, {
      params: { symbols },
    });
    data.forEach((preco) => {
      const alerta = alertasCripto.find((a) => a.ticker === preco.symbol);
      if (!alerta) return;
      if (preco.variacaoPct <= alerta.limiteQuedaPct || preco.variacaoPct >= alerta.limiteAltaPct) {
        await dispararNotificacao(alerta, preco.variacaoPct);
      }
    });
  } catch (err) {
    console.error("Erro ao checar cripto:", err.message);
  }
}

export function startAlertWatcher() {
  // Roda a cada 5 minutos. Ajuste conforme o limite de chamadas das APIs usadas.
  cron.schedule("*/5 * * * *", async () => {
    const alertas = await listarAlertas();
    await checarAcoesEFiis(alertas.filter((a) => a.tipo === "acao" || a.tipo === "fii"));
    await checarCripto(alertas.filter((a) => a.tipo === "cripto"));
  });
}

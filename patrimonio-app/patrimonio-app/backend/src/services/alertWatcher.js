import cron from "node-cron";
import axios from "axios";
import { listarAlertas } from "./alertStore.js";

// Troque por push notification real (Firebase Cloud Messaging / OneSignal)
// ou envio de e-mail/SMS quando um limite é ultrapassado.
function dispararNotificacao(alerta, variacaoAtual) {
  const direcao = variacaoAtual <= alerta.limiteQuedaPct ? "caiu" : "subiu";
  console.log(
    `🔔 ALERTA: ${alerta.ticker} ${direcao} ${variacaoAtual.toFixed(2)}% ` +
      `(limite configurado: queda ${alerta.limiteQuedaPct}% / alta ${alerta.limiteAltaPct}%)`
  );
  // TODO: enviar push notification real para o app do usuário aqui
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
        dispararNotificacao(alerta, cotacao.variacaoPct);
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
        dispararNotificacao(alerta, preco.variacaoPct);
      }
    });
  } catch (err) {
    console.error("Erro ao checar cripto:", err.message);
  }
}

export function startAlertWatcher() {
  // Roda a cada 5 minutos. Ajuste conforme o limite de chamadas das APIs usadas.
  cron.schedule("*/5 * * * *", async () => {
    const alertas = listarAlertas();
    await checarAcoesEFiis(alertas.filter((a) => a.tipo === "acao" || a.tipo === "fii"));
    await checarCripto(alertas.filter((a) => a.tipo === "cripto"));
  });
}

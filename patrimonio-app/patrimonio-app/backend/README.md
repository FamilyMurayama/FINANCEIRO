# Backend — App de Patrimônio

Backend em Node/Express com três integrações:

| Fonte | O que traz | Precisa de chave? |
|---|---|---|
| **Pluggy** (Open Finance) | Saldos e investimentos de Inter, Nubank, Rico, XP etc. | Sim — `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` (grátis para testar em [pluggy.ai](https://pluggy.ai)) |
| **brapi.dev** | Cotações de ações e FIIs (B3) | Token gratuito em [brapi.dev](https://brapi.dev) |
| **Binance** | Preço de criptos em tempo real (`/prices`) e saldo da carteira (`/balance`) | `/prices` não precisa. `/balance` precisa de API key **somente leitura** |

## Como rodar

```bash
cp .env.example .env
# preencha as chaves no .env
npm install
npm run dev
```

## Endpoints principais

- `GET /api/quotes?tickers=PETR4,MXRF11` — cotações de ações/FIIs
- `GET /api/binance/prices?symbols=BTCBRL,ETHBRL` — preços cripto (público)
- `GET /api/binance/balance` — saldo real da sua conta Binance (precisa de chave)
- `POST /api/bank/connect-token` — gera o link para o usuário conectar o banco dele
- `GET /api/bank/investments/:itemId` — investimentos daquele banco, após conectado
- `POST /api/alerts` — cadastra um alerta, ex: `{ "ticker": "PETR4", "tipo": "acao", "limiteQuedaPct": -3, "limiteAltaPct": 5 }`
- `POST /api/alerts` cripto, ex: `{ "ticker": "BTCBRL", "tipo": "cripto", "limiteQuedaPct": -5, "limiteAltaPct": 8 }`

A cada 5 minutos (`alertWatcher.js`) o servidor confere as variações e, se algum ativo passar do limite, dispara uma notificação (hoje só um `console.log` — trocar por push notification real, ex. Firebase Cloud Messaging).

## Segurança da chave da Binance

Crie a API key em **binance.com → Configurações → API Management** com:
- ✅ Permitir leitura
- ❌ Desmarcar "Enable Spot & Margin Trading"
- ❌ Desmarcar qualquer permissão de saque

Assim, mesmo se a chave vazar, ninguém consegue mexer no seu dinheiro — só ver o saldo.

## Próximos passos sugeridos

1. Trocar o `alertStore.js` em memória por um banco de dados real (associado ao usuário logado)
2. Adicionar autenticação de usuários (ex. JWT) para múltiplas pessoas usarem o mesmo backend
3. Conectar o front-end (`App.jsx`) a esses endpoints no lugar dos dados simulados
4. Trocar o `console.log` do alerta por push notification (Firebase Cloud Messaging / OneSignal)

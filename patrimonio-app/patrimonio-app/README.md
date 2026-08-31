# App de Patrimônio

Projeto com duas partes que rodam separadas:

```
projeto/
├── backend/    → API Node/Express (bancos, cotações, Binance, alertas)
└── frontend/   → App React (o que você vê na tela)
```

## 1. Suba o backend primeiro

```bash
cd backend
cp .env.example .env
# edite o .env e preencha ao menos o BRAPI_TOKEN (grátis em brapi.dev)
npm install
npm run dev
```

Ele sobe em `http://localhost:3333`. Teste no navegador: `http://localhost:3333/api/health` deve responder `{"ok":true}`.

## 2. Suba o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Ele sobe em `http://localhost:5173`. Abra esse endereço no navegador.

## 3. Ver no celular

O `vite.config.js` já está com `host: true`. Com o computador e o celular na
**mesma rede Wi-Fi**:

1. Descubra o IP do computador (`ipconfig` no Windows, `ifconfig` ou `ip a` no Mac/Linux — procure algo como `192.168.0.x`)
2. No celular, abra `http://SEU_IP:5173`
3. Troque também `API_BASE_URL` em `frontend/src/shared.js` de `localhost` para esse mesmo IP, senão o celular não vai achar o backend

## Sem chaves configuradas?

Sem problema — o app detecta que o backend não respondeu e cai automaticamente
no **modo demonstração**, com uma carteira de exemplo, só pra você ver a
interface funcionando enquanto configura as integrações reais com calma.

## Próximo passo real: colocar isso no ar de verdade

Rodar local (`npm run dev`) é ótimo para testar. Para usar no dia a dia fora
de casa, o backend precisa estar hospedado em algum lugar (Render, Railway,
Fly.io são opções simples e com plano gratuito) e o frontend também
publicado (Vercel ou Netlify resolvem isso em poucos cliques). Nesse ponto
também vale voltar no `README.md` do backend e revisar a lista de "próximos
passos" (autenticação de usuário, banco de dados para alertas, desligar o
sandbox do Pluggy).

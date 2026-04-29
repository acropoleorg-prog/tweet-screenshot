# tweet-screenshot

API que converte o embed HTML de um tweet em uma imagem PNG — sem precisar da API oficial do X/Twitter.

## Como funciona

1. Você cola o HTML do "Copy embed" do X
2. A API extrai os dados (texto, autor, data)
3. Renderiza um template visual idêntico ao X
4. Tira um screenshot com Puppeteer e devolve a imagem PNG

---

## Uso

### Endpoint

```
POST /screenshot
Content-Type: application/json

{
  "embed": "<blockquote class=\"twitter-tweet\">...</blockquote> <script async src=\"https://platform.twitter.com/widgets.js\"></script>"
}
```

### Resposta

Imagem PNG binária (`Content-Type: image/png`).

### Exemplo com curl

```bash
curl -X POST https://sua-url.railway.app/screenshot \
  -H "Content-Type: application/json" \
  -d '{"embed": "<blockquote class=\"twitter-tweet\"><p lang=\"pt\" dir=\"ltr\">Texto do tweet</p>&mdash; Nome (@handle) <a href=\"https://twitter.com/handle/status/123\">June 8, 2023</a></blockquote>"}' \
  --output tweet.png
```

---

## Deploy no Railway (recomendado)

1. Crie uma conta em [railway.app](https://railway.app)
2. Clique em **New Project → Deploy from GitHub repo**
3. Conecte este repositório
4. Railway detecta automaticamente o `package.json` e faz o deploy
5. Vá em **Settings → Networking → Generate Domain** para obter sua URL pública

> O Railway fornece $5/mês de crédito gratuito, suficiente para uso editorial.

## Deploy no Render

1. Crie uma conta em [render.com](https://render.com)
2. **New → Web Service → Connect GitHub repo**
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Free tier disponível

---

## Rodar localmente

```bash
npm install
npm start
# API disponível em http://localhost:3000
```

---

## Estrutura

```
tweet-screenshot/
├── server.js              # Express app + rotas
├── src/
│   ├── parser.js          # Extrai dados do embed HTML
│   └── screenshotter.js   # Puppeteer → PNG
├── templates/
│   └── tweet.html         # Template visual do tweet
└── package.json
```

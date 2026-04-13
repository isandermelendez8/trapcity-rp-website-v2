# 🌐 TRAPCITY RP - Website

Panel de Whitelist y verificación integrado con Discord.

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia `.env.example` a `.env`
2. Completa todas las variables

### Variables obligatorias:

```env
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
DISCORD_GUILD_ID=tu_guild_id
SESSION_SECRET=secreto_muy_seguro
BOT_API_URL=http://localhost:3000
BOT_SECRET=secreto_compartido
```

## 🚀 Iniciar

```bash
npm start
# o
npm run dev
```

## 🌐 Hosting Gratis

### Opción 1: Netlify + Render (Recomendado)

**Website (Frontend): Netlify**
1. Sube código a GitHub
2. netlify.com → Add new site → Import from Git
3. Build settings:
   - Build command: (dejar vacío para static)
   - Publish directory: `public`
4. Para Node.js (SSR), usa Render en su lugar

**Backend: Render**
1. render.com → New Web Service
2. Conecta tu repo
3. Settings:
   - Runtime: Node
   - Build: `npm install`
   - Start: `npm start`
4. Agrega variables de entorno

### Opción 2: Vercel
1. vercel.com
2. Import Git Repository
3. Framework Preset: Other
4. Build Command: `npm install`
5. Output Directory: (default)
6. Agrega variables de entorno

### Opción 3: Railway
1. railway.app
2. New Project → Deploy from GitHub repo
3. Agrega variables de entorno

## 🔗 Discord Developer Portal Setup

1. https://discord.com/developers/applications
2. New Application → nombre del servidor
3. OAuth2 → General:
   - Client ID: copiar para .env
   - Client Secret: copiar para .env
4. OAuth2 → Redirects:
   - Producción: `https://tu-dominio.com/auth/discord/callback`
   - Local: `http://localhost:3000/auth/discord/callback`

## 📁 Estructura

```
├── server.js          # Servidor Express principal
├── database.js        # SQLite
├── questions.js       # 45 preguntas whitelist
├── views/             # Plantillas EJS
│   ├── index.ejs
│   ├── dashboard.ejs
│   ├── quiz.ejs
│   ├── verify.ejs
│   └── ...
└── public/            # Archivos estáticos (CSS, JS, img)
```

## 🎯 Características

- Discord OAuth2 Login
- 45 preguntas de whitelist
- Sistema de evaluación automática
- Verificación con captcha
- Panel de usuario
- Anti-cheat / anti-alt

## 🔒 Seguridad

- Rate limiting (3 intentos/24h)
- Helmet para headers
- Sessions seguras
- Validación de captcha
- Verificación de edad de cuenta Discord

## 📞 Soporte

Contacta a la administración de TRAPCITY RP.

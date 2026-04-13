# 📖 GUÍA COMPLETA DE CONFIGURACIÓN - TRAPCITY RP

## 🎯 Resumen del Proyecto

Este proyecto incluye:
1. **Bot de Discord** - Tickets, Whitelist, Verificación, Logs
2. **Website** - Whitelist web, verificación, panel de usuario
3. **Base de datos** - SQLite (gratis, sin hosting extra)

Todo está diseñado para funcionar **100% GRATIS**.

---

## 📋 Paso 1: Discord Developer Portal

### 1.1 Crear la Aplicación
1. Ve a https://discord.com/developers/applications
2. Click "New Application"
3. Nombre: `TrapCity RP Bot`
4. Acepta términos → Create

### 1.2 Obtener Token
1. Ve a la sección **Bot** (menú izquierda)
2. Click "Reset Token" (o "Copy" si ya existe)
3. Guarda este token: `DISCORD_TOKEN`
4. **IMPORTANTE:** Nunca compartas este token

### 1.3 Habilitar Intents
En la misma página de Bot, habilita:
- ✅ Presence Intent
- ✅ Server Members Intent  
- ✅ Message Content Intent

Guarda los cambios.

### 1.4 Configurar OAuth2
1. Ve a **OAuth2** → General
2. Client ID: Copia para después (`DISCORD_CLIENT_ID`)
3. Client Secret: Click "Reset Secret", copia (`DISCORD_CLIENT_SECRET`)

### 1.5 Agregar Redirects
En **OAuth2** → Redirects, agrega:
```
http://localhost:3000/auth/discord/callback
```
Para producción más tarde:
```
https://tu-dominio.com/auth/discord/callback
```

### 1.6 Generar URL de Invitación
En **OAuth2** → URL Generator:

**Scopes:**
- ✅ bot
- ✅ applications.commands

**Bot Permissions:** (selecciona Administrador para simplificar)
- ✅ Administrator

Copia la URL generada y úsala para invitar el bot a tu servidor.

---

## 🖥️ Paso 2: Preparar Servidor Discord

### 2.1 Crear Canales
Crea estos canales de texto:
- `#whitelist-logs` - Logs de nuevas whitelists
- `#logs` - Logs generales
- `#logs-seguridad` - Logs de verificación
- `#logs-staff` - Acciones de staff
- `#logs-tickets` - Tickets
- `#feedback` - Feedback de tickets
- `#transcripts` - Transcripts de tickets
- `#bienvenida` - Mensajes de bienvenida
- `#verificacion` - Panel de verificación

### 2.2 Crear Categorías (para tickets)
- `📨 Tickets - Donaciones`
- `📨 Tickets - Soporte`
- `📨 Tickets - Gangas`
- `📨 Tickets - Atención Staff`
- `📨 Tickets - Aplicar Staff`
- `📨 Tickets - Reportar Staff`
- `📨 Tickets - Reportes Usuarios`
- `📨 Tickets - Apelaciones`
- `📨 Tickets - Eventos`
- `📨 Tickets - Ayuda Técnica`
- `📨 Tickets - General`

### 2.3 Crear Roles
- `Admin` - Administradores
- `Moderador` - Moderadores
- `Staff` - Staff general
- `No Verificado` - Nuevos usuarios
- `Verificado` - Usuarios verificados
- `Verificado+` - Segundo rol verificado
- `Whitelist` - Whitelist aprobada
- `Whitelist Pendiente` - En proceso

### 2.4 Obtener IDs
Para obtener IDs de canales y roles:
1. Discord → Ajustes de Usuario → Avanzado
2. Activa "Modo Desarrollador"
3. Click derecho en canal/rol → Copiar ID

---

## 🤖 Paso 3: Configurar Bot

### 3.1 Archivo .env

Copia `TrapCity Bot/.env.example` a `.env` y completa:

```env
# Bot
DISCORD_TOKEN=tu_token_aqui

# Servidor
GUILD_ID=id_de_tu_servidor

# Canales
CHANNEL_WHITELIST_LOGS=id
CHANNEL_WELCOME=id
CHANNEL_VERIFY=id
CHANNEL_LOGS=id
CHANNEL_STAFF_LOGS=id
CHANNEL_SECURITY_LOGS=id
CHANNEL_TICKET_LOGS=id
CHANNEL_FEEDBACK=id
CHANNEL_TRANSCRIPTS=id

# Roles
ROLE_ADMIN=id_rol_admin
ROLE_MODERATOR=id_rol_moderador
ROLE_STAFF=id_rol_staff
ROLE_UNVERIFIED=id_rol_no_verificado
ROLE_VERIFIED=id_rol_verificado
ROLE_VERIFIED_2=id_segundo_rol_verificado
ROLE_WHITELISTED=id_rol_whitelist

# Categorías de tickets (IDs de las categorías)
CATEGORY_DONACIONES=id
CATEGORY_SOPORTE=id
CATEGORY_GANGAS=id
CATEGORY_ATENCION_STAFF=id
CATEGORY_APLICAR_STAFF=id
CATEGORY_REPORTAR_STAFF=id
CATEGORY_REPORTES_USUARIOS=id
CATEGORY_APELACIONES=id
CATEGORY_EVENTOS=id
CATEGORY_AYUDA_TECNICA=id
CATEGORY_GENERAL=id

# Seguridad
MIN_ACCOUNT_AGE=7
MAX_ACCOUNT_AGE=14

# Puerto
PORT=3000
```

### 3.2 Instalar Dependencias
```bash
cd "TrapCity Bot"
npm install
```

### 3.3 Iniciar Bot
```bash
npm start
```

Deberías ver:
```
✅ Conectado a SQLite
✅ Tablas de base de datos inicializadas
✅ Bot conectado como TrapCity Bot#XXXX
✅ Comandos slash registrados
🚀 API corriendo en puerto 3000
```

---

## 🌐 Paso 4: Configurar Website

### 4.1 Archivo .env

Copia `TrapCity Website/.env.example` a `.env`:

```env
# Servidor
PORT=3000
NODE_ENV=production

# Discord OAuth (del paso 1.4)
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# Servidor
DISCORD_GUILD_ID=id_guild

# Conexión con Bot
BOT_API_URL=http://localhost:3000
BOT_SECRET=mismo_secreto_en_ambos

# Invite
DISCORD_INVITE=https://discord.gg/tuinvite

# Seguridad
SESSION_SECRET=secreto_muy_largo_y_seguro
CAPTCHA_SECRET=otro_secreto

# Gemini (opcional, para IA)
GEMINI_API_KEY=tu_api_key
```

### 4.2 Instalar
```bash
cd "TrapCity Website"
npm install
```

### 4.3 Iniciar
```bash
npm start
```

Visita: http://localhost:3000

---

## 🚀 Paso 5: Hostear Gratis (Producción)

### 5.1 Bot - Railway (Gratis)

1. Crea cuenta en railway.app
2. New Project → Deploy from GitHub
3. Selecciona tu repositorio con el bot
4. Agrega variables de entorno (mismo .env)
5. Deploy!

URL: `https://trapcity-bot.railway.app`

### 5.2 Website - Netlify (Gratis)

**Opción A: Solo frontend estático**
1. netlify.com → Add new site → Import from Git
2. Selecciona repo de website
3. Deploy!

**Opción B: Con backend (Render)**
1. render.com → New Web Service
2. Conecta repo de website
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Agrega variables de entorno
6. Deploy!

URL: `https://trapcity.onrender.com`

### 5.3 Actualizar URLs

En Discord Developer Portal:
- Agrega nuevo redirect: `https://trapcity.onrender.com/auth/discord/callback`

En el `.env` del website:
```env
DISCORD_REDIRECT_URI=https://trapcity.onrender.com/auth/discord/callback
DISCORD_CALLBACK_URL=https://trapcity.onrender.com/auth/discord/callback
```

En el `.env` del bot:
```env
WEBSITE_URL=https://trapcity.onrender.com
```

---

## 🎮 Paso 6: Uso del Bot

### Comandos de Setup (solo una vez)

1. Ve a tu servidor Discord
2. Escribe: `/test`
   - Si responde, el bot funciona!
3. Escribe: `/ticket panel`
   - El bot enviará el panel de tickets
4. Escribe: `/verificar panel`
   - El bot enviará el panel de verificación

### Panel de Tickets

Cuando un usuario crea un ticket:
1. Selecciona categoría del menú
2. Se crea canal privado
3. Staff reclama con botón
4. Admin cierra con razón
5. Feedback automático (1-5 ⭐)
6. Transcript guardado

### Whitelist

1. Usuario entra a la web
2. Inicia sesión con Discord
3. Completa 45 preguntas
4. Se evalúa automáticamente:
   - 95%+: Aprobado automático
   - 84-94%: Aprobado automático
   - 77-83%: Revisión manual
   - <77%: Rechazado (24h cooldown)
5. Admin revisa en `#whitelist-logs`
6. Botones para Aprobar/Denegar

### Verificación

1. Usuario click en "Verificarme"
2. Recibe link único (10 min expira)
3. Completa captcha en web
4. Bot verifica:
   - Edad cuenta (7-14 días)
   - No VPN
   - No blacklist
5. Asigna roles automáticamente
6. Log en `#logs-seguridad`

---

## 📊 Comandos del Bot

| Comando | Descripción | Permiso |
|---------|-------------|-----------|
| `/test` | Verificar que el bot funciona | Todos |
| `/ticket panel` | Enviar panel de tickets | Admin |
| `/ticket cerrar` | Cerrar ticket con razón | Admin |
| `/verificar panel` | Enviar panel de verificación | Admin |
| `/verificar manual @user` | Verificar manualmente | Admin |
| `/whitelist stats` | Estadísticas | Staff |
| `/whitelist pendientes` | Lista de pendientes | Admin |
| `/embed` | Crear embed personalizado | Admin |
| `/blacklist @user` | Banear y blacklist | Admin |

---

## 🔧 Solución de Problemas

### Bot no responde
1. Verifica `DISCORD_TOKEN`
2. Revisa logs en consola
3. Asegúrate que intents estén habilitados

### Website no conecta con Discord
1. Verifica `DISCORD_CLIENT_ID` y `DISCORD_CLIENT_SECRET`
2. Revisa redirect URLs en Developer Portal
3. Asegúrate que el usuario esté en el servidor

### No se guardan datos
1. Verifica permisos de escritura en carpeta
2. SQLite crea archivos `.db` localmente

### Errores de permisos
1. Bot necesita permiso de Administrador
2. O: Manage Channels, Manage Roles, Send Messages, etc.

---

## 📞 Soporte

Para ayuda adicional, contacta a la administración de TRAPCITY RP.

---

**¡Listo! Tu servidor TRAPCITY RP está configurado.** 🎉


git rm -r --cached node_modules
 
# Agregar solo archivos necesarios
git add .
git commit -m "TrapCity Website v1.0"
git push origin main


git init
git add .
git commit -m "TrapCity Website v1.0"
git branch -M main
git remote add origin https://github.com/isandermelendez8/TrapCity-Website.git
git push -u origin main


git init
git add .
git commit -m "TrapCity Bot v1.0"
git branch -M main
git remote add origin https://github.com/isandermelendez8/trapcity-bot.git
git push -u origin main
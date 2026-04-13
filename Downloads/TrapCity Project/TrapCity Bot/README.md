# 🤖 TRAPCITY RP - Bot de Discord

Bot completo con sistema de Whitelist, Tickets, Verificación anti-alt, Logs y más.

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia `.env.example` a `.env`
2. Completa todas las variables

### Variables obligatorias:

```env
DISCORD_TOKEN=tu_token_aqui
GUILD_ID=tu_servidor_id
ROLE_ADMIN=id_rol_admin
CHANNEL_WHITELIST_LOGS=id_canal
CHANNEL_LOGS=id_canal
CHANNEL_SECURITY_LOGS=id_canal
CHANNEL_TICKET_LOGS=id_canal
```

## 🚀 Comandos Disponibles

### Admin
- `/ticket panel` - Crear panel de tickets
- `/verificar panel` - Crear panel de verificación
- `/verificar manual @usuario` - Verificar manualmente
- `/whitelist stats` - Ver estadísticas
- `/whitelist pendientes` - Ver pendientes
- `/embed` - Crear embed personalizado
- `/blacklist @usuario` - Añadir a blacklist
- `/test` - Probar el bot

### Tickets (vía botones)
- **Panel de Tickets** con 11 categorías:
  - Donaciones, Soporte, Gangas, Atención Staff
  - Aplicar Staff, Reportar Staff, Reportes Usuarios
  - Apelaciones, Eventos, Ayuda Técnica, General

### Verificación
- Anti-alt (7-14 días)
- Captcha web
- Registro de IP
- Auto-roles

## 🏠 Hosting Gratis (Render/Railway)

### Opción 1: Render
1. Sube el código a GitHub
2. Crea cuenta en render.com
3. New Web Service → Connect GitHub
4. Configura:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Agrega variables de entorno

### Opción 2: Railway
1. railway.app
2. New Project → Deploy from GitHub
3. Agrega variables de entorno

## 📝 Permisos del Bot (Discord Developer Portal)

En OAuth2 URL Generator, selecciona:
- `bot`
- `applications.commands`

Scopes:
- `bot`
- `applications.commands`

Bot Permissions:
- Administrador (recomendado)
- O mínimo:
  - Manage Channels
  - Manage Roles
  - Manage Messages
  - View Channels
  - Send Messages
  - Manage Threads
  - Create Public Threads
  - Send Messages in Threads
  - Embed Links
  - Attach Files
  - Read Message History
  - Mention Everyone
  - Add Reactions
  - Use Slash Commands
  - Connect (para voz)
  - Move Members (para voz)

## 🔄 Comandos Slash

El bot registra automáticamente los comandos al iniciar.

Para forzar actualización:
1. Reinicia el bot
2. Espera 1 hora máximo para propagación global

## 🗄️ Base de Datos

Usa SQLite (archivo local `trapcity.db`).
No requiere configuración adicional.

## 📞 Soporte

Para soporte contacta a la administración de TRAPCITY RP.

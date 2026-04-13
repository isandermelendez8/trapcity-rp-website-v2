# 🤖 Configurar Perfil del Bot (Avatar, Descripción, Botón)

Estas configuraciones se hacen en el **Discord Developer Portal**, no en el código.

---

## 🖼️ 1. Cambiar Avatar del Bot

1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación "TrapCity RP Bot"
3. Ve a **Bot** (menú izquierda)
4. En la sección "ICON", click en el icono actual
5. Sube la imagen del logo:
   - URL del logo: `https://cdn.discordapp.com/attachments/1492740367571751004/1492774859913039902/image.png?ex=69dc8e6d&is=69db3ced&hm=05c58bfd5e1aa6297d596f111a580d2aaab1d683b5c34a83662fc2b3e6a757e4`
6. Descarga primero la imagen y súbela, o usa una imagen local
7. Guarda los cambios

---

## 📝 2. Configurar "About Me" (Descripción del Bot)

Esta es la descripción que aparece cuando alguien ve el perfil del bot:

1. En el Developer Portal, ve a **General Information**
2. Busca el campo **DESCRIPTION**
3. Escribe:
```
TrapCity RP Official Bot - Sistema de Whitelist, Tickets y Verificación.

🔗 Únete ahora: https://discord.gg/rBGef6NUuf
```
4. Guarda los cambios

---

## 🔘 3. Agregar Botón "JOIN DISCORD NOW"

Para que aparezca un botón en el perfil del bot:

1. Ve a **OAuth2** → **URL Generator** (no, esto es para invites)
2. En realidad, los botones de perfil se configuran en **Rich Presence** o a través de **Connections**

### Método correcto: App Directory

Discord ahora usa el **App Directory** para botones:

1. Ve a **App Directory** → **Enable Discovery** (si está disponible)
2. O ve a **OAuth2** → **Default Authorization Link**
3. Selecciona **In-app OAuth Link**
4. Configura el enlace de invitación

### Alternativa (Botón visible para todos):

El botón de "Add to Server" aparece automáticamente. Para un botón personalizado de "Join Discord":

**Opción A: En embeds del bot**
Los embeds que envía el bot pueden tener botones. Ya está implementado en el código:
- Panel de verificación tiene botón "Verificarme"
- Panel de tickets tiene botón "Crear Ticket"

**Opción B: Descripción con link**
En la descripción del bot (paso 2), el enlace ya es clickeable.

---

## 🔗 4. Enlace de Invitación Personalizado

Para crear un enlace de invitación con todos los permisos:

1. Ve a **OAuth2** → **URL Generator**
2. En **SCOPES**, selecciona:
   - ✅ `bot`
   - ✅ `applications.commands`

3. En **BOT PERMISSIONS**, selecciona:
   - ✅ **Administrator** (recomendado para simplificar)

   O si prefieres mínimo:
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
   - Mention @everyone, @here, All Roles
   - Add Reactions
   - Use Slash Commands
   - Connect (voz)
   - Move Members (voz)

4. Copia la URL generada, algo como:
```
https://discord.com/api/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

5. Personaliza el link para que sea más corto:
   - Usa bit.ly o similar, o
   - Comparte directamente: `https://discord.gg/rBGef6NUuf` (invite del servidor)

---

## ✅ Resumen Visual del Bot

Después de configurar todo:

| Elemento | Valor |
|----------|-------|
| **Nombre** | TrapCity RP Bot |
| **Avatar** | Logo del servidor |
| **Status** | 🎮 Playing TrapCity RP *(ya configurado en código)* |
| **Descripción** | TrapCity RP Official Bot - Sistema de Whitelist, Tickets y Verificación. 🔗 Únete ahora: https://discord.gg/rBGef6NUuf |
| **Tag** | Oficial |

---

## 🚀 Verificación

Después de hacer los cambios:

1. Ve a tu servidor Discord
2. Escribe `/test`
3. El bot debe responder con embed mostrando su información
4. Ver el perfil del bot (click en su nombre)
5. Debe mostrar:
   - Avatar personalizado
   - Descripción
   - Botones de interacción

---

## 📝 Nota Importante

Algunos cambios en el Developer Portal pueden tardar **hasta 1 hora** en propagarse por todos los servidores de Discord. Si no ves los cambios inmediatamente, espera unos minutos y reinicia Discord (Ctrl+R).

---

## 🎯 Quick Links

- Discord Developer Portal: https://discord.com/developers/applications
- Invite del servidor: https://discord.gg/rBGef6NUuf
- Logo: [Descargar](https://cdn.discordapp.com/attachments/1492740367571751004/1492774859913039902/image.png?ex=69dc8e6d&is=69db3ced&hm=05c58bfd5e1aa6297d596f111a580d2aaab1d683b5c34a83662fc2b3e6a757e4)

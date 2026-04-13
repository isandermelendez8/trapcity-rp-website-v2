# 🚀 GUÍA DE INSTALACIÓN COMPLETA - TRAPCITY RP

## 📋 ÍNDICE

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Discord Developer Portal](#1-configuración-discord-developer-portal)
3. [Instalación del Bot](#2-instalación-del-bot)
4. [Instalación de la Website](#3-instalación-de-la-website)
5. [Configuración de Variables de Entorno](#4-configuración-de-variables-de-entorno)
6. [Iniciar el Sistema](#5-iniciar-el-sistema)
7. [Configuración Anti-Alt Avanzada](#6-configuración-anti-alt-avanzada)
8. [Solución de Problemas](#7-solución-de-problemas)

---

## REQUISITOS PREVIOS

### Software Necesario:
- ✅ Node.js 18+ (https://nodejs.org)
- ✅ Git (https://git-scm.com)
- ✅ Un editor de código (VS Code recomendado)
- ✅ Cuenta de Discord
- ✅ Cuenta en render.com o railway.app (para hosting gratis)

### Conocimientos Básicos:
- Manejo básico de terminal/consola
- Edición de archivos de texto
- Uso de Discord

---

## 1. CONFIGURACIÓN DISCORD DEVELOPER PORTAL

### Paso 1.1: Crear Aplicación
1. Ve a https://discord.com/developers/applications
2. Click "New Application"
3. Nombre: `TrapCity RP Bot`
4. Click "Create"

### Paso 1.2: Configurar Bot
1. Ve al menú **Bot** (izquierda)
2. Click "Reset Token" → Copia y guarda el token
3. Habilita los 3 switches de **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
4. Click "Save Changes"

### Paso 1.3: Configurar OAuth2
1. Ve al menú **OAuth2** → **General**
2. Copia el **Client ID** (lo necesitarás después)
3. Click "Reset Secret" → Copia el **Client Secret**
4. En "Redirects", agrega:
   ```
   http://localhost:3000/auth/discord/callback
   ```
5. (Para producción agrega también tu dominio)

### Paso 1.4: Configurar Rich Presence (Opcional pero recomendado)
1. Ve al menú **Rich Presence** → **Art Assets**
2. Sube el logo del servidor:
   - Nombre: `trapcity_logo`
   - Imagen: Usa el logo proporcionado
3. Sube icono de estado:
   - Nombre: `online_icon`
   - Imagen: Círculo verde o icono pequeño

### Paso 1.5: Generar URL de Invitación
1. Ve a **OAuth2** → **URL Generator**
2. Selecciona scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Selecciona permisos del bot:
   - ✅ **Administrator** (recomendado para simplificar)
4. Copia la URL generada y úsala para invitar el bot a tu servidor

---

## 2. INSTALACIÓN DEL BOT

### Paso 2.1: Descargar el Código
```bash
# Crear carpeta del proyecto
mkdir TrapCityRP
cd TrapCityRP

# El código ya está creado en la carpeta "TrapCity Bot"
```

### Paso 2.2: Instalar Dependencias
```bash
cd "TrapCity Bot"
npm install
```

Esto instalará todas las librerías necesarias:
- discord.js (bot de Discord)
- sqlite3 (base de datos)
- express (API web)
- axios (peticiones HTTP)
- y más...

### Paso 2.3: Configurar Variables de Entorno
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` con tus datos:
   ```env
   DISCORD_TOKEN=tu_token_aqui
   GUILD_ID=id_de_tu_servidor
   CHANNEL_WHITELIST_LOGS=id_canal
   CHANNEL_LOGS=id_canal
   CHANNEL_SECURITY_LOGS=id_canal
   CHANNEL_TICKET_LOGS=id_canal
   ROLE_ADMIN=id_rol_admin
   ROLE_UNVERIFIED=id_rol_no_verificado
   ROLE_VERIFIED=id_rol_verificado
   ```

   **Cómo obtener los IDs:**
   - Ve a Discord → Ajustes de Usuario → Avanzado
   - Activa "Modo Desarrollador"
   - Click derecho en canal/rol → "Copiar ID"

---

## 3. INSTALACIÓN DE LA WEBSITE

### Paso 3.1: Instalar Dependencias
```bash
cd "../TrapCity Website"
npm install
```

Librerías que se instalarán:
- express (servidor web)
- passport-discord (autenticación Discord)
- ejs (plantillas HTML)
- sqlite3 (base de datos)
- svg-captcha (captcha de verificación)

### Paso 3.2: Configurar Variables de Entorno
1. Copia el archivo:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env`:
   ```env
   DISCORD_CLIENT_ID=tu_client_id
   DISCORD_CLIENT_SECRET=tu_client_secret
   DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
   DISCORD_GUILD_ID=tu_guild_id
   BOT_API_URL=http://localhost:3001
   BOT_SECRET=un_secreto_largo_y_aleatorio
   SESSION_SECRET=otro_secreto_largo_y_aleatorio
   CAPTCHA_SECRET=tercer_secreto_aleatorio
   ```

   **Generar secretos aleatorios:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 4. CONFIGURACIÓN DE VARIABLES DE ENTORNO

### Resumen de Variables Importantes:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Token secreto del bot | `MTQ5Mj...` |
| `DISCORD_CLIENT_ID` | ID de la aplicación Discord | `1492956231306842132` |
| `DISCORD_CLIENT_SECRET` | Secreto de OAuth2 | `sycuayNu4J...` |
| `GUILD_ID` | ID del servidor Discord | `1492720045120557128` |
| `BOT_SECRET` | Secreto compartido bot-website | `G7hT2pL9XcV4mQ8Rk1ZsD5nF0yW6aU3` |
| `SESSION_SECRET` | Secreto para cookies | `U8dF3kLm92QaXzP7sV1bC5rN0wH6YtE4` |
| `CAPTCHA_SECRET` | Secreto para captcha | `9fKx7QvL2mZp8D4sR1cW6yN0uTgH5aJ` |

---

## 5. INICIAR EL SISTEMA

### Paso 5.1: Iniciar el Bot Primero
```bash
cd "TrapCity Bot"
npm start
```

Deberías ver:
```
✅ Conectado a SQLite
✅ Tablas de base de datos inicializadas
✅ Bot conectado como TrapCity RP Bot#XXXX
✅ Comandos slash registrados
🚀 API corriendo en puerto 3001
```

### Paso 5.2: Iniciar la Website (en otra terminal)
```bash
cd "TrapCity Website"
npm start
```

Deberías ver:
```
🚀 Servidor iniciado en puerto 3000
🔗 URL: http://localhost:3000
```

### Paso 5.3: Verificar Funcionamiento
1. Abre tu navegador: http://localhost:3000
2. Deberías ver la página de login de TRAPCITY RP
3. Click en "Iniciar con Discord"
4. Completa el proceso de OAuth
5. ¡Bienvenido al panel!

---

## 6. CONFIGURACIÓN ANTI-ALT AVANZADA

### Sistema de Verificación Implementado:

El bot incluye un sistema anti-alt avanzado que verifica:

| Verificación | Descripción | Acción |
|--------------|-------------|--------|
| **Edad de cuenta** | 7-30 días mínimo | ❌ Rechazo si <7 días |
| **Avatar** | Presencia de foto de perfil | ⚠️ Sospechoso si no tiene |
| **Nombre de usuario** | Detecta patrones generados | ⚠️ Sospechoso si es raro |
| **Actividad previa** | Último mensaje en servidor | ⚠️ Sospechoso si >14 días |
| **IP/Geolocalización** | País, ciudad, región | 📊 Logueado para análisis |
| **Puntuación de riesgo** | 0-100 puntos | 🔍 Revisión manual si >50 |

### Niveles de Riesgo:
- **BAJO** (0-19 puntos): ✅ Verificación automática
- **MEDIO** (20-39 puntos): ✅ Verificación automática con advertencia
- **ALTO** (40-49 puntos): ⚠️ Verificación con supervisión
- **CRÍTICO** (50+ puntos): 🔒 Revisión manual obligatoria

### Factores que aumentan el riesgo:
- Sin avatar: +15 puntos
- Nombre sospechoso (ej: "user123456"): +20 puntos
- Sin actividad previa: +25 puntos
- Sin actividad >14 días: +15 puntos
- Cuenta 7-13 días: +10 puntos

---

## 7. SOLUCIÓN DE PROBLEMAS

### Problema: "Error: Cannot find module"
```bash
# Solución: Reinstalar dependencias
npm install
```

### Problema: "DiscordAPIError: Missing Access"
- Verifica que el bot tenga permiso de Administrador
- Verifica que el bot esté en el servidor correcto
- Verifica el GUILD_ID en .env

### Problema: "Error: Invalid token"
- Ve a Discord Developer Portal → Bot → Reset Token
- Copia el nuevo token al archivo .env
- Reinicia el bot

### Problema: "Website no carga"
- Verifica que el puerto 3000 esté libre
- Verifica que el bot esté corriendo primero
- Verifica la URL de callback en .env

### Problema: "Error de SQLite"
- Verifica permisos de escritura en la carpeta
- Borra el archivo .db y reinicia (se recreará automáticamente)

### Problema: "Rich Presence no aparece"
- Ve a Discord Developer Portal → Rich Presence → Art Assets
- Sube las imágenes con los nombres exactos: `trapcity_logo` y `online_icon`
- Espera 5-10 minutos a que se propague

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs en la consola
2. Verifica todas las variables de entorno
3. Consulta la guía de CONFIGURAR-BOT-PERFIL.md
4. Contacta a la administración de TRAPCITY RP

---

## 🎉 ¡LISTO!

Tu sistema TRAPCITY RP está configurado con:
- ✅ Bot de Discord con tickets, whitelist y logs
- ✅ Website con Discord OAuth y whitelist de 50 preguntas
- ✅ Verificación anti-alt avanzada
- ✅ Base de datos SQLite
- ✅ 53 normativas configuradas
- ✅ Chat con IA (Gemini)

**Próximos pasos:**
1. Configura los canales y roles en tu servidor Discord
2. Invita al bot con el link de OAuth2
3. Usa `/ticket panel` y `/verificar panel` para configurar
4. ¡Comienza a recibir whitelists!

---

© 2026 TRAPCITY RP - Desarrollado por Burlau Development

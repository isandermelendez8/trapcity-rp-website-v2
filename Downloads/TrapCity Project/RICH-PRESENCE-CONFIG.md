# 🎮 Configurar Rich Presence - Imágenes y Botones

## ✅ Código Actualizado

El bot ahora tiene Rich Presence completa con:
- 🎮 **Botón "Unirse al Discord"** → https://discord.gg/rBGef6NUuf
- 🎮 **Botón "Hacer Whitelist"** → Panel de whitelist
- 🖼️ **Imagen grande** - Logo del servidor
- 🖼️ **Imagen pequeña** - Icono de estado
- 📊 **Party size** - Muestra 1/100 jugadores
- ⏱️ **Timestamp** - Tiempo activo

---

## 🖼️ Paso 1: Subir Imágenes en Discord Developer Portal

### 1.1 Ir a Rich Presence → Art Assets

1. Ve a https://discord.com/developers/applications
2. Selecciona "TrapCity RP Bot"
3. Ve a **Rich Presence** → **Art Assets** (en el menú izquierdo)

### 1.2 Subir Imagen Grande (Logo)

1. Click **"Add Image"**
2. Sube el logo del servidor:
   - URL: `https://cdn.discordapp.com/attachments/1492740367571751004/1492774859913039902/image.png`
3. **Nombre de la imagen:** `trapcity_logo`
4. Guarda

### 1.3 Subir Imagen Pequeña (Icono de estado)

1. Click **"Add Image"** otra vez
2. Sube una imagen pequeña (32x32 o 64x64 recomendado):
   - Puede ser un icono verde de "online"
   - O el logo reducido
3. **Nombre de la imagen:** `online_icon`
4. Guarda

---

## 🔧 Paso 2: Configurar URLs (Opcional)

Los botones en el código apuntan a:

| Botón | URL | Descripción |
|-------|-----|-------------|
| 🔗 Unirse al Discord | `https://discord.gg/rBGef6NUuf` | Ya configurado ✓ |
| 🎮 Hacer Whitelist | `https://trapcity.onrender.com/whitelist` | **Cambiar cuando hostees** |

### Cambiar URL de Whitelist:

Si vas a usar otro dominio, edita `bot.js` línea 201-206:

```javascript
buttons: [
    {
        label: '🔗 Unirse al Discord',
        url: 'https://discord.gg/rBGef6NUuf'
    },
    {
        label: '🎮 Hacer Whitelist',
        url: 'https://TU-DOMINIO.com/whitelist'  // <-- Cambiar aquí
    }
]
```

---

## 🎯 Cómo se verá

Cuando alguien vea el perfil del bot verá:

```
🎮 Playing TrapCity RP

[Imagen grande - Logo del servidor]
     TrapCity RP - Servidor Oficial

Servidor activo 🟢        [Botón: Unirse al Discord]
¡Únete al roleplay!       [Botón: Hacer Whitelist]

🟢 Bot Activo (icono pequeño)

Party: 1 of 100
Elapsed: 00:15:30
```

---

## ⚠️ Notas Importantes

### Sobre los botones en Rich Presence:

1. **Son solo visuales** - Al hacer click, abren el navegador con la URL
2. **No funcionan en móvil** - Solo se ven en Discord Desktop/Web
3. **Requieren imágenes** - Si no subes imágenes, los botones pueden no aparecer

### Alternativa: Botones en Embed (Mejor opción)

Si los botones de Rich Presence no funcionan como esperas, ya están implementados **botones interactivos en embeds**:

- `/ticket panel` → Botón "📩 Crear Ticket"
- `/verificar panel` → Botón "🔐 Verificarme"

Estos sí funcionan en todos los dispositivos.

---

## 🚀 Probar

1. Sube las imágenes en Developer Portal
2. Reinicia el bot: `npm start`
3. Ve a un servidor donde esté el bot
4. Click derecho en el bot → Ver perfil
5. Debería mostrar:
   - Imagen del logo
   - Texto "Servidor activo 🟢"
   - Botones clickeables

---

## 🔗 Links Importantes

- **Invite servidor:** https://discord.gg/rBGef6NUuf
- **Developer Portal:** https://discord.com/developers/applications
- **Logo servidor:** https://cdn.discordapp.com/attachments/1492740367571751004/1492774859913039902/image.png

---

## 📝 Solución de Problemas

### Los botones no aparecen:
- Asegúrate de subir las imágenes en Art Assets
- Los nombres deben ser exactos: `trapcity_logo` y `online_icon`

### La imagen no se ve:
- La imagen debe ser PNG o JPG
- Tamaño recomendado: 512x512 o 1024x1024 para large
- Tamaño recomendado: 64x64 para small

### Los botones no funcionan:
- Son solo visuales, deben abrir navegador
- En móvil no aparecen los botones de Rich Presence (normal)
- Usa los botones de embed como alternativa

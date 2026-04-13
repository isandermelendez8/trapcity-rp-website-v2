# 📋 COMANDOS DEL BOT TRAPCITY RP

## 🛠️ Comandos Slash (/)

### Configuración Inicial
| Comando | Descripción | Uso | Permiso |
|---------|-------------|-----|---------|
| `/test` | Verificar que el bot funciona correctamente | `/test` | Todos |
| `/ticket panel` | Crear panel de tickets en el canal actual | `/ticket panel` | Admin |
| `/verificar panel` | Crear panel de verificación en el canal actual | `/verificar panel` | Admin |

### Gestión de Tickets
| Comando | Descripción | Uso | Permiso |
|---------|-------------|-----|---------|
| `/ticket cerrar [razón]` | Cerrar ticket con razón obligatoria | `/ticket cerrar razón:Problema resuelto` | Admin |

### Gestión de Verificación
| Comando | Descripción | Uso | Permiso |
|---------|-------------|-----|---------|
| `/verificar manual @usuario` | Verificar manualmente a un usuario | `/verificar manual usuario:@juan` | Admin |

### Gestión de Whitelist
| Comando | Descripción | Uso | Permiso |
|---------|-------------|-----|---------|
| `/whitelist stats` | Ver estadísticas de whitelists | `/whitelist stats` | Staff |
| `/whitelist pendientes` | Listar whitelists pendientes | `/whitelist pendientes` | Admin |

### Utilidades
| Comando | Descripción | Uso | Permiso |
|---------|-------------|-----|---------|
| `/embed [título] [descripción] [color?] [imagen?]` | Crear embed personalizado | `/embed titulo:Bienvenida descripcion:Hola a todos color:#8B5CF6` | Admin |
| `/blacklist @usuario [razón] [servidor?]` | Blacklistear y banear usuario | `/blacklist usuario:@hackerman razon:Uso de cheats servidor:OtroSV` | Admin |

---

## 🎫 Sistema de Tickets (Botones)

Cuando un usuario crea un ticket, aparecen botones:

| Botón | Descripción | Permiso |
|-------|-------------|---------|
| `📋 Reclamar Ticket` | Asigna el ticket a un staff | Staff |
| `🔒 Cerrar Ticket` | Inicia proceso de cierre con modal para razón | Admin |

### Categorías de Tickets Disponibles:
1. **💰 Donaciones** - Gestión de donaciones y beneficios
2. **🆘 Soporte** - Ayuda general y problemas
3. **🏢 Gangas** - Solicitud de abrir/cerrar ganga
4. **👔 Atención Staff** - Contactar al staff
5. **📝 Aplicar Staff** - Postulación para staff
6. **🚨 Reportar Staff** - Reportar miembro de staff
7. **👤 Reportes de Usuarios** - Reportar un usuario
8. **⚖️ Apelaciones** - Apelar ban o sanciones
9. **🎉 Eventos** - Proponer/consultar evento
10. **🔧 Ayuda Técnica** - Problemas del servidor/FiveM
11. **❓ General** - Consultas generales

---

## ✅ Sistema de Verificación (Botones)

En el panel de verificación:

| Botón | Descripción |
|-------|-------------|
| `🔐 Verificarme` | Genera link único de verificación web |

---

## 📝 Sistema de Whitelist (Botones)

En los logs de whitelist:

| Botón | Descripción | Permiso |
|-------|-------------|---------|
| `✅ Aprobar` | Aprueba whitelist Fase 1, asigna rol, notifica DM | Admin |
| `❌ Denegar` | Deniega whitelist con razón obligatoria, notifica DM | Admin |
| `📋 Ver Respuestas` | Muestra las 10 primeras respuestas del usuario | Admin |

---

## ⭐ Sistema de Feedback (Botones)

Cuando se cierra un ticket:

| Botón | Descripción |
|-------|-------------|
| `⭐` | Calificar atención: 1 estrella |
| `⭐⭐` | Calificar atención: 2 estrellas |
| `⭐⭐⭐` | Calificar atención: 3 estrellas |
| `⭐⭐⭐⭐` | Calificar atención: 4 estrellas |
| `⭐⭐⭐⭐⭐` | Calificar atención: 5 estrellas |

---

## 🔧 Comandos de Desarrollo

| Comando | Descripción | Permiso |
|---------|-------------|---------|
| `/rename [nombre]` | Renombrar ticket (solo cambia categoría, número no cambia) | Admin |

---

## 📊 Resumen de Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Todos los comandos + cerrar tickets + blacklist |
| **Moderador** | Ver stats, reclamar tickets, verificar manual |
| **Staff** | Ver stats, reclamar tickets |
| **Usuario** | Crear tickets, iniciar verificación, hacer whitelist |

---

## 📝 Notas Importantes

1. **Solo los Admin pueden cerrar tickets** - El botón de cerrar solo aparece para el rol Admin configurado en `.env`

2. **Feedback obligatorio** - Al cerrar un ticket, el usuario tiene 25 segundos para calificar antes de que se borre el canal

3. **Transcript automático** - Se guarda automáticamente en el canal configurado

4. **Logs de todo** - El bot registra: mensajes eliminados, ediciones, entradas/salidas, cambios de rol, bans, kicks, acciones de staff

5. **Auto-roles** - Al verificar, el bot quita "No Verificado" y agrega los dos roles de verificado automáticamente

---

## 🚀 Comandos de Prueba Rápida

Para probar todo el sistema:

```
1. /test
2. /ticket panel
3. /verificar panel
4. (Crea un ticket de prueba)
5. (Reclama el ticket)
6. (Cierra el ticket con razón)
```

---

## 🔗 Comandos API (para Website)

El bot también expone endpoints HTTP:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/whitelist/submit` | POST | Recibe nueva whitelist de la web |
| `/api/verify` | POST | Verifica token de verificación |
| `/api/user/:id` | GET | Obtiene datos de usuario Discord |
| `/api/stats` | GET | Estadísticas de whitelist |

---

**Total de comandos implementados: 10 slash commands + 6 botones de acción**

require('dotenv').config();

module.exports = {
    // Discord
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    GUILD_ID: process.env.GUILD_ID,
    
    // Canales
    channels: {
        whitelistLogs: process.env.CHANNEL_WHITELIST_LOGS,
        welcome: process.env.CHANNEL_WELCOME,
        verify: process.env.CHANNEL_VERIFY,
        logs: process.env.CHANNEL_LOGS,
        staffLogs: process.env.CHANNEL_STAFF_LOGS,
        securityLogs: process.env.CHANNEL_SECURITY_LOGS,
        ticketLogs: process.env.CHANNEL_TICKET_LOGS,
        feedback: process.env.CHANNEL_FEEDBACK,
        transcripts: process.env.CHANNEL_TRANSCRIPTS,
        statsTotal: process.env.CHANNEL_STATS_TOTAL,
        statsBots: process.env.CHANNEL_STATS_BOTS,
        statsWhitelist: process.env.CHANNEL_STATS_WHITELIST
    },
    
    // Roles
    roles: {
        admin: process.env.ROLE_ADMIN,
        moderator: process.env.ROLE_MODERATOR,
        staff: process.env.ROLE_STAFF,
        unverified: process.env.ROLE_UNVERIFIED,
        verified: process.env.ROLE_VERIFIED,
        verified2: process.env.ROLE_VERIFIED_2,
        whitelisted: process.env.ROLE_WHITELISTED,
        pending: process.env.ROLE_PENDING
    },
    
    // Categorías de tickets
    ticketCategories: {
        donaciones: process.env.CATEGORY_DONACIONES,
        soporte: process.env.CATEGORY_SOPORTE,
        gangas: process.env.CATEGORY_GANGAS,
        atencionStaff: process.env.CATEGORY_ATENCION_STAFF,
        aplicarStaff: process.env.CATEGORY_APLICAR_STAFF,
        reportarStaff: process.env.CATEGORY_REPORTAR_STAFF,
        reportesUsuarios: process.env.CATEGORY_REPORTES_USUARIOS,
        apelaciones: process.env.CATEGORY_APELACIONES,
        eventos: process.env.CATEGORY_EVENTOS,
        ayudaTecnica: process.env.CATEGORY_AYUDA_TECNICA,
        general: process.env.CATEGORY_GENERAL
    },
    
    // Colores de embeds (formato hexadecimal)
    colors: {
        main: 0x8B5CF6,      // Violeta principal
        success: 0x10B981,  // Verde
        error: 0xEF4444,    // Rojo
        warning: 0xF59E0B,  // Amarillo
        info: 0x3B82F6,     // Azul
        purple: 0x8B5CF6,   // Violeta
        pink: 0xEC4899      // Rosa
    },
    
    // Seguridad
    security: {
        minAccountAge: parseInt(process.env.MIN_ACCOUNT_AGE) || 7,
        maxAccountAge: parseInt(process.env.MAX_ACCOUNT_AGE) || 14
    },
    
    // API
    PORT: process.env.PORT || 3000,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
};

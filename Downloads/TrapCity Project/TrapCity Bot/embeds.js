const { EmbedBuilder } = require('discord.js');
const config = require('./config');

// Color principal violeta
const MAIN_COLOR = config.colors.main;

class Embeds {
    // EMBED DE TICKET - Todas las categorías usan el mismo formato
    static ticketOpened(ticketId, user, category, questions) {
        const categoryNames = {
            donaciones: '💰 Donaciones',
            soporte: '🆘 Soporte',
            gangas: '🏢 Gangas',
            atencionStaff: '👔 Atención Staff',
            aplicarStaff: '📝 Aplicar Staff',
            reportarStaff: '🚨 Reportar Staff',
            reportesUsuarios: '👤 Reportes de Usuarios',
            apelaciones: '⚖️ Apelaciones',
            eventos: '🎉 Eventos',
            ayudaTecnica: '🔧 Ayuda Técnica',
            general: '❓ General'
        };

        return new EmbedBuilder()
            .setTitle(`Ticket #${ticketId} — ${categoryNames[category] || category}`)
            .setDescription(
                `Hola 👋\n` +
                `<@${user.id}>, bienvenido a tu ticket.\n\n` +
                `Por favor responde las siguientes preguntas:\n` +
                questions.map((q, i) => `${i + 1}. ${q}`).join('\n') +
                `\n\n📎 Adjunta evidencias si las tienes.\n` +
                `El staff te atenderá lo antes posible.`
            )
            .addFields(
                { name: 'Usuario', value: `<@${user.id}>`, inline: true },
                { name: 'ID del Ticket', value: `#${ticketId}`, inline: true },
                { name: 'Categoría', value: categoryNames[category] || category, inline: true },
                { name: 'Estado', value: '🟢 Abierto', inline: true },
                { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setColor(MAIN_COLOR)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'TRAPCITY RP • Sistema de Tickets', iconURL: null })
            .setTimestamp();
    }

    // EMBED DE CIERRE DE TICKET
    static ticketClosed(ticketId, user, admin, reason, duration) {
        return new EmbedBuilder()
            .setTitle('🔒 Ticket Cerrado')
            .setDescription(`Tu ticket ha sido cerrado.`)
            .addFields(
                { name: 'Ticket', value: `#${ticketId}`, inline: true },
                { name: 'Cerrado por', value: `<@${admin.id}>`, inline: true },
                { name: 'Razón', value: reason || 'No especificada', inline: false },
                { name: 'Duración', value: duration || 'N/A', inline: true }
            )
            .setColor(config.colors.error)
            .setFooter({ text: `TRAPCITY RP • ${new Date().toLocaleString('es-ES')}` })
            .setTimestamp();
    }

    // EMBED DE FEEDBACK SOLICITADO
    static feedbackRequest(ticketId) {
        return new EmbedBuilder()
            .setTitle('⭐ ¿Cómo fue tu experiencia?')
            .setDescription(
                `Tu ticket #${ticketId} ha sido cerrado.\n\n` +
                `Por favor califica la atención recibida del 1 al 5 ⭐\n` +
                `Tienes 25 segundos para responder.`
            )
            .setColor(config.colors.warning)
            .setFooter({ text: 'Reacciona con ⭐ para calificar'});
    }

    // EMBED DE VERIFICACIÓN DEL SERVIDOR
    static verification() {
        return new EmbedBuilder()
            .setTitle('✅ VERIFICACIÓN DEL SERVIDOR')
            .setDescription('Bienvenido a **TRAPCITY RP**\nPara acceder al servidor debes verificarte.')
            .addFields(
                { 
                    name: '📋 Requisitos obligatorios:', 
                    value: 
                        '• Tu cuenta debe tener **mínimo 7 días** de antigüedad\n' +
                        '• Tu cuenta debe tener **máximo 14 días** (anti-alt)\n' +
                        '• Tu cuenta debe tener **teléfono verificado**\n' +
                        '• Tu cuenta debe tener **correo verificado**'
                },
                { 
                    name: '📊 Al verificarte registramos:', 
                    value: 
                        '• Dirección IP, país y región\n' +
                        '• Fecha y hora de verificación\n' +
                        '• Edad y datos de tu cuenta\n' +
                        '• Historial de blacklist'
                },
                { 
                    name: '⚠️ Aviso', 
                    value: 'Al hacer clic aceptas el registro de estos datos con fines de seguridad.' 
                }
            )
            .setColor(MAIN_COLOR)
            .setFooter({ text: 'TRAPCITY RP • Sistema de Verificación | Anti Alt Account' })
            .setTimestamp();
    }

    // EMBED DE LOG DE VERIFICACIÓN
    static verificationLog(user, data) {
        return new EmbedBuilder()
            .setTitle('✅ Usuario Verificado')
            .setDescription(`<@${user.id}> se ha verificado correctamente.`)
            .addFields(
                { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true },
                { name: '📅 Cuenta creada', value: data.accountCreated || 'Desconocida', inline: true },
                { name: '📍 País', value: data.country || 'Desconocido', inline: true },
                { name: '🌎 Región', value: data.region || 'Desconocida', inline: true },
                { name: '🏙️ Ciudad', value: data.city || 'Desconocida', inline: true },
                { name: '🛡️ IP', value: data.ip || 'No registrada', inline: false },
                { name: '⏰ Verificado', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            )
            .setColor(config.colors.success)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'TRAPCITY RP • Log de Seguridad' })
            .setTimestamp();
    }

    // EMBED DE WHITELIST - Fase 1 Completada
    static whitelistSubmitted(user, score, time, correct) {
        return new EmbedBuilder()
            .setTitle('📝 Nueva Whitelist - Fase 1')
            .setDescription(`**Usuario:** ${user.tag}\n**Discord ID:** ${user.id}`)
            .addFields(
                { name: '📊 Score', value: `${score}%`, inline: true },
                { name: '✅ Correctas', value: `${correct}/45`, inline: true },
                { name: '⏱️ Tiempo', value: time, inline: true },
                { name: '📋 Estado', value: '⏳ Pendiente de revisión', inline: false }
            )
            .setColor(MAIN_COLOR)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'TRAPCITY RP • Sistema de Whitelist' })
            .setTimestamp();
    }

    // EMBED DE WHITELIST APROBADA
    static whitelistApproved(user, admin) {
        return new EmbedBuilder()
            .setTitle('✅ Whitelist Aprobada')
            .setDescription(`¡Felicidades! Tu whitelist ha sido aprobada.`)
            .addFields(
                { name: '👤 Usuario', value: `<@${user.id}>`, inline: true },
                { name: '✅ Aprobado por', value: `<@${admin.id}>`, inline: true },
                { name: '🎉 Siguiente paso', value: 'Ya puedes ingresar al servidor de FiveM', inline: false }
            )
            .setColor(config.colors.success)
            .setFooter({ text: 'TRAPCITY RP • Whitelist Aprobada' })
            .setTimestamp();
    }

    // EMBED DE WHITELIST DENEGADA
    static whitelistDenied(user, admin, reason) {
        return new EmbedBuilder()
            .setTitle('❌ Whitelist Denegada')
            .setDescription(`Tu solicitud de whitelist ha sido denegada.`)
            .addFields(
                { name: '👤 Usuario', value: `<@${user.id}>`, inline: true },
                { name: '❌ Denegado por', value: `<@${admin.id}>`, inline: true },
                { name: '📝 Razón', value: reason || 'No especificada', inline: false },
                { name: '⏰ Reintento', value: 'Puedes volver a intentarlo en 24 horas', inline: false }
            )
            .setColor(config.colors.error)
            .setFooter({ text: 'TRAPCITY RP • Whitelist Denegada' })
            .setTimestamp();
    }

    // EMBED DE BIENVENIDA
    static welcome(user, memberCount) {
        return new EmbedBuilder()
            .setTitle('¡Bienvenido/a a TRAPCITY RP!')
            .setDescription(
                `Nos alegra tenerte aquí en nuestra comunidad de roleplay, <@${user.id}>.\n\n` +
                `**Antes de empezar, es obligatorio que:**\n` +
                `• Leas todas las reglas del servidor\n` +
                `• Respetes a todos los jugadores y staff\n` +
                `• Mantengas el rol en todo momento\n` +
                `• Elijas bien tu personaje y disfrutes la experiencia\n\n` +
                `**IMPORTANTE PARA ENTRAR AL RP:**\n` +
                `Para poder jugar en el servidor necesitas pasar por el proceso de whitelist.\n` +
                `1. Verifícate en el canal de verificación\n` +
                `2. Dirígete a #whitelist\n` +
                `3. Completa el formulario\n\n` +
                `Aquí podrás ser lo que quieras: civil, policía, EMS, criminal o cualquier rol que construyas con tu historia.\n\n` +
                `¡Prepárate para vivir una experiencia de roleplay seria, divertida y realista!`
            )
            .setColor(MAIN_COLOR)
            .setImage('https://media.discordapp.net/attachments/.../banner.png') // Opcional: URL del banner
            .setFooter({ text: `🎉 Miembro #${memberCount} • TRAPCITY RP` })
            .setTimestamp();
    }

    // EMBED DE PANEL DE TICKETS
    static ticketPanel() {
        return new EmbedBuilder()
            .setTitle('🎫 Sistema de Tickets')
            .setDescription(
                `**Bienvenido/a**\n` +
                `Si necesitas ayuda, estás en el lugar correcto.\n` +
                `Nuestro equipo de staff está disponible para asistirte.\n\n` +
                `**¿Cómo funciona?**\n` +
                `1️⃣ Selecciona la categoría que corresponda a tu situación\n` +
                `2️⃣ Responde las preguntas del formulario con detalle\n` +
                `3️⃣ Se creará un ticket privado donde el staff te atenderá\n\n` +
                `**📎 Puedes adjuntar:**\n` +
                `• Imágenes • Videos • Evidencia • Enlaces\n\n` +
                `**⚠️ Reglas:**\n` +
                `• Explica tu problema con claridad\n` +
                `• No hagas spam de tickets\n` +
                `• Mantén el respeto en todo momento\n` +
                `• Tickets sin información pueden cerrarse automáticamente\n\n` +
                `🔴 **Si la información proporcionada es falsa, recibirás una sanción que puede incluir ban o eliminación de whitelist.**`
            )
            .setColor(MAIN_COLOR)
            .setFooter({ text: 'TRAPCITY RP • Selecciona una categoría abajo' })
            .setTimestamp();
    }

    // EMBED DE TRANSCRIPT
    static transcript(ticketId, data) {
        return new EmbedBuilder()
            .setTitle(`📄 Transcript - Ticket #${ticketId}`)
            .setDescription(`Transcript del ticket cerrado.`)
            .addFields(
                { name: 'Aberto por', value: `<@${data.userId}>`, inline: true },
                { name: 'Categoría', value: data.category, inline: true },
                { name: 'Cerrado por', value: `<@${data.closedBy}>`, inline: true },
                { name: 'Razón', value: data.reason || 'No especificada', inline: false },
                { name: 'Duración', value: data.duration || 'N/A', inline: true },
                { name: 'Mensajes', value: data.messageCount?.toString() || '0', inline: true }
            )
            .setColor(config.colors.info)
            .setFooter({ text: `TRAPCITY RP • ${new Date().toLocaleString('es-ES')}` })
            .setTimestamp();
    }

    // EMBED DE LOG GENERAL
    static log(type, user, action, details) {
        const colors = {
            'message_delete': config.colors.error,
            'message_edit': config.colors.warning,
            'role_add': config.colors.success,
            'role_remove': config.colors.error,
            'member_join': config.colors.success,
            'member_leave': config.colors.error,
            'ban': config.colors.error,
            'kick': config.colors.warning,
            'whitelist_approve': config.colors.success,
            'whitelist_deny': config.colors.error
        };

        const emojis = {
            'message_delete': '🗑️',
            'message_edit': '✏️',
            'role_add': '➕',
            'role_remove': '➖',
            'member_join': '👋',
            'member_leave': '🚪',
            'ban': '🔨',
            'kick': '👢',
            'whitelist_approve': '✅',
            'whitelist_deny': '❌'
        };

        return new EmbedBuilder()
            .setTitle(`${emojis[type] || '📝'} ${action}`)
            .setDescription(details)
            .addFields(
                { name: 'Usuario', value: user ? `<@${user.id}> (${user.tag})` : 'Sistema', inline: true },
                { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setColor(colors[type] || config.colors.info)
            .setFooter({ text: 'TRAPCITY RP • Log del Sistema' })
            .setTimestamp();
    }

    // EMBED PERSONALIZADO (para comando /embed)
    static custom(title, description, color = MAIN_COLOR, imageUrl = null) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: 'TRAPCITY RP' })
            .setTimestamp();
        
        if (imageUrl) {
            embed.setImage(imageUrl);
        }
        
        return embed;
    }
}

module.exports = Embeds;

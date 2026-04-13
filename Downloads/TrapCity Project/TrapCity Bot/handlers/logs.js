const Embeds = require('../embeds');
const { dbAsync } = require('../database');
const config = require('../config');

class LogsHandler {
    constructor(client) {
        this.client = client;
    }

    // Log de mensaje eliminado
    async logMessageDelete(message) {
        if (message.author?.bot) return;

        const logChannel = await this.client.channels.fetch(config.channels.logs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('message_delete', message.author, 'Mensaje Eliminado', 
            `**Canal:** <#${message.channel.id}>\n**Contenido:** ${message.content?.substring(0, 1000) || 'Sin contenido'}`
        );

        // Agregar archivos adjuntos si hay
        if (message.attachments.size > 0) {
            const attachments = message.attachments.map(a => a.url).join('\n');
            embed.addFields({ name: '📎 Adjuntos', value: attachments.substring(0, 1000), inline: false });
        }

        await logChannel.send({ embeds: [embed] });

        // Guardar en DB
        await dbAsync.run(
            'INSERT INTO logs (type, user_id, action, details) VALUES (?, ?, ?, ?)',
            ['message_delete', message.author?.id, 'Mensaje eliminado', `Canal: ${message.channel.id}`]
        );
    }

    // Log de mensaje editado
    async logMessageEdit(oldMessage, newMessage) {
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const logChannel = await this.client.channels.fetch(config.channels.logs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('message_edit', newMessage.author, 'Mensaje Editado',
            `**Canal:** <#${newMessage.channel.id}>\n[Mira el mensaje](https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`
        );

        embed.addFields(
            { name: '📝 Antes', value: oldMessage.content?.substring(0, 500) || 'Sin contenido', inline: false },
            { name: '✏️ Después', value: newMessage.content?.substring(0, 500) || 'Sin contenido', inline: false }
        );

        await logChannel.send({ embeds: [embed] });

        // Guardar en DB
        await dbAsync.run(
            'INSERT INTO logs (type, user_id, action, details) VALUES (?, ?, ?, ?)',
            ['message_edit', newMessage.author?.id, 'Mensaje editado', `Canal: ${newMessage.channel.id}`]
        );
    }

    // Log de entrada al servidor
    async logMemberJoin(member) {
        const logChannel = await this.client.channels.fetch(config.channels.logs).catch(() => null);
        if (!logChannel) return;

        // Auto-role no verificado
        if (config.roles.unverified) {
            await member.roles.add(config.roles.unverified).catch(() => {});
        }

        const embed = Embeds.log('member_join', member.user, 'Usuario Entró al Servidor',
            `**Cuenta creada:** <t:${Math.floor(member.user.createdAt.getTime() / 1000)}:R>\n**ID:** ${member.user.id}`
        );

        await logChannel.send({ embeds: [embed] });

        // Enviar mensaje de bienvenida
        const welcomeChannel = await this.client.channels.fetch(config.channels.welcome).catch(() => null);
        if (welcomeChannel) {
            const welcomeEmbed = Embeds.welcome(member.user, member.guild.memberCount);
            await welcomeChannel.send({
                content: `¡Bienvenido <@${member.user.id}>! 🎉`,
                embeds: [welcomeEmbed]
            });
        }

        // Guardar en DB
        await dbAsync.run(
            'INSERT INTO logs (type, user_id, action, details) VALUES (?, ?, ?, ?)',
            ['member_join', member.user.id, 'Entró al servidor', `Miembro #${member.guild.memberCount}`]
        );
    }

    // Log de salida del servidor
    async logMemberLeave(member) {
        const logChannel = await this.client.channels.fetch(config.channels.logs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('member_leave', member.user, 'Usuario Salió del Servidor',
            `**Se unió:** <t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>\n**ID:** ${member.user.id}`
        );

        await logChannel.send({ embeds: [embed] });

        // Guardar en DB
        await dbAsync.run(
            'INSERT INTO logs (type, user_id, action, details) VALUES (?, ?, ?, ?)',
            ['member_leave', member.user.id, 'Salió del servidor', `Miembro desde: ${member.joinedAt.toISOString()}`]
        );
    }

    // Log de asignación de rol
    async logRoleAdd(member, role) {
        const logChannel = await this.client.channels.fetch(config.channels.logs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('role_add', member.user, 'Rol Asignado',
            `**Rol:** <@&${role.id}>\n**Por:** Sistema o Admin`
        );

        await logChannel.send({ embeds: [embed] });
    }

    // Log de remoción de rol
    async logRoleRemove(member, role) {
        const logChannel = await this.client.channels.fetch(config.channels.logs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('role_remove', member.user, 'Rol Removido',
            `**Rol:** <@&${role.id}>\n**Por:** Sistema o Admin`
        );

        await logChannel.send({ embeds: [embed] });
    }

    // Log de ban
    async logBan(guild, user, reason = null) {
        const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('ban', user, 'Usuario Baneado',
            `**Razón:** ${reason || 'No especificada'}`
        );

        await logChannel.send({ embeds: [embed] });

        // Guardar en DB
        await dbAsync.run(
            'INSERT INTO logs (type, user_id, action, details) VALUES (?, ?, ?, ?)',
            ['ban', user.id, 'Baneado', reason || 'Sin razón']
        );
    }

    // Log de kick
    async logKick(member, reason = null) {
        const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('kick', member.user, 'Usuario Kickeado',
            `**Razón:** ${reason || 'No especificada'}`
        );

        await logChannel.send({ embeds: [embed] });
    }

    // Log de staff
    async logStaffAction(admin, action, target, details) {
        const logChannel = await this.client.channels.fetch(config.channels.staffLogs).catch(() => null);
        if (!logChannel) return;

        const embed = Embeds.log('whitelist_approve', target, `Acción de Staff: ${action}`,
            `**Realizado por:** ${admin.tag}\n**Detalles:** ${details}`
        );

        await logChannel.send({ embeds: [embed] });
    }

    // Actualizar estadísticas de voz
    async updateVoiceStats(guild) {
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        
        // Contar usuarios con whitelist
        const whitelistedRole = config.roles.whitelisted;
        let whitelistedCount = 0;
        if (whitelistedRole) {
            whitelistedCount = guild.members.cache.filter(m => m.roles.cache.has(whitelistedRole)).size;
        }

        // Actualizar canales de voz
        try {
            if (config.channels.statsTotal) {
                const channel = await guild.channels.fetch(config.channels.statsTotal);
                await channel.setName(`👥 Total: ${totalMembers}`).catch(() => {});
            }
            if (config.channels.statsBots) {
                const channel = await guild.channels.fetch(config.channels.statsBots);
                await channel.setName(`🤖 Bots: ${bots}`).catch(() => {});
            }
            if (config.channels.statsWhitelist) {
                const channel = await guild.channels.fetch(config.channels.statsWhitelist);
                await channel.setName(`✅ WL: ${whitelistedCount}`).catch(() => {});
            }
        } catch (err) {
            console.error('Error actualizando estadísticas:', err);
        }
    }
}

module.exports = LogsHandler;

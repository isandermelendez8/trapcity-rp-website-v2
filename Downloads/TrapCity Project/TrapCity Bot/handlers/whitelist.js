const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const Embeds = require('../embeds');
const { dbAsync } = require('../database');
const config = require('../config');

class WhitelistHandler {
    constructor(client) {
        this.client = client;
    }

    // Recibir nueva whitelist de la website
    async receiveWhitelist(data) {
        const { userId, username, score, time, answers, correct } = data;

        // Guardar en DB
        await dbAsync.run(
            `INSERT INTO applications (discord_id, username, score, correct_answers, time_taken, answers, status, submitted_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, score, correct || 0, time, JSON.stringify(answers), 'pending', new Date().toISOString()]
        );

        const appId = (await dbAsync.get('SELECT last_insert_rowid() as id')).id;

        // Enviar a canal de whitelist
        const channel = await this.client.channels.fetch(config.channels.whitelistLogs).catch(() => null);
        if (channel) {
            const user = await this.client.users.fetch(userId).catch(() => null);
            const embed = Embeds.whitelistSubmitted(user || { id: userId, tag: username }, score, time, correct || 0);
            
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`wl_approve_${appId}_${userId}`)
                    .setLabel('✅ Aprobar')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`wl_deny_${appId}_${userId}`)
                    .setLabel('❌ Denegar')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`wl_review_${appId}`)
                    .setLabel('📋 Ver Respuestas')
                    .setStyle(ButtonStyle.Primary)
            );

            await channel.send({
                content: `<@&${config.roles.admin}> Nueva whitelist pendiente`,
                embeds: [embed],
                components: [buttons]
            });
        }

        return { success: true, applicationId: appId };
    }

    // Aprobar whitelist
    async approveWhitelist(interaction, appId, userId) {
        const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
        
        if (!isAdmin) {
            return interaction.reply({ content: '❌ Solo administradores pueden aprobar whitelists', ephemeral: true });
        }

        // Mostrar modal para nota opcional
        await interaction.showModal({
            title: 'Aprobar Whitelist',
            custom_id: `wl_approve_modal_${appId}_${userId}`,
            components: [{
                type: 1,
                components: [{
                    type: 4,
                    custom_id: 'approve_note',
                    label: 'Nota (opcional)',
                    style: 2,
                    required: false,
                    placeholder: 'Añade una nota para el usuario...',
                    max_length: 500
                }]
            }]
        });
    }

    // Confirmar aprobación
    async confirmApprove(interaction, appId, userId, note) {
        await dbAsync.run(
            'UPDATE applications SET status = ?, reviewer_id = ?, review_comment = ?, review_date = ? WHERE id = ?',
            ['approved', interaction.user.id, note || 'Sin nota', new Date().toISOString(), appId]
        );

        // Asignar rol de whitelist
        const guild = await this.client.guilds.fetch(config.GUILD_ID);
        const member = await guild.members.fetch(userId).catch(() => null);
        
        if (member && config.roles.whitelisted) {
            await member.roles.add(config.roles.whitelisted).catch(() => {});
        }

        // Remover rol pendiente si existe
        if (member && config.roles.pending) {
            await member.roles.remove(config.roles.pending).catch(() => {});
        }

        // Notificar al usuario
        const user = await this.client.users.fetch(userId).catch(() => null);
        if (user) {
            const dmEmbed = Embeds.whitelistApproved(user, interaction.user);
            if (note) {
                dmEmbed.addFields({ name: '📝 Nota del revisor', value: note, inline: false });
            }
            await user.send({ embeds: [dmEmbed] }).catch(() => {});
        }

        // Log
        const logChannel = await this.client.channels.fetch(config.channels.staffLogs).catch(() => null);
        if (logChannel) {
            await logChannel.send({
                embeds: [Embeds.log('whitelist_approve', user, 'Whitelist Aprobada', 
                    `Aprobada por: ${interaction.user.tag}\n${note ? `Nota: ${note}` : ''}`)]
            });
        }

        await interaction.reply({
            content: `✅ Whitelist #${appId} aprobada para ${user ? user.tag : userId}`,
            ephemeral: false
        });
    }

    // Denegar whitelist
    async denyWhitelist(interaction, appId, userId) {
        const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
        
        if (!isAdmin) {
            return interaction.reply({ content: '❌ Solo administradores pueden denegar whitelists', ephemeral: true });
        }

        // Mostrar modal para razón obligatoria
        await interaction.showModal({
            title: 'Denegar Whitelist',
            custom_id: `wl_deny_modal_${appId}_${userId}`,
            components: [{
                type: 1,
                components: [{
                    type: 4,
                    custom_id: 'deny_reason',
                    label: 'Razón de rechazo (obligatoria)',
                    style: 2,
                    required: true,
                    placeholder: 'Explica por qué se rechaza la whitelist...',
                    max_length: 500
                }]
            }]
        });
    }

    // Confirmar denegación
    async confirmDeny(interaction, appId, userId, reason) {
        await dbAsync.run(
            'UPDATE applications SET status = ?, reviewer_id = ?, review_comment = ?, review_date = ? WHERE id = ?',
            ['denied', interaction.user.id, reason, new Date().toISOString(), appId]
        );

        // Notificar al usuario
        const user = await this.client.users.fetch(userId).catch(() => null);
        if (user) {
            const dmEmbed = Embeds.whitelistDenied(user, interaction.user, reason);
            await user.send({ embeds: [dmEmbed] }).catch(() => {});
        }

        // Log
        const logChannel = await this.client.channels.fetch(config.channels.staffLogs).catch(() => null);
        if (logChannel) {
            await logChannel.send({
                embeds: [Embeds.log('whitelist_deny', user, 'Whitelist Denegada', 
                    `Denegada por: ${interaction.user.tag}\nRazón: ${reason}`)]
            });
        }

        await interaction.reply({
            content: `❌ Whitelist #${appId} denegada para ${user ? user.tag : userId}`,
            ephemeral: false
        });
    }

    // Ver respuestas de whitelist
    async reviewWhitelist(interaction, appId) {
        const app = await dbAsync.get('SELECT * FROM applications WHERE id = ?', [appId]);
        
        if (!app) {
            return interaction.reply({ content: '❌ Aplicación no encontrada', ephemeral: true });
        }

        const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
        if (!isAdmin) {
            return interaction.reply({ content: '❌ Solo administradores', ephemeral: true });
        }

        let answers = [];
        try {
            answers = JSON.parse(app.answers);
        } catch (e) {
            answers = [];
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 Whitelist #${appId} - Respuestas`)
            .setDescription(`**Usuario:** ${app.username}\n**Score:** ${app.score}% (${app.correct_answers}/45)`)
            .setColor(config.colors.info)
            .setTimestamp();

        // Mostrar primeras 10 respuestas
        answers.slice(0, 10).forEach((a, i) => {
            embed.addFields({
                name: `Pregunta ${i + 1}`,
                value: `Respuesta: ${a.answer || 'N/A'}`,
                inline: false
            });
        });

        if (answers.length > 10) {
            embed.setFooter({ text: `Y ${answers.length - 10} respuestas más...` });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Estadísticas de whitelists
    async getStats() {
        const total = await dbAsync.get('SELECT COUNT(*) as count FROM applications');
        const pending = await dbAsync.get('SELECT COUNT(*) as count FROM applications WHERE status = ?', ['pending']);
        const approved = await dbAsync.get('SELECT COUNT(*) as count FROM applications WHERE status = ?', ['approved']);
        const denied = await dbAsync.get('SELECT COUNT(*) as count FROM applications WHERE status = ?', ['denied']);

        return {
            total: total.count,
            pending: pending.count,
            approved: approved.count,
            denied: denied.count
        };
    }
}

module.exports = WhitelistHandler;

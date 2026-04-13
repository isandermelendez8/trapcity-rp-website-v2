const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    ChannelType,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');
const Embeds = require('../embeds');
const { dbAsync } = require('../database');
const config = require('../config');

// Contador de tickets
let ticketCounter = 1;

// Preguntas por categoría
const categoryQuestions = {
    donaciones: [
        '¿Cuál es tu nombre en el servidor?',
        '¿Qué tipo de donación realizaste?',
        '¿Tienes el comprobante de pago?',
        '¿Cuál es tu método de pago utilizado?'
    ],
    soporte: [
        '¿Cuál es tu problema?',
        '¿Cuándo ocurrió? (fecha y hora aproximada)',
        '¿Quiénes están involucrados? (@usuario si aplica)',
        '¿Tienes pruebas? (imágenes / videos)'
    ],
    gangas: [
        '¿Cuál es el nombre de tu ganga?',
        '¿Cuántos miembros tiene actualmente?',
        '¿Tienes historia/background de la ganga?',
        '¿Qué tipo de actividades realiza la ganga?'
    ],
    atencionStaff: [
        '¿Con qué miembro del staff necesitas hablar?',
        '¿Cuál es el motivo de tu consulta?',
        '¿Es urgente? Explica por qué',
        '¿Tienes alguna evidencia que mostrar?'
    ],
    aplicarStaff: [
        '¿Cuál es tu nombre y edad?',
        '¿Cuánto tiempo llevas en el servidor?',
        '¿Por qué quieres ser parte del staff?',
        '¿Tienes experiencia previa como staff en otros servidores?'
    ],
    reportarStaff: [
        '¿Qué miembro del staff estás reportando?',
        '¿Cuál es la razón del reporte?',
        '¿Cuándo ocurrió la situación?',
        '¿Tienes pruebas/evidencias? (OBLIGATORIO)'
    ],
    reportesUsuarios: [
        '¿Qué usuario estás reportando?',
        '¿Qué norma infringió?',
        'Describe la situación detalladamente',
        '¿Tienes pruebas? (imágenes/videos/links)'
    ],
    apelaciones: [
        '¿Qué sanción estás apelando? (ban/mute/warn)',
        '¿Cuándo recibiste la sanción?',
        '¿Por qué crees que la sanción debe ser removida?',
        '¿Tienes alguna evidencia nueva?'
    ],
    eventos: [
        '¿Qué tipo de evento quieres proponer?',
        '¿Cuántas personas participarían?',
        '¿Necesitas recursos del servidor?',
        'Describe el evento detalladamente'
    ],
    ayudaTecnica: [
        '¿Qué problema técnico tienes?',
        '¿Te da algún error específico? (captura si es posible)',
        '¿Ya intentaste reiniciar el juego/PC?',
        '¿Es problema de FiveM, Discord o PC?'
    ],
    general: [
        '¿Cuál es tu consulta?',
        '¿Necesitas algo específico del servidor?',
        '¿Es algo urgente?',
        '¿Tienes alguna información adicional que agregar?'
    ]
};

// Nombres de categorías para mostrar
const categoryNames = {
    donaciones: 'Donaciones',
    soporte: 'Soporte',
    gangas: 'Gangas',
    atencionStaff: 'Atención Staff',
    aplicarStaff: 'Aplicar Staff',
    reportarStaff: 'Reportar Staff',
    reportesUsuarios: 'Reportes de Usuarios',
    apelaciones: 'Apelaciones',
    eventos: 'Eventos',
    ayudaTecnica: 'Ayuda Técnica',
    general: 'General'
};

// Emojis por categoría
const categoryEmojis = {
    donaciones: '💰',
    soporte: '🆘',
    gangas: '🏢',
    atencionStaff: '👔',
    aplicarStaff: '📝',
    reportarStaff: '🚨',
    reportesUsuarios: '👤',
    apelaciones: '⚖️',
    eventos: '🎉',
    ayudaTecnica: '🔧',
    general: '❓'
};

class TicketHandler {
    constructor(client) {
        this.client = client;
    }

    // Crear panel de tickets
    async createTicketPanel(channel) {
        const embed = Embeds.ticketPanel();
        
        // Menú desplegable de categorías
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_create')
            .setPlaceholder('📋 Selecciona una categoría...')
            .addOptions([
                { label: 'Donaciones', emoji: '💰', value: 'donaciones', description: 'Gestión de donaciones y beneficios' },
                { label: 'Soporte', emoji: '🆘', value: 'soporte', description: 'Ayuda general y problemas' },
                { label: 'Gangas', emoji: '🏢', value: 'gangas', description: 'Solicitud de abrir o cerrar una ganga' },
                { label: 'Atención Staff', emoji: '👔', value: 'atencionStaff', description: 'Contactar al staff' },
                { label: 'Aplicar Staff', emoji: '📝', value: 'aplicarStaff', description: 'Postulación para staff' },
                { label: 'Reportar Staff', emoji: '🚨', value: 'reportarStaff', description: 'Reportar un miembro de staff' },
                { label: 'Reportes de Usuarios', emoji: '👤', value: 'reportesUsuarios', description: 'Reportar un usuario' },
                { label: 'Apelaciones', emoji: '⚖️', value: 'apelaciones', description: 'Apelar un ban o sanciones' },
                { label: 'Eventos', emoji: '🎉', value: 'eventos', description: 'Proponer o consultar un evento' },
                { label: 'Ayuda Técnica', emoji: '🔧', value: 'ayudaTecnica', description: 'Ayuda técnica con problemas del servidor' },
                { label: 'General', emoji: '❓', value: 'general', description: 'Consultas generales' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await channel.send({ embeds: [embed], components: [row] });
    }

    // Crear un nuevo ticket
    async createTicket(interaction, category) {
        const user = interaction.user;
        const guild = interaction.guild;
        
        // Verificar si ya tiene un ticket abierto
        const existingTicket = await dbAsync.get(
            'SELECT * FROM tickets WHERE user_id = ? AND status = ? AND category = ?',
            [user.id, 'open', category]
        );
        
        if (existingTicket) {
            return interaction.reply({
                content: `❌ Ya tienes un ticket abierto en esta categoría: <#${existingTicket.channel_id}>`,
                ephemeral: true
            });
        }

        // Obtener categoría de Discord
        const categoryId = config.ticketCategories[category];
        if (!categoryId) {
            return interaction.reply({
                content: '❌ Error: Categoría no configurada. Contacta a un administrador.',
                ephemeral: true
            });
        }

        // Crear canal
        const ticketNum = ticketCounter++;
        const channelName = `${categoryEmojis[category]}-${category.slice(0, 5)}-${ticketNum}`;
        
        // Determinar qué roles pueden ver el ticket
        const permissionOverwrites = [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks
                ]
            }
        ];

        // Agregar permisos para staff
        const staffRoles = [config.roles.admin, config.roles.moderator, config.roles.staff].filter(Boolean);
        for (const roleId of staffRoles) {
            if (roleId) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.AttachFiles
                    ]
                });
            }
        }

        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites
        });

        // Guardar en DB
        await dbAsync.run(
            'INSERT INTO tickets (channel_id, user_id, category, status, created_at) VALUES (?, ?, ?, ?, ?)',
            [channel.id, user.id, category, 'open', new Date().toISOString()]
        );

        const ticketId = (await dbAsync.get('SELECT last_insert_rowid() as id')).id;

        // Enviar mensaje inicial
        const questions = categoryQuestions[category] || categoryQuestions.general;
        const embed = Embeds.ticketOpened(ticketId, user, category, questions);

        // Botones de acción
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ticket_claim_${ticketId}`)
                .setLabel('📋 Reclamar Ticket')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`ticket_close_${ticketId}`)
                .setLabel('🔒 Cerrar Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `<@${user.id}> ${staffRoles.map(r => `<@&${r}>`).join(' ')}`,
            embeds: [embed],
            components: [buttons]
        });

        // Log
        const logChannel = await this.client.channels.fetch(config.channels.ticketLogs).catch(() => null);
        if (logChannel) {
            await logChannel.send({
                embeds: [Embeds.log('member_join', user, 'Ticket Creado', 
                    `Categoría: ${categoryNames[category]}\nCanal: <#${channel.id}>`)]
            });
        }

        await interaction.reply({
            content: `✅ Ticket creado: <#${channel.id}>`,
            ephemeral: true
        });
    }

    // Reclamar ticket
    async claimTicket(interaction, ticketId) {
        const ticket = await dbAsync.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (!ticket) {
            return interaction.reply({ content: '❌ Ticket no encontrado', ephemeral: true });
        }

        if (ticket.claimed_by) {
            return interaction.reply({ 
                content: `❌ Este ticket ya fue reclamado por <@${ticket.claimed_by}>`, 
                ephemeral: true 
            });
        }

        // Verificar que sea staff
        const member = interaction.member;
        const isStaff = [config.roles.admin, config.roles.moderator, config.roles.staff]
            .some(role => member.roles.cache.has(role));
        
        if (!isStaff) {
            return interaction.reply({ content: '❌ Solo staff puede reclamar tickets', ephemeral: true });
        }

        await dbAsync.run(
            'UPDATE tickets SET claimed_by = ? WHERE id = ?',
            [interaction.user.id, ticketId]
        );

        await interaction.reply({
            content: `✅ <@${interaction.user.id}> ha reclamado este ticket.`,
        });

        // Actualizar embed
        const channel = await this.client.channels.fetch(ticket.channel_id);
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(m => m.author.id === this.client.user.id && m.embeds.length > 0);
        
        if (botMessage) {
            const embed = EmbedBuilder.from(botMessage.embeds[0])
                .spliceFields(4, 0, { name: 'Reclamado por', value: `<@${interaction.user.id}>`, inline: true });
            await botMessage.edit({ embeds: [embed] });
        }
    }

    // Cerrar ticket
    async closeTicket(interaction, ticketId) {
        const ticket = await dbAsync.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (!ticket) {
            return interaction.reply({ content: '❌ Ticket no encontrado', ephemeral: true });
        }

        // Verificar permisos - solo admin puede cerrar
        const member = interaction.member;
        const isAdmin = member.roles.cache.has(config.roles.admin);
        
        if (!isAdmin) {
            return interaction.reply({ 
                content: '❌ Solo administradores pueden cerrar tickets', 
                ephemeral: true 
            });
        }

        // Solicitar razón
        await interaction.showModal({
            title: 'Cerrar Ticket',
            custom_id: `close_modal_${ticketId}`,
            components: [{
                type: 1,
                components: [{
                    type: 4,
                    custom_id: 'close_reason',
                    label: 'Razón de cierre (obligatoria)',
                    style: 2,
                    required: true,
                    placeholder: 'Escribe la razón por la que cierras este ticket...'
                }]
            }]
        });
    }

    // Confirmar cierre con razón
    async confirmClose(interaction, ticketId, reason) {
        const ticket = await dbAsync.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        
        const closedAt = new Date();
        const duration = Math.floor((closedAt - new Date(ticket.created_at)) / 60000); // minutos

        await dbAsync.run(
            'UPDATE tickets SET status = ?, close_reason = ?, closed_at = ? WHERE id = ?',
            ['closed', reason, closedAt.toISOString(), ticketId]
        );

        // Calcular mensajes
        const messages = await dbAsync.all(
            'SELECT COUNT(*) as count FROM ticket_messages WHERE ticket_id = ?',
            [ticketId]
        );
        const messageCount = messages[0]?.count || 0;

        // Enviar DM al usuario
        const user = await this.client.users.fetch(ticket.user_id).catch(() => null);
        if (user) {
            const dmEmbed = Embeds.ticketClosed(ticketId, user, interaction.user, reason, `${duration} minutos`);
            await user.send({ embeds: [dmEmbed] }).catch(() => {});
        }

        // Enviar feedback request
        const feedbackEmbed = Embeds.feedbackRequest(ticketId);
        const feedbackButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`feedback_1_${ticketId}`).setLabel('⭐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`feedback_2_${ticketId}`).setLabel('⭐⭐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`feedback_3_${ticketId}`).setLabel('⭐⭐⭐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`feedback_4_${ticketId}`).setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`feedback_5_${ticketId}`).setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: `🔒 Ticket cerrado por ${interaction.user.tag}\n**Razón:** ${reason}`,
        });

        // Esperar feedback
        const channel = await this.client.channels.fetch(ticket.channel_id);
        const feedbackMsg = await channel.send({
            content: `<@${ticket.user_id}>`,
            embeds: [feedbackEmbed],
            components: [feedbackButtons]
        });

        // Guardar transcript
        await this.saveTranscript(ticket, interaction.user, reason, duration, messageCount);

        // Esperar 25 segundos para feedback
        setTimeout(async () => {
            await channel.delete().catch(() => {});
        }, 25000);
    }

    // Guardar transcript
    async saveTranscript(ticket, admin, reason, duration, messageCount) {
        const messages = await dbAsync.all(
            'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at',
            [ticket.id]
        );

        const transcriptData = {
            ticketId: ticket.id,
            userId: ticket.user_id,
            category: ticket.category,
            closedBy: admin.id,
            reason,
            duration: `${duration} minutos`,
            messageCount,
            messages: messages.map(m => ({
                author: m.username,
                content: m.content,
                time: m.created_at,
                attachments: m.attachments ? JSON.parse(m.attachments) : []
            }))
        };

        // Enviar a canal de transcripts
        const transcriptChannel = await this.client.channels.fetch(config.channels.transcripts).catch(() => null);
        if (transcriptChannel) {
            const embed = Embeds.transcript(ticket.id, transcriptData);
            
            // Crear archivo de transcript
            const transcriptText = messages.map(m => 
                `[${new Date(m.created_at).toLocaleString('es-ES')}] ${m.username}: ${m.content}`
            ).join('\n');

            const { AttachmentBuilder } = require('discord.js');
            const attachment = new AttachmentBuilder(
                Buffer.from(transcriptText || 'Sin mensajes'),
                { name: `transcript-${ticket.id}.txt` }
            );

            await transcriptChannel.send({
                embeds: [embed],
                files: [attachment]
            });
        }
    }

    // Manejar feedback
    async handleFeedback(interaction, rating, ticketId) {
        await dbAsync.run(
            'UPDATE tickets SET feedback_rating = ? WHERE id = ?',
            [rating, ticketId]
        );

        // Enviar a canal de feedback
        const feedbackChannel = await this.client.channels.fetch(config.channels.feedback).catch(() => null);
        if (feedbackChannel) {
            await feedbackChannel.send({
                embeds: [new EmbedBuilder()
                    .setTitle('⭐ Nuevo Feedback')
                    .setDescription(`Ticket #${ticketId} recibió ${rating} estrellas`)
                    .setColor(config.colors.warning)
                    .setTimestamp()
                ]
            });
        }

        await interaction.reply({ content: `⭐ ¡Gracias por tu calificación de ${rating} estrellas!`, ephemeral: true });
    }

    // Guardar mensaje de ticket
    async saveMessage(message, ticketId) {
        const attachments = message.attachments.map(a => a.url);
        
        await dbAsync.run(
            'INSERT INTO ticket_messages (ticket_id, user_id, username, content, attachments) VALUES (?, ?, ?, ?, ?)',
            [ticketId, message.author.id, message.author.tag, message.content, JSON.stringify(attachments)]
        );
    }
}

module.exports = TicketHandler;

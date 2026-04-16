// ==================== TRAPCITY RP BOT v1.0.0 ====================
// Bot completo: Whitelist, Tickets, Verificación, Logs, Auto-roles

const { 
    Client, 
    GatewayIntentBits, 
    Partials,
    PermissionFlagsBits,
    SlashCommandBuilder,
    Routes,
    REST,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder
} = require('discord.js');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const Embeds = require('./embeds');
const TicketHandler = require('./handlers/tickets');
const VerificationHandler = require('./handlers/verification');
const WhitelistHandler = require('./handlers/whitelist');
const LogsHandler = require('./handlers/logs');
const WelcomeHandler = require('./handlers/welcome');
const RecurringMessagesHandler = require('./handlers/recurringMessages');
const { dbAsync } = require('./database');

// ==================== CLIENT SETUP ====================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Handlers
const ticketHandler = new TicketHandler(client);
const verificationHandler = new VerificationHandler(client);
const whitelistHandler = new WhitelistHandler(client);
const logsHandler = new LogsHandler(client);
const welcomeHandler = new WelcomeHandler(client);
const recurringMessagesHandler = new RecurringMessagesHandler(client);

// ==================== EXPRESS API ====================

const app = express();
app.use(express.json());
app.use(cors());

// API: Recibir whitelist de la website
app.post('/api/whitelist/submit', async (req, res) => {
    try {
        const result = await whitelistHandler.receiveWhitelist(req.body);
        res.json(result);
    } catch (err) {
        console.error('Error receiving whitelist:', err);
        res.status(500).json({ error: 'Internal error' });
    }
});

// API: Verificar token
app.post('/api/verify', async (req, res) => {
    try {
        const { token, userId, ipData } = req.body;
        const result = await verificationHandler.verifyToken(token, userId, ipData);
        res.json(result);
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(500).json({ error: 'Internal error' });
    }
});

// API: Obtener datos de usuario
app.get('/api/user/:userId', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(config.GUILD_ID);
        const member = await guild.members.fetch(req.params.userId).catch(() => null);
        
        if (!member) {
            return res.status(404).json({ error: 'User not found' });
        }

        const verified = await dbAsync.get(
            'SELECT * FROM verified_users WHERE discord_id = ?',
            [req.params.userId]
        );

        const whitelisted = await dbAsync.get(
            'SELECT * FROM applications WHERE discord_id = ? AND status = ?',
            [req.params.userId, 'approved']
        );

        res.json({
            id: member.user.id,
            username: member.user.username,
            avatar: member.user.displayAvatarURL(),
            roles: member.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
            joinedAt: member.joinedAt,
            isVerified: !!verified,
            isWhitelisted: !!whitelisted
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal error' });
    }
});

// API: Estadísticas
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await whitelistHandler.getStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Internal error' });
    }
});

// ==================== COMMAND COLLECTION ====================

const commands = [];
const commandHandlers = new Map();

// Cargar comandos dinámicamente desde la carpeta commands/
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        commandHandlers.set(command.data.name, command);
        console.log(`✅ Comando cargado: ${command.data.name}`);
    } else {
        console.log(`⚠️ El comando en ${filePath} falta propiedad 'data' o 'execute'`);
    }
}

console.log(`📋 Total comandos cargados: ${commands.length}`);

// Comandos hardcodeados (compatibilidad)
const legacyCommands = [
    new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sistema de tickets')
        .addSubcommand(sub => sub.setName('panel').setDescription('Crear panel de tickets'))
        .addSubcommand(sub => sub.setName('cerrar').setDescription('Cerrar ticket actual').addStringOption(opt => 
            opt.setName('razon').setDescription('Razón del cierre').setRequired(true))),

    new SlashCommandBuilder()
        .setName('verificar')
        .setDescription('Sistema de verificación')
        .addSubcommand(sub => sub.setName('panel').setDescription('Crear panel de verificación'))
        .addSubcommand(sub => sub.setName('manual').setDescription('Verificar manualmente un usuario').addUserOption(opt => 
            opt.setName('usuario').setDescription('Usuario a verificar').setRequired(true))),

    new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Gestión de whitelists')
        .addSubcommand(sub => sub.setName('stats').setDescription('Ver estadísticas de whitelists'))
        .addSubcommand(sub => sub.setName('pendientes').setDescription('Ver whitelists pendientes')),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Crear embed personalizado (Admin)')
        .addStringOption(opt => opt.setName('titulo').setDescription('Título del embed').setRequired(true))
        .addStringOption(opt => opt.setName('descripcion').setDescription('Descripción').setRequired(true))
        .addStringOption(opt => opt.setName('color').setDescription('Color (hex, ej: #8B5CF6)').setRequired(false))
        .addStringOption(opt => opt.setName('imagen').setDescription('URL de imagen').setRequired(false)),

    new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Añadir usuario a blacklist (Admin)')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(opt => opt.setName('razon').setDescription('Razón').setRequired(true))
        .addStringOption(opt => opt.setName('servidor').setDescription('Servidor origen').setRequired(false)),

    new SlashCommandBuilder()
        .setName('test')
        .setDescription('Comando de prueba - muestra información del bot')
];

// Agregar comandos legacy al array principal
commands.push(...legacyCommands.map(cmd => cmd.toJSON()));

// ==================== EVENT HANDLERS ====================

client.once('ready', async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`📊 Servidores: ${client.guilds.cache.size}`);

    // Configurar presencia del bot con Rich Presence completa
    client.user.setPresence({
        activities: [{
            name: 'TrapCity RP',
            type: 0, // 0 = Playing
            state: 'Servidor activo 🟢',
            details: '¡Únete al roleplay!',
            party: {
                id: 'trapcity-rp-main',
                size: [1, 100] // [current, max]
            },
            timestamps: {
                start: Date.now() // Tiempo desde que inició
            },
            assets: {
                largeImage: 'trapcity_logo', // Nombre de la imagen subida en Developer Portal
                largeText: 'TrapCity RP - Servidor Oficial',
                smallImage: 'online_icon',
                smallText: 'Bot Activo'
            },
            buttons: [
                {
                    label: '🔗 Unirse al Discord',
                    url: 'https://discord.gg/rBGef6NUuf'
                },
                {
                    label: '🎮 Hacer Whitelist',
                    url: 'https://trapcity.onrender.com/whitelist'
                }
            ]
        }],
        status: 'online'
    });
    console.log('🎮 Rich Presence configurada: TrapCity RP con botón de unión');

    // Registrar comandos
    try {
        const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Comandos slash registrados');
    } catch (err) {
        console.error('Error registrando comandos:', err);
    }

    // Iniciar API
    app.listen(config.PORT, () => {
        console.log(`🚀 API corriendo en puerto ${config.PORT}`);
    });

    // Actualizar estadísticas cada 5 minutos
    setInterval(async () => {
        const guild = await client.guilds.fetch(config.GUILD_ID).catch(() => null);
        if (guild) {
            await logsHandler.updateVoiceStats(guild);
        }
    }, 5 * 60 * 1000);
    
    // Iniciar mensajes recurrentes
    recurringMessagesHandler.start();
});

// ==================== WELCOME HANDLER ====================

client.on('guildMemberAdd', async (member) => {
    try {
        await welcomeHandler.handle(member);
    } catch (error) {
        console.error('Error en guildMemberAdd:', error);
    }
});

// ==================== INTERACTION HANDLER ====================

client.on('interactionCreate', async interaction => {
    try {
        // ===== MODALES =====
        if (interaction.isModalSubmit()) {
            const [action, ...params] = interaction.customId.split('_');

            // Cerrar ticket
            if (action === 'close' && params[0] === 'modal') {
                const ticketId = params[1];
                const reason = interaction.fields.getTextInputValue('close_reason');
                await ticketHandler.confirmClose(interaction, ticketId, reason);
                return;
            }

            // Aprobar whitelist
            if (action === 'wl' && params[1] === 'approve' && params[2] === 'modal') {
                const appId = params[3];
                const userId = params[4];
                const note = interaction.fields.getTextInputValue('approve_note');
                await whitelistHandler.confirmApprove(interaction, appId, userId, note);
                return;
            }

            // Denegar whitelist
            if (action === 'wl' && params[1] === 'deny' && params[2] === 'modal') {
                const appId = params[3];
                const userId = params[4];
                const reason = interaction.fields.getTextInputValue('deny_reason');
                await whitelistHandler.confirmDeny(interaction, appId, userId, reason);
                return;
            }
        }

        // ===== BOTONES =====
        if (interaction.isButton()) {
            const [action, ...params] = interaction.customId.split('_');

            // Iniciar verificación
            if (action === 'start' && params[0] === 'verification') {
                await verificationHandler.startVerification(interaction);
                return;
            }

            // Reclamar ticket
            if (action === 'ticket' && params[0] === 'claim') {
                const ticketId = params[1];
                await ticketHandler.claimTicket(interaction, ticketId);
                return;
            }

            // Cerrar ticket
            if (action === 'ticket' && params[0] === 'close') {
                const ticketId = params[1];
                await ticketHandler.closeTicket(interaction, ticketId);
                return;
            }

            // Feedback
            if (action.startsWith('feedback')) {
                const rating = parseInt(action.replace('feedback', ''));
                const ticketId = params[1];
                await ticketHandler.handleFeedback(interaction, rating, ticketId);
                return;
            }

            // Aprobar whitelist
            if (action === 'wl' && params[0] === 'approve') {
                const appId = params[1];
                const userId = params[2];
                await whitelistHandler.approveWhitelist(interaction, appId, userId);
                return;
            }

            // Denegar whitelist
            if (action === 'wl' && params[0] === 'deny') {
                const appId = params[1];
                const userId = params[2];
                await whitelistHandler.denyWhitelist(interaction, appId, userId);
                return;
            }

            // Ver respuestas whitelist
            if (action === 'wl' && params[0] === 'review') {
                const appId = params[1];
                await whitelistHandler.reviewWhitelist(interaction, appId);
                return;
            }
        }

        // ===== SELECT MENUS =====
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_create') {
                const category = interaction.values[0];
                await ticketHandler.createTicket(interaction, category);
                return;
            }
        }

        // ===== COMANDOS SLASH =====
        if (!interaction.isChatInputCommand()) return;

        const { commandName, options } = interaction;

        // Comandos cargados dinámicamente desde archivos
        if (commandHandlers.has(commandName)) {
            try {
                const command = commandHandlers.get(commandName);
                await command.execute(interaction);
                return;
            } catch (error) {
                console.error(`❌ Error ejecutando comando ${commandName}:`, error);
                await interaction.reply({ 
                    content: '❌ Hubo un error ejecutando este comando.',
                    ephemeral: true 
                });
                return;
            }
        }

        // Comandos legacy (hardcodeados) - compatibilidad
        // /ticket
        if (commandName === 'ticket') {
            const sub = options.getSubcommand();

            if (sub === 'panel') {
                const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Solo admins', ephemeral: true });
                }
                await ticketHandler.createTicketPanel(interaction.channel);
                await interaction.reply({ content: '✅ Panel de tickets creado', ephemeral: true });
            }

            if (sub === 'cerrar') {
                // Buscar ticket en este canal
                const ticket = await dbAsync.get(
                    'SELECT * FROM tickets WHERE channel_id = ? AND status = ?',
                    [interaction.channel.id, 'open']
                );
                
                if (!ticket) {
                    return interaction.reply({ content: '❌ No hay un ticket abierto en este canal', ephemeral: true });
                }

                const reason = options.getString('razon');
                await ticketHandler.confirmClose(interaction, ticket.id, reason);
            }
        }

        // /verificar
        if (commandName === 'verificar') {
            const sub = options.getSubcommand();

            if (sub === 'panel') {
                const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Solo admins', ephemeral: true });
                }
                await verificationHandler.createVerificationPanel(interaction.channel);
                await interaction.reply({ content: '✅ Panel de verificación creado', ephemeral: true });
            }

            if (sub === 'manual') {
                const user = options.getUser('usuario');
                await verificationHandler.manualVerify(interaction, user);
            }
        }

        // /whitelist
        if (commandName === 'whitelist') {
            const sub = options.getSubcommand();

            if (sub === 'stats') {
                const stats = await whitelistHandler.getStats();
                const embed = new EmbedBuilder()
                    .setTitle('📊 Estadísticas de Whitelist')
                    .addFields(
                        { name: 'Total', value: stats.total.toString(), inline: true },
                        { name: 'Pendientes', value: stats.pending.toString(), inline: true },
                        { name: 'Aprobadas', value: stats.approved.toString(), inline: true },
                        { name: 'Denegadas', value: stats.denied.toString(), inline: true }
                    )
                    .setColor(config.colors.main)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (sub === 'pendientes') {
                const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
                if (!isAdmin) {
                    return interaction.reply({ content: '❌ Solo admins', ephemeral: true });
                }

                const pending = await dbAsync.all(
                    'SELECT * FROM applications WHERE status = ? ORDER BY submitted_at DESC LIMIT 10',
                    ['pending']
                );

                if (pending.length === 0) {
                    return interaction.reply({ content: '✅ No hay whitelists pendientes', ephemeral: true });
                }

                const list = pending.map(w => `#${w.id} - ${w.username} - ${w.score}%`).join('\n');
                await interaction.reply({ content: `📋 Whitelists pendientes:\n${list}`, ephemeral: true });
            }
        }

        // /embed
        if (commandName === 'embed') {
            const isAdmin = interaction.member.roles.cache.has(config.roles.admin);
            if (!isAdmin) {
                return interaction.reply({ content: '❌ Solo admins', ephemeral: true });
            }

            const title = options.getString('titulo');
            const description = options.getString('descripcion');
            const colorStr = options.getString('color') || '#8B5CF6';
            const imageUrl = options.getString('imagen');

            const color = parseInt(colorStr.replace('#', ''), 16);
            const embed = Embeds.custom(title, description, color, imageUrl);

            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Embed enviado', ephemeral: true });
        }

        // /blacklist
        if (commandName === 'blacklist') {
            const user = options.getUser('usuario');
            const reason = options.getString('razon');
            const server = options.getString('servidor');
            await verificationHandler.addToBlacklist(interaction, user, reason, server);
        }

        // /test
        if (commandName === 'test') {
            const embed = new EmbedBuilder()
                .setTitle('🤖 TRAPCITY RP Bot')
                .setDescription('El bot está funcionando correctamente.')
                .addFields(
                    { name: 'Versión', value: '1.0.0', inline: true },
                    { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
                    { name: 'Servidor', value: interaction.guild.name, inline: true },
                    { name: 'Módulos activos', value: '✅ Tickets\n✅ Verificación\n✅ Whitelist\n✅ Logs' }
                )
                .setColor(config.colors.main)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

    } catch (err) {
        console.error('Error en interacción:', err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Error al procesar la acción', ephemeral: true }).catch(() => {});
        }
    }
});

// ==================== MESSAGE EVENTS (LOGS) ====================

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Guardar mensaje en DB si es ticket
    const ticket = await dbAsync.get(
        'SELECT * FROM tickets WHERE channel_id = ? AND status = ?',
        [message.channel.id, 'open']
    );
    
    if (ticket) {
        await ticketHandler.saveMessage(message, ticket.id);
    }
});

client.on('messageDelete', async message => {
    await logsHandler.logMessageDelete(message);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    await logsHandler.logMessageEdit(oldMessage, newMessage);
});

// ==================== MEMBER EVENTS ====================

client.on('guildMemberAdd', async member => {
    await logsHandler.logMemberJoin(member);
});

client.on('guildMemberRemove', async member => {
    await logsHandler.logMemberLeave(member);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Log role changes
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    // Rol agregado
    newRoles.forEach((role, id) => {
        if (!oldRoles.has(id)) {
            logsHandler.logRoleAdd(newMember, role);
        }
    });

    // Rol removido
    oldRoles.forEach((role, id) => {
        if (!newRoles.has(id)) {
            logsHandler.logRoleRemove(newMember, role);
        }
    });
});

// ==================== GUILD EVENTS ====================

client.on('guildBanAdd', async ban => {
    await logsHandler.logBan(ban.guild, ban.user, 'Baneado');
});

// ==================== ERROR HANDLING ====================

client.on('error', console.error);
process.on('unhandledRejection', console.error);

// ==================== LOGIN ====================

client.login(config.DISCORD_TOKEN);

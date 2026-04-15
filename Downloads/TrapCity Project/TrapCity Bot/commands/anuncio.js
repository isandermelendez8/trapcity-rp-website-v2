const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const cron = require('node-cron');

// Store scheduled announcements
const scheduledAnnouncements = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anuncio')
        .setDescription('Envía anuncios personalizados al servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('manual')
                .setDescription('Envía un anuncio manualmente ahora')
                .addStringOption(option =>
                    option.setName('titulo')
                        .setDescription('Título del anuncio')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('mensaje')
                        .setDescription('Mensaje del anuncio (usa \\n para saltos de línea)')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar el anuncio')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Color del embed')
                        .addChoices(
                            { name: '💜 Violeta', value: '0x8B5CF6' },
                            { name: '💙 Azul', value: '0x3B82F6' },
                            { name: '💚 Verde', value: '0x22C55E' },
                            { name: '❤️ Rojo', value: '0xEF4444' },
                            { name: '💛 Amarillo', value: '0xEAB308' },
                            { name: '💗 Rosa', value: '0xEC4899' },
                            { name: '🧡 Naranja', value: '0xF97316' },
                            { name: '🤍 Blanco', value: '0xFFFFFF' }
                        ))
                .addStringOption(option =>
                    option.setName('imagen')
                        .setDescription('URL de imagen para el anuncio'))
                .addStringOption(option =>
                    option.setName('footer')
                        .setDescription('Texto del footer (por defecto: TrapCity RP)'))
                .addBooleanOption(option =>
                    option.setName('mencion')
                        .setDescription('¿Mencionar a @everyone?'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('automatico')
                .setDescription('Programa un anuncio automático')
                .addStringOption(option =>
                    option.setName('titulo')
                        .setDescription('Título del anuncio')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('mensaje')
                        .setDescription('Mensaje del anuncio')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar el anuncio')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('frecuencia')
                        .setDescription('Frecuencia del anuncio automático')
                        .setRequired(true)
                        .addChoices(
                            { name: '🕐 Cada hora', value: '0 * * * *' },
                            { name: '🕐 Cada 6 horas', value: '0 */6 * * *' },
                            { name: '🕐 Cada 12 horas', value: '0 */12 * * *' },
                            { name: '🕐 Cada 24 horas', value: '0 0 * * *' },
                            { name: '📅 Diario a las 9AM', value: '0 9 * * *' },
                            { name: '📅 Diario a las 6PM', value: '0 18 * * *' },
                            { name: '📅 Semanal (Lunes 9AM)', value: '0 9 * * 1' }
                        ))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Color del embed')
                        .addChoices(
                            { name: '💜 Violeta', value: '0x8B5CF6' },
                            { name: '💙 Azul', value: '0x3B82F6' },
                            { name: '💚 Verde', value: '0x22C55E' },
                            { name: '❤️ Rojo', value: '0xEF4444' },
                            { name: '💛 Amarillo', value: '0xEAB308' }
                        ))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('detener')
                .setDescription('Detiene un anuncio automático')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID del anuncio a detener (usa /anuncio lista para ver IDs)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lista')
                .setDescription('Muestra los anuncios automáticos activos')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const header = '✦ ━━━━ 💜 TRAPCITY RP 💜 ━━━━ ✦';

        if (subcommand === 'manual') {
            const titulo = interaction.options.getString('titulo');
            const mensaje = interaction.options.getString('mensaje').replace(/\\n/g, '\n');
            const canal = interaction.options.getChannel('canal');
            const color = parseInt(interaction.options.getString('color') || '0x8B5CF6');
            const imagen = interaction.options.getString('imagen');
            const footerText = interaction.options.getString('footer') || 'TrapCity RP';
            const mencion = interaction.options.getBoolean('mencion') || false;

            try {
                const embed = new EmbedBuilder()
                    .setTitle(header)
                    .setDescription(`# 📢 **${titulo}** 📢\n\n${mensaje}`)
                    .setColor(color)
                    .setFooter({ text: footerText, iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                if (imagen) {
                    embed.setImage(imagen);
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('💬 Soporte')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1471687764096319662/1492625082507227238'),
                        new ButtonBuilder()
                            .setLabel('📋 Whitelist')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1471687764096319662/1492625082507227238')
                    );

                if (mencion) {
                    await canal.send({ content: '@everyone', embeds: [embed], components: [row] });
                } else {
                    await canal.send({ embeds: [embed], components: [row] });
                }

                await interaction.reply({ 
                    content: `✅ **Anuncio enviado** a ${canal}\n\n📝 **Título:** ${titulo}\n🎨 **Color:** ${color.toString(16)}`, 
                    ephemeral: true 
                });

            } catch (error) {
                console.error('Error enviando anuncio:', error);
                await interaction.reply({ 
                    content: `❌ Error al enviar el anuncio: ${error.message}`, 
                    ephemeral: true 
                });
            }
        }

        else if (subcommand === 'automatico') {
            const titulo = interaction.options.getString('titulo');
            const mensaje = interaction.options.getString('mensaje').replace(/\\n/g, '\n');
            const canal = interaction.options.getChannel('canal');
            const frecuencia = interaction.options.getString('frecuencia');
            const color = parseInt(interaction.options.getString('color') || '0x8B5CF6');

            const id = `anuncio_${Date.now()}`;

            try {
                // Crear el cron job
                const cronJob = cron.schedule(frecuencia, async () => {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle(header)
                            .setDescription(`# 📢 **${titulo}** 📢\n\n${mensaje}`)
                            .setColor(color)
                            .setFooter({ text: 'TrapCity RP • Anuncio Automático', iconURL: interaction.guild.iconURL() })
                            .setTimestamp();

                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel('💬 Soporte')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1471687764096319662/1492625082507227238'),
                                new ButtonBuilder()
                                    .setLabel('📋 Whitelist')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1471687764096319662/1492625082507227238')
                            );

                        await canal.send({ embeds: [embed], components: [row] });
                        console.log(`✅ Anuncio automático enviado: ${id}`);
                    } catch (error) {
                        console.error(`❌ Error en anuncio automático ${id}:`, error);
                    }
                }, {
                    scheduled: true,
                    timezone: 'America/New_York'
                });

                // Guardar el job
                scheduledAnnouncements.set(id, {
                    job: cronJob,
                    titulo,
                    canal: canal.id,
                    frecuencia,
                    creadoPor: interaction.user.tag,
                    creadoEn: new Date().toLocaleString()
                });

                // Enviar primer anuncio inmediatamente
                const embed = new EmbedBuilder()
                    .setTitle(header)
                    .setDescription(`# 📢 **${titulo}** 📢\n\n${mensaje}`)
                    .setColor(color)
                    .setFooter({ text: 'TrapCity RP • Anuncio Automático', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('💬 Soporte')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1471687764096319662/1492625082507227238'),
                        new ButtonBuilder()
                            .setLabel('📋 Whitelist')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1471687764096319662/1492625082507227238')
                    );

                await canal.send({ embeds: [embed], components: [row] });

                await interaction.reply({ 
                    content: `✅ **Anuncio automático programado**\n\n🆔 **ID:** \`${id}\`\n📝 **Título:** ${titulo}\n📺 **Canal:** ${canal}\n⏰ **Frecuencia:** \`${frecuencia}\`\n\n⚠️ Guarda el ID para poder detenerlo más tarde.`, 
                    ephemeral: true 
                });

            } catch (error) {
                console.error('Error programando anuncio:', error);
                await interaction.reply({ 
                    content: `❌ Error al programar el anuncio: ${error.message}`, 
                    ephemeral: true 
                });
            }
        }

        else if (subcommand === 'detener') {
            const id = interaction.options.getString('id');

            if (!scheduledAnnouncements.has(id)) {
                return interaction.reply({ 
                    content: `❌ No se encontró un anuncio con el ID: \`${id}\`\n\nUsa \`/anuncio lista\` para ver los anuncios activos.`, 
                    ephemeral: true 
                });
            }

            const anuncio = scheduledAnnouncements.get(id);
            anuncio.job.stop();
            scheduledAnnouncements.delete(id);

            await interaction.reply({ 
                content: `🛑 **Anuncio detenido**\n\n🆔 ID: \`${id}\`\n📝 Título: ${anuncio.titulo}\n⏰ Se enviaba cada: \`${anuncio.frecuencia}\``, 
                ephemeral: true 
            });
        }

        else if (subcommand === 'lista') {
            if (scheduledAnnouncements.size === 0) {
                return interaction.reply({ 
                    content: '📭 No hay anuncios automáticos activos.', 
                    ephemeral: true 
                });
            }

            let lista = '📋 **Anuncios Automáticos Activos:**\n\n';
            
            for (const [id, anuncio] of scheduledAnnouncements) {
                const canal = interaction.client.channels.cache.get(anuncio.canal);
                lista += `🆔 \`${id}\`\n`;
                lista += `📝 ${anuncio.titulo}\n`;
                lista += `📺 ${canal ? canal.toString() : 'Canal no encontrado'}\n`;
                lista += `⏰ \`${anuncio.frecuencia}\`\n`;
                lista += `👤 Por: ${anuncio.creadoPor}\n`;
                lista += `📅 ${anuncio.creadoEn}\n\n`;
            }

            await interaction.reply({ content: lista, ephemeral: true });
        }
    },

    // Helper function to restore scheduled announcements on bot restart
    restoreScheduled(client) {
        // This would need to be called from bot.js after login
        console.log(`📋 Restaurando ${scheduledAnnouncements.size} anuncios programados...`);
    }
};

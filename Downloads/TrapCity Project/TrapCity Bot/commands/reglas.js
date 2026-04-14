const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reglas')
        .setDescription('Muestra las reglas y enlace a la whitelist'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📜 Reglas de TrapCity RP')
            .setDescription('Bienvenido a **TrapCity RP**. Para jugar en nuestro servidor, debes seguir estas reglas y completar la whitelist.')
            .setColor(0x8B5CF6) // Violeta
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '⚠️ REGLAS IMPORTANTES', value: 
                    '• **No RDM** (Random Deathmatch) - No matar sin rol previo\n' +
                    '• **No VDM** (Vehicle Deathmatch) - No atropellar intencionalmente\n' +
                    '• **No MetaGaming** - No usar información fuera de rol\n' +
                    '• **No PowerGaming** - No forzar situaciones irreales\n' +
                    '• **No Failleo** - No aprovechar bugs del servidor\n' +
                    '• **Respeto OOC** - Tratar bien a todos fuera de rol\n\n' +
                    '*Para emojis personalizados usa: `<:nombre:ID>`*'
                },
                { name: '📝 Whitelist Requerida', value: 'Todos los jugadores deben completar la whitelist en la web para obtener acceso al servidor.' },
                { name: '🌐 Enlaces', value: '[🔗 Ir a la Website](https://trapcity-rp-website-v2.onrender.com)\n[📋 Hacer Whitelist](https://trapcity-rp-website-v2.onrender.com/whitelist)' }
            )
            .setFooter({ text: 'TrapCity RP • 1 Mes Online', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 Ver Reglas Completas')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://trapcity-rp-website-v2.onrender.com/reglas'),
                new ButtonBuilder()
                    .setLabel('📝 Hacer Whitelist')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://trapcity-rp-website-v2.onrender.com/whitelist')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

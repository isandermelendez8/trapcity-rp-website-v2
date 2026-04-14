const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embeds')
        .setDescription('Envía embeds informativos a canales específicos')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de embed a enviar')
                .setRequired(true)
                .addChoices(
                    { name: 'PRONTO', value: 'pronto' },
                    { name: 'TRABAJANDO EN ESO', value: 'trabajando' },
                    { name: 'ONLYSTARS', value: 'onlystars' }
                )),

    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        
        const stickerId = '1493688369132081152';
        const header = '✦ ━━━━ 💜 TRAPCITY RP 💜 ━━━━ ✦';
        
        let embed;
        let channelId;

        if (tipo === 'pronto') {
            channelId = '1492734388218105866';
            embed = new EmbedBuilder()
                .setTitle(header)
                .setDescription('# 🔜 **PRONTO**\n\n> *Muy pronto estaremos revelando grandes cosas...*\n\n¡Mantente atento a los anuncios!')
                .setColor(0xFFD700) // Dorado
                .setImage(`https://cdn.discordapp.com/stickers/${stickerId}.png`)
                .setFooter({ text: 'TrapCity RP • 1 Mes Online', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
        } 
        else if (tipo === 'trabajando') {
            channelId = '1492736137058324533';
            embed = new EmbedBuilder()
                .setTitle(header)
                .setDescription('# 🛠️ **TRABAJANDO EN ESO...**\n\n> *Nuestro equipo está trabajando arduamente para traerte la mejor experiencia.*\n\nGracias por tu paciencia. 💜')
                .setColor(0xFFA500) // Naranja
                .setImage(`https://cdn.discordapp.com/stickers/${stickerId}.png`)
                .setFooter({ text: 'TrapCity RP • 1 Mes Online', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
        }
        else if (tipo === 'onlystars') {
            channelId = '1492736084965064774';
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('📸 Instagram')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://www.instagram.com/shoot4greatness/')
                );
            
            embed = new EmbedBuilder()
                .setTitle(header)
                .setDescription(`# 🚀 ONLYSTARS RP — COMING SOON 🚀

Nos complace anunciar que estamos trabajando en abrir un nuevo mundo de oportunidades con nuestro servidor de roleplay **OnlyStars**.

Por ahora, no daremos muchos detalles ni spoilers… 👀
Pero pueden estar seguros de que estamos enfocados en brindarles la mejor experiencia posible. Muy pronto estaremos revelando toda la información oficial, incluyendo el día de apertura.

⭐ **Tenemos propuestas para ustedes:**
Estaremos atentos a todas las personas que inviten amigos al Discord. Aquellos que traigan gente activa (ganga, corillo, como ustedes quieran llamarlo) serán **PREMIADOS**.

Manténganse pendientes… esto apenas comienza.

**TRAP CITY RP**
**SHOOT 4 GREATNESS… 🔥**`)
                .setColor(0xFF1493) // Rosa fuerte
                .setImage(`https://cdn.discordapp.com/stickers/${stickerId}.png`)
                .setFooter({ text: 'TrapCity RP • 1 Mes Online', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            const channel = await interaction.client.channels.fetch(channelId);
            await channel.send({ embeds: [embed], components: [row] });
            
            return interaction.reply({ content: `✅ Embed de OnlyStars enviado a <#${channelId}>`, ephemeral: true });
        }

        const channel = await interaction.client.channels.fetch(channelId);
        await channel.send({ embeds: [embed] });
        
        await interaction.reply({ content: `✅ Embed **${tipo.toUpperCase()}** enviado a <#${channelId}>`, ephemeral: true });
    }
};

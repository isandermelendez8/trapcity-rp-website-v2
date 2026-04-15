const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class WelcomeHandler {
    constructor(client) {
        this.client = client;
        this.welcomeChannelId = '1492956231306842132';
        this.stickerId = '1493688369132081152';
    }

    async handle(member) {
        try {
            const channel = await this.client.channels.fetch(this.welcomeChannelId);
            if (!channel) return;

            // Calcular fecha de unión formateada
            const joinDate = member.joinedAt;
            const formattedDate = joinDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const embed = new EmbedBuilder()
                .setTitle('✦ ━━━━ 💜 TRAPCITY RP 💜 ━━━━ ✦')
                .setDescription(`🎉 **¡Bienvenido a TrapCity RP, ${member.user}!** 🎉`)
                .setColor(0x8B5CF6)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '👤 Usuario', value: `${member.user.tag}`, inline: true },
                    { name: '📅 Se unió el', value: `${formattedDate}`, inline: true },
                    { name: '📊 Eres el miembro #', value: `${member.guild.memberCount}`, inline: true }
                )
                .setImage(`https://cdn.discordapp.com/stickers/${this.stickerId}.png`) // Sticker como imagen
                .setFooter({ 
                    text: `TrapCity RP • 1 Mes Online • ${member.guild.name}`, 
                    iconURL: member.guild.iconURL() 
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🌐 Ir a la Website')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://trapcity-rp-website-v2.onrender.com'),
                    new ButtonBuilder()
                        .setLabel('📋 Hacer Whitelist')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://trapcity-rp-website-v2.onrender.com/whitelist'),
                    new ButtonBuilder()
                        .setLabel('📜 Ver Reglas')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://trapcity-rp-website-v2.onrender.com/reglas')
                );

            await channel.send({ 
                content: `${member}`, // Menciona al usuario
                embeds: [embed], 
                components: [row] 
            });

            console.log(`✅ Mensaje de bienvenida enviado a ${member.user.tag}`);
        } catch (error) {
            console.error('❌ Error enviando bienvenida:', error);
        }
    }
}

module.exports = WelcomeHandler;

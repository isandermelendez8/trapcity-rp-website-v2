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
                    { name: '🔜 PRONTO', value: 'pronto' },
                    { name: '🛠️ TRABAJANDO EN ESO', value: 'trabajando' },
                    { name: '🚀 TRAPCITY COMING SOON', value: 'onlystars' }
                )),

    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        
        const stickerId = '1493688369132081152';
        const header = '✦ ━━━━ 💜 TRAPCITY RP 💜 ━━━━ ✦';
        
        let embed;
        let channelId;

        if (tipo === 'pronto') {
            channelId = '1492734388218105866';
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🔔 Activar Notificaciones')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('notificar_pronto'),
                    new ButtonBuilder()
                        .setLabel('💬 Sugerencias')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId('sugerencias_pronto')
                );
            
            embed = new EmbedBuilder()
                .setTitle(header)
                .setDescription(`# ⏳ **¡PRONTO!** ⏳

> 🎭 *"El tiempo es oro, y nosotros lo invertimos en crear la mejor experiencia para ti."*

## 🔥 ¿Qué se viene?

⚡ Nuevos sistemas de roleplay
🎨 Rediseño completo del servidor  
🎁 Eventos especiales para la comunidad
📢 Anuncios exclusivos muy pronto

---

💜 **Mantente conectado**, las sorpresas están a la vuelta de la esquina.

*¡No te lo pierdas!* 🚀`)
                .setColor(0xFFD700)
                .setThumbnail(`https://cdn.discordapp.com/stickers/${stickerId}.png`)
                .setFooter({ text: '⏰ TrapCity RP • Pronto grandes noticias', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            const channel = await interaction.client.channels.fetch(channelId);
            await channel.send({ embeds: [embed], components: [row] });
            
            return interaction.reply({ content: `✅ Embed **PRONTO** enviado a <#${channelId}>`, ephemeral: true });
        } 
        else if (tipo === 'trabajando') {
            channelId = '1492736137058324533';
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('👷‍♂️ Ver Progreso')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('progreso_dev'),
                    new ButtonBuilder()
                        .setLabel('🐛 Reportar Bug')
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId('reportar_bug')
                );
            
            embed = new EmbedBuilder()
                .setTitle(header)
                .setDescription(`# 🛠️ **TRABAJANDO EN ESO...** 🛠️

> 💪 *"Rome no se construyó en un día, pero TrapCity RP se está construyendo con pasión."*

## 📋 Estado Actual del Desarrollo

🟢 **Sistemas principales:** Funcionando
🟡 **Optimizaciones:** En progreso (75%)
🔵 **Nuevas features:** En testing
🟣 **Polishing:** Activo

---

🔧 **Nuestro equipo de desarrollo está:**
• Arreglando bugs reportados
• Optimizando el rendimiento
• Añadiendo nuevas mecánicas
• Testeando con la comunidad

💜 **Gracias por tu paciencia.** ¡El resultado valdrá la pena!`)
                .setColor(0xFF6B35) // Naranja vibrante
                .setThumbnail(`https://cdn.discordapp.com/stickers/${stickerId}.png`)
                .setFooter({ text: '👷 TrapCity RP • Trabajando para ti', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            const channel = await interaction.client.channels.fetch(channelId);
            await channel.send({ embeds: [embed], components: [row] });
            
            return interaction.reply({ content: `✅ Embed **TRABAJANDO EN ESO** enviado a <#${channelId}>`, ephemeral: true });
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
                .setDescription(`# 🚀 **TRAPCITY RP — COMING SOON** 🚀

Nos complace anunciar que estamos trabajando en abrir un **nuevo mundo de oportunidades** con nuestro servidor de roleplay **TRAPCITY RP**.

Por ahora, no daremos muchos detalles ni spoilers… 👀
Pero pueden estar seguros de que estamos enfocados en brindarles **la mejor experiencia posible**. Muy pronto estaremos revelando **toda la información oficial**, incluyendo el **día de apertura**.

⭐ **Tenemos propuestas para ustedes:**
Estaremos atentos a todas las personas que inviten amigos al Discord. Aquellos que traigan gente activa (ganga, corillo, como ustedes quieran llamarlo) serán **PREMIADOS**.

Manténganse pendientes… esto apenas comienza.

**TRAP CITY RP**
**SHOOT 4 GREATNESS… 🔥**`)
                .setColor(0x8B5CF6) // Rosa fuerte
                .setImage(`https://cdn.discordapp.com/stickers/${stickerId}.png`)
                .setFooter({ text: 'TrapCity RP • 1 Mes Online', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            const channel = await interaction.client.channels.fetch(channelId);
            await channel.send({ embeds: [embed], components: [row] });
            
            return interaction.reply({ content: `✅ Embed **TRAPCITY** enviado a <#${channelId}>`, ephemeral: true });
        }

        const channel = await interaction.client.channels.fetch(channelId);
        await channel.send({ embeds: [embed] });
        
        await interaction.reply({ content: `✅ Embed **${tipo.toUpperCase()}** enviado a <#${channelId}>`, ephemeral: true });
    }
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cron = require('node-cron');

class RecurringMessagesHandler {
    constructor(client) {
        this.client = client;
        this.channelId = '1492736084965064774';
        this.stickerId = '1493688369132081152';
        this.header = '✦ ━━━━ 💜 TRAPCITY RP 💜 ━━━━ ✦';
        this.cronJob = null;
    }

    start() {
        // Cada 14 horas: 0 0 */14 * * *
        // Formato cron: minuto hora día-mes mes día-semana
        this.cronJob = cron.schedule('0 */14 * * *', async () => {
            await this.sendOnlyStarsMessage();
        }, {
            scheduled: true,
            timezone: 'America/New_York' // Ajusta a tu zona horaria
        });

        console.log('✅ Sistema de mensajes recurrentes iniciado (cada 14 horas)');
    }

    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            console.log('⏹️ Sistema de mensajes recurrentes detenido');
        }
    }

    async sendOnlyStarsMessage() {
        try {
            const channel = await this.client.channels.fetch(this.channelId);
            if (!channel) {
                console.error('❌ Canal de OnlyStars no encontrado');
                return;
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('📸 Instagram')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://www.instagram.com/shoot4greatness/')
                );

            const embed = new EmbedBuilder()
                .setTitle(this.header)
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
                .setImage(`https://cdn.discordapp.com/stickers/${this.stickerId}.png`)
                .setFooter({ text: 'TrapCity RP • 1 Mes Online', iconURL: channel.guild.iconURL() })
                .setTimestamp();

            await channel.send({ embeds: [embed], components: [row] });
            console.log('✅ Mensaje recurrente de OnlyStars enviado');
        } catch (error) {
            console.error('❌ Error enviando mensaje recurrente:', error);
        }
    }

    // Forzar envío manual (para pruebas)
    async sendNow() {
        await this.sendOnlyStarsMessage();
    }
}

module.exports = RecurringMessagesHandler;

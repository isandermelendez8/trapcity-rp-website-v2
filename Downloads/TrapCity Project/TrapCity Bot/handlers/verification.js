const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const Embeds = require('../embeds');
const { dbAsync } = require('../database');
const config = require('../config');
const axios = require('axios');

// Tokens de verificación activos (en memoria)
const verificationTokens = new Map();

class VerificationHandler {
    constructor(client) {
        this.client = client;
    }

    // Crear panel de verificación
    async createVerificationPanel(channel) {
        const embed = Embeds.verification();
        
        const button = new ButtonBuilder()
            .setCustomId('start_verification')
            .setLabel('🔐 Verificarme')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({ embeds: [embed], components: [row] });
    }

    // Iniciar proceso de verificación
    async startVerification(interaction) {
        // Defer reply inmediatamente para evitar timeout
        await interaction.deferReply({ ephemeral: true });
        
        const user = interaction.user;
        
        // Verificar si ya está verificado
        const existing = await dbAsync.get(
            'SELECT * FROM verified_users WHERE discord_id = ?',
            [user.id]
        );
        
        if (existing) {
            return interaction.editReply({
                content: '❌ Ya estás verificado en el servidor.'
            });
        }

        // Obtener información del miembro
        const guild = interaction.guild;
        const member = await guild.members.fetch(user.id);
        
        // ===== VERIFICACIÓN ANTI-ALT AVANZADA =====
        
        // 1. Verificar edad de cuenta (7-30 días)
        const accountAge = Date.now() - user.createdAt.getTime();
        const days = Math.floor(accountAge / (1000 * 60 * 60 * 24));
        
        let riskScore = 0;
        let riskFactors = [];
        let accountAgeStatus = '';
        
        if (days < 7) {
            return interaction.editReply({
                content: `❌ **Verificación Rechazada**\nTu cuenta es muy nueva.\n📅 Edad mínima requerida: 7 días\n📅 Tu cuenta: ${days} días\n\n⏳ Vuelve a intentar cuando tu cuenta tenga al menos 7 días.`
            });
        } else if (days >= 7 && days <= 13) {
            accountAgeStatus = '✅ Cuenta con edad mínima (7-13 días)';
            riskScore += 10;
        } else if (days >= 14 && days <= 30) {
            accountAgeStatus = '🌟 Cuenta con buena edad (14-30 días)';
        } else {
            accountAgeStatus = '✅ Cuenta establecida (30+ días)';
        }
        
        // 2. Verificar avatar (sin avatar = sospechoso pero puede pasar)
        const hasAvatar = user.avatar !== null;
        if (!hasAvatar) {
            riskFactors.push('🚫 Sin avatar de perfil');
            riskScore += 15;
        }
        
        // 3. Verificar nombre de usuario (detectar nombres generados/auto)
        const username = user.username;
        const suspiciousPatterns = [
            /^[a-z]+[0-9]{3,6}$/i,  // nombre123456
            /^[a-z]{2}[0-9]{4,8}$/i,  // ab12345678
            /^(user|usuario|player|jugador)[0-9]+$/i,  // user123
            /^[0-9]{6,}$/,  // solo números
            /(.)\1{3,}/,  // caracteres repetidos (aaaa, 1111)
        ];
        
        let isSuspiciousName = false;
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(username)) {
                isSuspiciousName = true;
                break;
            }
        }
        
        // Nombres muy cortos o muy largos
        if (username.length < 4 || username.length > 20) {
            isSuspiciousName = true;
        }
        
        if (isSuspiciousName) {
            riskFactors.push('🆔 Nombre de usuario sospechoso (posiblemente generado automáticamente)');
            riskScore += 20;
        }
        
        // 4. Verificar actividad del miembro en el servidor
        const joinDate = member.joinedAt;
        const daysInServer = Math.floor((Date.now() - joinDate) / (1000 * 60 * 60 * 24));
        
        // Obtener última actividad (mensajes)
        const lastActivity = await this.getLastActivity(member);
        const daysSinceActivity = lastActivity ? Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24)) : null;
        
        if (daysSinceActivity === null) {
            riskFactors.push('📉 Sin actividad previa detectada (sin mensajes)');
            riskScore += 25;
        } else if (daysSinceActivity > 14) {
            riskFactors.push(`📉 Sin actividad en ${daysSinceActivity} días (>2 semanas)`);
            riskScore += 15;
        }
        
        // 5. Verificar si ya existe verificación con mismo número/email (se hace en web)
        // 6. Verificar IP previa (se hace en web)
        
        // Evaluación final de riesgo
        let riskLevel = 'BAJO';
        if (riskScore >= 40) riskLevel = 'ALTO';
        else if (riskScore >= 20) riskLevel = 'MEDIO';
        
        // Si el riesgo es muy alto, requerir revisión manual
        if (riskScore >= 50) {
            return interaction.editReply({
                content: `⚠️ **Verificación en Revisión Manual**\n\nTu cuenta ha sido marcada para revisión manual por múltiples factores de riesgo:\n${riskFactors.map(f => `• ${f}`).join('\n')}\n\n📊 Puntuación de riesgo: ${riskScore}/100 (${riskLevel})\n\n⏳ Un administrador revisará tu caso manualmente. Esto puede tomar 24-48 horas.`
            });
        }
        
        // Guardar datos de verificación para el log
        this.verificationData = {
            accountAge: days,
            accountAgeStatus,
            hasAvatar,
            isSuspiciousName,
            daysInServer,
            daysSinceActivity,
            riskScore,
            riskLevel,
            riskFactors
        };
        
        // Generar token único
        const token = this.generateToken(user.id);
        verificationTokens.set(user.id, {
            token,
            attempts: 0,
            createdAt: Date.now(),
            userId: user.id,
            username: user.tag
        });

        // Enviar link de verificación web
        const webUrl = process.env.WEBSITE_URL || 'http://localhost:3000';
        const verifyUrl = `${webUrl}/verify?token=${token}&userId=${user.id}`;

        await interaction.editReply({
            content: `🔐 **Proceso de Verificación Iniciado**\n\nHaz clic en el siguiente enlace para completar tu verificación:\n${verifyUrl}\n\n⏰ Este enlace expira en **10 minutos** y tiene **3 intentos** máximos.\n\n⚠️ **IMPORTANTE:**\n• La verificación debe hacerse desde PC\n• No uses VPN\n• Completa el captcha correctamente`
        });

        // Log
        const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
        if (logChannel) {
            await logChannel.send({
                embeds: [Embeds.log('member_join', user, 'Verificación Iniciada', 
                    `Usuario inició proceso de verificación\nEdad cuenta: ${days} días`)]
            });
        }
    }

    // Generar token único
    generateToken(userId) {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    // Verificar token
    async verifyToken(token, userId, ipData) {
        const data = verificationTokens.get(userId);
        
        if (!data || data.token !== token) {
            return { success: false, error: 'Token inválido' };
        }

        if (Date.now() - data.createdAt > 10 * 60 * 1000) { // 10 minutos
            verificationTokens.delete(userId);
            return { success: false, error: 'Token expirado' };
        }

        if (data.attempts >= 3) {
            verificationTokens.delete(userId);
            return { success: false, error: 'Demasiados intentos fallidos' };
        }

        // Verificar si ya está verificado (doble check)
        const existing = await dbAsync.get(
            'SELECT * FROM verified_users WHERE discord_id = ?',
            [userId]
        );
        
        if (existing) {
            return { success: false, error: 'Usuario ya verificado' };
        }

        // Verificar blacklist por IP
        const blacklisted = await dbAsync.get(
            'SELECT * FROM blacklist WHERE ip_address = ?',
            [ipData.ip]
        );

        if (blacklisted) {
            // Log de intento de blacklist
            const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
            if (logChannel) {
                const user = await this.client.users.fetch(userId).catch(() => null);
                await logChannel.send({
                    embeds: [Embeds.log('ban', user, 'Intento de Verificación - IP Blacklist', 
                        `IP: ${ipData.ip}\nRazón blacklist: ${blacklisted.reason}`)]
                });
            }
            return { success: false, error: 'IP en blacklist' };
        }

        // Éxito - guardar en DB con datos extendidos
        const riskData = this.verificationData || {};
        await dbAsync.run(
            `INSERT INTO verified_users (discord_id, username, account_created, ip_address, country, region, city, risk_score, risk_level, account_age_days, has_avatar) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                data.username, 
                new Date().toISOString(), 
                ipData.ip, 
                ipData.country, 
                ipData.region, 
                ipData.city,
                riskData.riskScore || 0,
                riskData.riskLevel || 'BAJO',
                riskData.accountAge || 0,
                riskData.hasAvatar ? 1 : 0
            ]
        );

        verificationTokens.delete(userId);

        // Asignar roles en Discord
        await this.assignVerifiedRoles(userId);

        // Enviar log detallado con datos de riesgo
        const guild = await this.client.guilds.fetch(config.GUILD_ID);
        const member = await guild.members.fetch(userId).catch(() => null);
        const user = await this.client.users.fetch(userId).catch(() => null);
        
        const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
        if (logChannel && user) {
            const riskData = this.verificationData || {};
            const riskInfo = `
📊 **Evaluación de Riesgo:** ${riskData.riskScore || 0}/100 (${riskData.riskLevel || 'BAJO'})

${riskData.accountAgeStatus || '✅ Cuenta verificada'}
${riskData.hasAvatar ? '✅ Con avatar' : '🚫 Sin avatar'}
${riskData.isSuspiciousName ? '🆔 Nombre sospechoso' : '✅ Nombre normal'}
📅 Días en servidor: ${riskData.daysInServer || 'N/A'}
⏱️ Última actividad: ${riskData.daysSinceActivity !== null ? `${riskData.daysSinceActivity} días` : 'Sin actividad'}

${riskData.riskFactors?.length > 0 ? `⚠️ **Factores de riesgo:**\n${riskData.riskFactors.join('\n')}` : '✅ Sin factores de riesgo'}

🌍 **IP:** ${ipData.ip}
📍 **Ubicación:** ${ipData.city}, ${ipData.region}, ${ipData.country}
            `;
            
            await logChannel.send({
                embeds: [Embeds.verificationLog(user, { ...ipData, riskInfo })]
            });
        }

        return { success: true };
    }

    // Asignar roles de verificado
    async assignVerifiedRoles(userId) {
        const guild = await this.client.guilds.fetch(config.GUILD_ID);
        const member = await guild.members.fetch(userId).catch(() => null);
        
        if (!member) return;

        const rolesToAdd = [];
        const rolesToRemove = [];

        // Remover no verificado
        if (config.roles.unverified) {
            rolesToRemove.push(config.roles.unverified);
        }

        // Agregar verificados
        if (config.roles.verified) {
            rolesToAdd.push(config.roles.verified);
        }
        if (config.roles.verified2) {
            rolesToAdd.push(config.roles.verified2);
        }

        try {
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove);
            }
            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd);
            }
        } catch (err) {
            console.error('Error asignando roles:', err);
        }
    }

    // Comando para verificar manualmente (admin)
    async manualVerify(interaction, targetUser) {
        await interaction.deferReply({ ephemeral: false });
        
        const isAdmin = interaction.member.roles.cache.has(config.roles.admin);

        if (!isAdmin) {
            return interaction.editReply({ content: '❌ Solo administradores' });
        }

        // Verificar si ya está verificado
        const existing = await dbAsync.get(
            'SELECT * FROM verified_users WHERE discord_id = ?',
            [targetUser.id]
        );

        if (existing) {
            return interaction.editReply({
                content: `❌ ${targetUser.tag} ya está verificado.`
            });
        }

        // Verificar manualmente
        await dbAsync.run(
            `INSERT INTO verified_users (discord_id, username, account_created, verified_at) 
             VALUES (?, ?, ?, ?)`,
            [targetUser.id, targetUser.tag, new Date().toISOString(), new Date().toISOString()]
        );

        // Asignar roles
        await this.assignVerifiedRoles(targetUser.id);

        // Log
        const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
        if (logChannel) {
            await logChannel.send({
                embeds: [Embeds.log('whitelist_approve', targetUser, 'Verificación Manual', 
                    `Verificado por: ${interaction.user.tag}`)]
            });
        }

        await interaction.editReply({
            content: `✅ ${targetUser.tag} ha sido verificado manualmente.`
        });
    }

    // Comando para blacklist
    async addToBlacklist(interaction, target, reason, serverName = null) {
        await interaction.deferReply({ ephemeral: false });
        
        const isAdmin = interaction.member.roles.cache.has(config.roles.admin);

        if (!isAdmin) {
            return interaction.editReply({ content: '❌ Solo administradores' });
        }

        // Obtener IP del usuario si está verificado
        const userData = await dbAsync.get(
            'SELECT ip_address FROM verified_users WHERE discord_id = ?',
            [target.id]
        );

        await dbAsync.run(
            `INSERT INTO blacklist (discord_id, ip_address, reason, server_name, banned_at, added_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [target.id, userData?.ip_address || null, reason, serverName, new Date().toISOString(), interaction.user.id]
        );

        // Banear del servidor
        const guild = await this.client.guilds.fetch(config.GUILD_ID);
        const member = await guild.members.fetch(target.id).catch(() => null);
        
        if (member) {
            await member.ban({ reason: `Blacklisted: ${reason}` });
        }

        // Log
        const logChannel = await this.client.channels.fetch(config.channels.securityLogs).catch(() => null);
        if (logChannel) {
            await logChannel.send({
                embeds: [Embeds.log('ban', target, 'Usuario Blacklisteado', 
                    `Razón: ${reason}\nServidor: ${serverName || 'N/A'}\nPor: ${interaction.user.tag}`)]
            });
        }

        await interaction.editReply({
            content: `✅ ${target.tag} ha sido añadido a la blacklist y baneado.`
        });
    }

    // Obtener última actividad del usuario (último mensaje)
    async getLastActivity(member) {
        try {
            // Buscar en canales recientes
            const guild = member.guild;
            const channels = await guild.channels.fetch();
            
            let lastMessage = null;
            
            for (const [, channel] of channels) {
                if (channel.isTextBased() && !channel.isDMBased()) {
                    try {
                        const messages = await channel.messages.fetch({ limit: 100 });
                        const userMessages = messages.filter(m => m.author.id === member.id);
                        
                        if (userMessages.size > 0) {
                            const latest = userMessages.first();
                            if (!lastMessage || latest.createdTimestamp > lastMessage.createdTimestamp) {
                                lastMessage = latest;
                            }
                        }
                    } catch (err) {
                        // Ignorar canales sin permisos
                    }
                }
            }
            
            return lastMessage ? lastMessage.createdTimestamp : null;
        } catch (err) {
            console.error('Error obteniendo última actividad:', err);
            return null;
        }
    }

    // Verificar si teléfono/email ya fueron usados (se llama desde la web)
    async checkPhoneEmailUnique(phoneHash, emailHash) {
        const existing = await dbAsync.get(
            'SELECT * FROM verified_users WHERE phone_hash = ? OR email_hash = ?',
            [phoneHash, emailHash]
        );
        return existing;
    }
}

module.exports = VerificationHandler;

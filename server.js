import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import svgCaptcha from 'svg-captcha';
import dotenv from 'dotenv';
import { db, dbAsync } from './database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// ==================== MIDDLEWARE ====================

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder (Vite build output)
const distPath = path.join(__dirname, 'dist');
console.log('📁 Serving static files from:', distPath);

app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit per IP
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' // Skip health checks
});
app.use(limiter);

// Rate limit specific for whitelist
const whitelistLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // 3 attempts per day
    message: 'Has excedido el límite de intentos. Vuelve en 24 horas.'
});

// ==================== PASSPORT CONFIG ====================

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds', 'guilds.join']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if in guild
        const guildMember = profile.guilds?.find(g => g.id === process.env.DISCORD_GUILD_ID);
        
        const userData = {
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            email: profile.email,
            inGuild: !!guildMember,
            guildMember
        };
        
        return done(null, userData);
    } catch (err) {
        return done(err, null);
    }
}));

// ==================== VERIFICATION ====================

// Verify endpoint - receives verification link from bot
app.get('/verify', async (req, res) => {
    try {
        const { token, userId } = req.query;
        
        if (!token || !userId) {
            return res.status(400).send('Missing token or userId');
        }
        
        // Call bot API to verify
        if (process.env.BOT_API_URL) {
            try {
                const response = await axios.post(`${process.env.BOT_API_URL}/api/verify`, {
                    token,
                    userId,
                    ipData: req.ip
                }, {
                    headers: { 'Authorization': process.env.BOT_SECRET }
                });
                
                if (response.data.success) {
                    // Redirect to success page or dashboard
                    return res.redirect('/verification-success');
                } else {
                    return res.status(400).send(response.data.error || 'Verification failed');
                }
            } catch (err) {
                console.error('Error calling bot verify API:', err.message);
                return res.status(500).send('Error verifying');
            }
        } else {
            return res.status(500).send('Bot API not configured');
        }
    } catch (err) {
        console.error('Error in verify route:', err);
        res.status(500).send('Server error');
    }
});

// Success page
app.get('/verification-success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Verificación Exitosa</title>
            <style>
                body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a1a; color: white; }
                .container { text-align: center; }
                h1 { color: #4ade80; }
                a { color: #a78bfa; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Verificación Exitosa</h1>
                <p>Tu cuenta ha sido verificada correctamente.</p>
                <p><a href="/">Ir al inicio</a> | <a href="/dashboard">Ir al Dashboard</a></p>
            </div>
        </body>
        </html>
    `);
});

// ==================== HELPERS ====================

function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

// Simple whitelist questions (you can expand this)
const whitelistQuestions = [
    {
        id: 1,
        category: 'Conceptos Básicos',
        question: '¿Qué significa IC?',
        options: ['In Character', 'In Community', 'In City', 'In Chat'],
        correct: 0
    },
    {
        id: 2,
        category: 'Conceptos Básicos', 
        question: '¿Qué significa OOC?',
        options: ['Out of Character', 'Out of Community', 'Out of City', 'Out of Chat'],
        correct: 0
    },
    {
        id: 3,
        category: 'Conceptos Básicos',
        question: '¿Qué es el Power Gaming?',
        options: [
            'Realizar acciones imposibles en la vida real',
            'Jugar con mucho poder',
            'Usar armas poderosas',
            'Tener un personaje fuerte'
        ],
        correct: 0
    }
];

// ==================== ROUTES ====================

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('Discord OAuth success, user:', req.user?.id, req.user?.username);
        res.redirect('/dashboard');
    }
);

app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Whitelist Routes
app.get('/api/whitelist/questions', requireAuth, (req, res) => {
    // Return questions without correct answers
    const questionsForClient = whitelistQuestions.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options
    }));
    res.json({ questions: questionsForClient });
});

app.post('/api/whitelist/submit', requireAuth, whitelistLimiter, async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        const userId = req.user.id;
        const username = req.user.username;
        
        // Calculate score
        let correct = 0;
        answers.forEach((answer, index) => {
            if (whitelistQuestions[index] && answer === whitelistQuestions[index].correct) {
                correct++;
            }
        });
        
        const score = Math.round((correct / whitelistQuestions.length) * 100);
        
        // Save to database
        await dbAsync.run(
            `INSERT INTO whitelist_attempts (discord_id, username, score, correct_answers, time_taken, answers, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, score, correct, timeTaken, JSON.stringify(answers), score >= 80 ? 'approved' : 'pending']
        );
        
        // Notify bot
        if (process.env.BOT_API_URL) {
            try {
                await axios.post(`${process.env.BOT_API_URL}/api/whitelist/submit`, {
                    userId,
                    username,
                    score,
                    correct,
                    timeTaken
                }, {
                    headers: { 'Authorization': process.env.BOT_SECRET }
                });
            } catch (err) {
                console.error('Error notifying bot:', err.message);
            }
        }
        
        res.json({ 
            success: true, 
            score, 
            correct, 
            total: whitelistQuestions.length,
            passed: score >= 80 
        });
    } catch (err) {
        console.error('Error submitting whitelist:', err);
        res.status(500).json({ error: 'Error processing submission' });
    }
});

// Captcha Routes
app.get('/api/captcha', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 6,
        noise: 3,
        color: true,
        background: '#f0f0f0'
    });
    
    const token = Math.random().toString(36).substring(2);
    
    // Save to session
    req.session.captcha = {
        text: captcha.text.toLowerCase(),
        token,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    res.json({
        token,
        svg: captcha.data
    });
});

app.post('/api/captcha/verify', (req, res) => {
    const { token, answer } = req.body;
    
    if (!req.session.captcha || req.session.captcha.token !== token) {
        return res.json({ valid: false, error: 'Invalid or expired captcha' });
    }
    
    if (Date.now() > req.session.captcha.expires) {
        return res.json({ valid: false, error: 'Captcha expired' });
    }
    
    const valid = req.session.captcha.text === answer.toLowerCase();
    
    if (valid) {
        delete req.session.captcha;
    }
    
    res.json({ valid });
});

// Stats Route - Database stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalAttempts = await dbAsync.get('SELECT COUNT(*) as count FROM whitelist_attempts');
        const approved = await dbAsync.get("SELECT COUNT(*) as count FROM whitelist_attempts WHERE status = 'approved'");
        const pending = await dbAsync.get("SELECT COUNT(*) as count FROM whitelist_attempts WHERE status = 'pending'");
        
        res.json({
            total: totalAttempts?.count || 0,
            approved: approved?.count || 0,
            pending: pending?.count || 0
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// Discord Server Stats Route
app.get('/api/discord/stats', async (req, res) => {
    try {
        const guildId = process.env.DISCORD_GUILD_ID;
        const botToken = process.env.DISCORD_BOT_TOKEN;
        
        if (!botToken) {
            // Return fallback stats if no bot token
            return res.json({
                online: 0,
                total: 0,
                active: 50,
                whitelists: 120,
                fallback: true
            });
        }
        
        // Fetch guild info from Discord API
        const guildResponse = await axios.get(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
            headers: {
                'Authorization': `Bot ${botToken}`
            }
        });
        
        const guild = guildResponse.data;
        
        res.json({
            online: guild.approximate_presence_count || 0,
            total: guild.approximate_member_count || 0,
            active: guild.approximate_presence_count || 0,
            whitelists: 50,
            serverName: guild.name,
            serverIcon: guild.icon
        });
    } catch (err) {
        console.error('Error fetching Discord stats:', err.message);
        // Return fallback stats on error
        res.json({
            online: 0,
            total: 0,
            active: 50,
            whitelists: 120,
            error: 'Failed to fetch Discord stats'
        });
    }
});

// User profile route (requires auth)
app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        
        // Get whitelist status from database
        const whitelistStatus = await dbAsync.get(
            'SELECT status, score FROM whitelist_attempts WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1',
            [user.id]
        );
        
        res.json({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            email: user.email,
            inGuild: user.inGuild,
            whitelistStatus: whitelistStatus?.status || 'none',
            whitelistScore: whitelistStatus?.score || 0
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving index.html:', err);
            res.status(500).send('Error loading application');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🚀 Website: http://localhost:${PORT}`);
});

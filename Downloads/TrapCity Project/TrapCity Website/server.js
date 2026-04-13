const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const svgCaptcha = require('svg-captcha');
require('dotenv').config();

const { db, dbAsync } = require('./database');
const { whitelistQuestions } = require('./questions');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite por IP
});
app.use(limiter);

// Rate limit específico para whitelist
const whitelistLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 3, // 3 intentos por día
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
        // Verificar si está en el servidor
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

// ==================== HELPERS ====================

function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

function requireGuild(req, res, next) {
    if (!req.user.inGuild) {
        return res.render('error', { 
            message: 'Debes unirte a nuestro servidor de Discord para continuar',
            invite: process.env.DISCORD_INVITE || '#'
        });
    }
    next();
}

// Verificar si ya tiene whitelist
async function hasWhitelist(userId) {
    const result = await dbAsync.get(
        'SELECT * FROM whitelist_attempts WHERE discord_id = ? AND status = ?',
        [userId, 'approved']
    );
    return !!result;
}

// Verificar intentos recientes
async function canAttemptWhitelist(userId) {
    const lastAttempt = await dbAsync.get(
        'SELECT * FROM whitelist_attempts WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
    );
    
    if (!lastAttempt) return true;
    
    // Si fue rechazado, verificar 24 horas
    if (lastAttempt.status === 'denied') {
        const hoursSince = (Date.now() - new Date(lastAttempt.created_at).getTime()) / (1000 * 60 * 60);
        return hoursSince >= 24;
    }
    
    // Si está pendiente o aprobado, no puede intentar
    return false;
}

// ==================== RUTAS AUTH ====================

app.get('/login', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// ==================== RUTAS PÚBLICAS ====================

app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/rules', (req, res) => {
    res.render('rules', { user: req.user });
});

// ==================== RUTAS PROTEGIDAS ====================

app.get('/dashboard', requireAuth, requireGuild, async (req, res) => {
    const applications = await dbAsync.all(
        'SELECT * FROM whitelist_attempts WHERE discord_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );
    
    res.render('dashboard', { 
        user: req.user,
        applications,
        hasWhitelist: await hasWhitelist(req.user.id)
    });
});

// ==================== WHITELIST ====================

app.get('/whitelist', requireAuth, requireGuild, async (req, res) => {
    // Verificar si ya puede intentar
    const canAttempt = await canAttemptWhitelist(req.user.id);
    const hasWL = await hasWhitelist(req.user.id);
    
    if (hasWL) {
        return res.render('whitelist-complete', { user: req.user, message: 'Ya tienes whitelist aprobada' });
    }
    
    if (!canAttempt) {
        return res.render('whitelist-cooldown', { user: req.user });
    }
    
    res.render('whitelist-intro', { user: req.user });
});

app.get('/whitelist/start', requireAuth, requireGuild, async (req, res) => {
    const canAttempt = await canAttemptWhitelist(req.user.id);
    const hasWL = await hasWhitelist(req.user.id);
    
    if (hasWL || !canAttempt) {
        return res.redirect('/whitelist');
    }
    
    // Iniciar sesión de whitelist
    req.session.whitelistStart = Date.now();
    req.session.answers = {};
    req.session.currentQuestion = 0;
    
    res.redirect('/whitelist/quiz');
});

app.get('/whitelist/quiz', requireAuth, requireGuild, (req, res) => {
    if (!req.session.whitelistStart) {
        return res.redirect('/whitelist');
    }
    
    const current = req.session.currentQuestion || 0;
    const question = whitelistQuestions[current];
    
    if (!question) {
        return res.redirect('/whitelist/review');
    }
    
    // Calcular tiempo transcurrido
    const elapsed = Math.floor((Date.now() - req.session.whitelistStart) / 1000);
    
    res.render('quiz', {
        user: req.user,
        question,
        current: current + 1,
        total: whitelistQuestions.length,
        elapsed,
        answered: Object.keys(req.session.answers || {}).length
    });
});

app.post('/whitelist/answer', requireAuth, requireGuild, (req, res) => {
    const { questionIndex, answer } = req.body;
    
    if (!req.session.answers) req.session.answers = {};
    req.session.answers[questionIndex] = answer;
    
    // Ir a siguiente pregunta o revisar
    req.session.currentQuestion = parseInt(questionIndex) + 1;
    
    if (req.session.currentQuestion >= whitelistQuestions.length) {
        return res.json({ redirect: '/whitelist/review' });
    }
    
    res.json({ success: true });
});

app.post('/whitelist/navigate', requireAuth, requireGuild, (req, res) => {
    const { question } = req.body;
    req.session.currentQuestion = parseInt(question);
    res.json({ redirect: '/whitelist/quiz' });
});

app.get('/whitelist/review', requireAuth, requireGuild, (req, res) => {
    if (!req.session.answers) {
        return res.redirect('/whitelist');
    }
    
    const answers = req.session.answers;
    const reviewData = whitelistQuestions.map((q, i) => ({
        question: q.question,
        userAnswer: answers[i],
        correctAnswer: q.correct,
        index: i
    }));
    
    res.render('review', {
        user: req.user,
        questions: reviewData,
        answered: Object.keys(answers).length,
        total: whitelistQuestions.length
    });
});

app.post('/whitelist/submit', requireAuth, requireGuild, whitelistLimiter, async (req, res) => {
    if (!req.session.answers || !req.session.whitelistStart) {
        return res.status(400).json({ error: 'Sesión inválida' });
    }
    
    const answers = req.session.answers;
    const startTime = req.session.whitelistStart;
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    
    // Calcular score
    let correct = 0;
    const formattedAnswers = [];
    
    whitelistQuestions.forEach((q, i) => {
        const userAnswer = answers[i];
        const isCorrect = userAnswer === q.correct;
        if (isCorrect) correct++;
        
        formattedAnswers.push({
            question: q.question,
            answer: userAnswer,
            correct: isCorrect
        });
    });
    
    const score = Math.round((correct / whitelistQuestions.length) * 100);
    
    // Determinar estado según score
    let status = 'pending';
    if (score >= 95) {
        status = 'approved'; // Auto-approve 43-45/45
    } else if (score >= 84) {
        status = 'approved'; // Auto-approve 38-42/45
    } else if (score >= 77) {
        status = 'pending'; // 35-37/45 revisión manual
    } else {
        status = 'denied'; // Menos de 35 rechazado
    }
    
    // Guardar en DB
    await dbAsync.run(
        `INSERT INTO whitelist_attempts (discord_id, username, score, correct_answers, time_taken, answers, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.username, score, correct, timeTaken, JSON.stringify(formattedAnswers), status, new Date().toISOString()]
    );
    
    // Enviar al bot
    try {
        await axios.post(`${process.env.BOT_API_URL}/api/whitelist/submit`, {
            userId: req.user.id,
            username: req.user.username,
            score,
            time: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`,
            answers: formattedAnswers,
            correct
        }, {
            headers: { 'Authorization': process.env.BOT_SECRET }
        });
    } catch (err) {
        console.error('Error enviando al bot:', err.message);
    }
    
    // Limpiar sesión
    delete req.session.whitelistStart;
    delete req.session.answers;
    delete req.session.currentQuestion;
    
    // Redirigir según resultado
    if (status === 'approved') {
        res.json({ 
            redirect: '/whitelist/complete',
            status: 'approved',
            score
        });
    } else if (status === 'denied') {
        res.json({ 
            redirect: '/whitelist/denied',
            status: 'denied',
            score
        });
    } else {
        res.json({ 
            redirect: '/whitelist/pending',
            status: 'pending',
            score
        });
    }
});

app.get('/whitelist/complete', requireAuth, requireGuild, (req, res) => {
    res.render('whitelist-result', { 
        user: req.user, 
        status: 'approved',
        message: '¡Felicidades! Tu whitelist ha sido aprobada automáticamente.'
    });
});

app.get('/whitelist/denied', requireAuth, requireGuild, (req, res) => {
    res.render('whitelist-result', { 
        user: req.user, 
        status: 'denied',
        message: 'Tu whitelist no alcanzó el puntaje mínimo. Debes esperar 24 horas para intentar nuevamente.'
    });
});

app.get('/whitelist/pending', requireAuth, requireGuild, (req, res) => {
    res.render('whitelist-result', { 
        user: req.user, 
        status: 'pending',
        message: 'Tu whitelist está pendiente de revisión manual por el staff.'
    });
});

// ==================== VERIFICACIÓN ====================

app.get('/verify', requireAuth, async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).send('Token requerido');
    }
    
    // Generar captcha
    const captcha = svgCaptcha.create({
        size: 6,
        noise: 3,
        color: true,
        background: '#f0f0f0'
    });
    
    req.session.captchaText = captcha.text;
    req.session.verifyToken = token;
    
    res.render('verify', {
        user: req.user,
        captcha: captcha.data,
        token
    });
});

app.post('/verify', requireAuth, async (req, res) => {
    const { captcha, token } = req.body;
    
    // Verificar captcha
    if (captcha !== req.session.captchaText) {
        return res.json({ success: false, error: 'Captcha incorrecto' });
    }
    
    // Obtener datos de IP
    const ipData = {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        country: req.headers['cf-ipcountry'] || 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
    };
    
    // Enviar al bot para verificación
    try {
        const response = await axios.post(`${process.env.BOT_API_URL}/api/verify`, {
            token,
            userId: req.user.id,
            ipData
        }, {
            headers: { 'Authorization': process.env.BOT_SECRET }
        });
        
        if (response.data.success) {
            // Guardar en DB local
            await dbAsync.run(
                `INSERT OR REPLACE INTO verified_users (discord_id, username, ip_address, country, verified_at) 
                 VALUES (?, ?, ?, ?, ?)`,
                [req.user.id, req.user.username, ipData.ip, ipData.country, new Date().toISOString()]
            );
            
            res.json({ success: true });
        } else {
            res.json({ success: false, error: response.data.error || 'Error de verificación' });
        }
    } catch (err) {
        console.error('Error verificando:', err);
        res.json({ success: false, error: 'Error de conexión con el bot' });
    }
});

// ==================== API ====================

app.get('/api/user', requireAuth, (req, res) => {
    res.json(req.user);
});

app.get('/api/questions', (req, res) => {
    // Devolver preguntas sin las respuestas correctas
    const questions = whitelistQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category
    }));
    res.json(questions);
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', { 
        message: 'Error interno del servidor',
        invite: process.env.DISCORD_INVITE || '#'
    });
});

app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Página no encontrada',
        invite: process.env.DISCORD_INVITE || '#'
    });
});

// ==================== START ====================

app.listen(PORT, () => {
    console.log(`🌐 Website corriendo en http://localhost:${PORT}`);
});

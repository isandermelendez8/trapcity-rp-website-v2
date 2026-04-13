const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'trapcity.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err);
    } else {
        console.log('✅ Conectado a SQLite');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Tabla de aplicaciones whitelist
        db.run(`
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT NOT NULL,
                username TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                time_taken TEXT,
                answers TEXT,
                status TEXT DEFAULT 'pending',
                reviewer_id TEXT,
                review_comment TEXT,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                review_date DATETIME
            )
        `);

        // Tabla de usuarios verificados
        db.run(`
            CREATE TABLE IF NOT EXISTS verified_users (
                discord_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                account_created TEXT,
                ip_address TEXT,
                country TEXT,
                region TEXT,
                city TEXT,
                verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_blacklisted BOOLEAN DEFAULT 0,
                blacklist_reason TEXT,
                phone_hash TEXT,
                email_hash TEXT,
                risk_score INTEGER DEFAULT 0,
                risk_level TEXT DEFAULT 'BAJO',
                account_age_days INTEGER DEFAULT 0,
                has_avatar INTEGER DEFAULT 0,
                is_suspicious_name INTEGER DEFAULT 0
            )
        `);

        // Tabla de tickets
        db.run(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                claimed_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                closed_at DATETIME,
                close_reason TEXT,
                feedback_rating INTEGER,
                feedback_comment TEXT
            )
        `);

        // Tabla de mensajes de tickets (para transcript)
        db.run(`
            CREATE TABLE IF NOT EXISTS ticket_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER,
                user_id TEXT,
                username TEXT,
                content TEXT,
                attachments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id)
            )
        `);

        // Tabla de blacklist
        db.run(`
            CREATE TABLE IF NOT EXISTS blacklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT,
                ip_address TEXT,
                reason TEXT,
                server_name TEXT,
                banned_at DATETIME,
                added_by TEXT
            )
        `);

        // Tabla de logs
        db.run(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                user_id TEXT,
                target_id TEXT,
                action TEXT,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de staff
        db.run(`
            CREATE TABLE IF NOT EXISTS staff (
                discord_id TEXT PRIMARY KEY,
                username TEXT,
                role TEXT DEFAULT 'moderator',
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                added_by TEXT
            )
        `);

        console.log('✅ Tablas de base de datos inicializadas');
    });
}

// Helpers para consultas con Promises
const dbAsync = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, dbAsync };

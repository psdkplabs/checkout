const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const { csrfSync } = require('csrf-sync');

const app = express();
const port = process.env.PORT || 80;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    }
}));

const {
    csrfSynchronisedProtection,
    generateToken
} = csrfSync({
    getTokenFromRequest: (req) => {
        return req.body?._csrf || req.headers['x-csrf-token'];
    }
});

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(
        'CREATE TABLE users (id INT, username TEXT, password TEXT)'
    );
    db.run(
        'INSERT INTO users VALUES (?, ?, ?)',
        [1, 'admin', 'SuperSecretAdmin123!']
    );
    db.run(
        'INSERT INTO users VALUES (?, ?, ?)',
        [2, 'user_biasa', 'password123']
    );
});

app.get('/', (req, res) => {
    res.render('index', {
        name: req.query.name || 'Guest',
        csrfToken: generateToken(req)
    });
});

// Validasi token sebelum handler login
app.post('/login', csrfSynchronisedProtection, (req, res) => {
    const { username, password } = req.body;

    const query =
        'SELECT * FROM users WHERE username = ? AND password = ?';

    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.status(500).send('Database Error');
        }

        if (row) {
            return res.render('login-success', {
                username: row.username
            });
        }

        return res.status(401).render('login-failed');
    });
});

app.listen(port, () => {
    console.log(`Server mendengarkan di port ${port}`);
});
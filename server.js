const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 80;

// Setup Database SQLite di Memory
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (id INT, username TEXT, password TEXT)");
    db.run("INSERT INTO users VALUES (1, 'admin', 'SuperSecretAdmin123!')");
    db.run("INSERT INTO users VALUES (2, 'user_biasa', 'password123')");
});

app.use(express.urlencoded({ extended: true })); // Untuk parsing form login

// Halaman Utama dengan Form Login dan Celah XSS (Reflected XSS)
app.get('/', (req, res) => {
    // VULNERABILITY 1: Reflected XSS (Mencetak input user langsung ke HTML)
    const name = req.query.name || "Tamu";
    
    res.send(`
        <html>
            <head><title>Login DevSecOps Trial</title></head>
            <body>
                <h1>Selamat Datang, ${name}!</h1>
                <h2>Silakan Login</h2>
                <form action="/login" method="POST">
                    <label>Username:</label><br>
                    <input type="text" name="username"><br>
                    <label>Password:</label><br>
                    <input type="password" name="password"><br><br>
                    <button type="submit">Login</button>
                </form>
            </body>
        </html>
    `);
});

// Proses Login dengan Celah SQL Injection
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // VULNERABILITY 2: SQL Injection (Menggabungkan string input langsung ke query SQL)
    // Coba login dengan username: admin' OR '1'='1 
    // dan password terserah, Anda akan bisa masuk!
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    console.log("Mengeksekusi Query:", query); // Bahaya: mencetak query ke log

    db.get(query, (err, row) => {
        if (err) {
            res.status(500).send("Database Error");
        } else if (row) {
            res.send(`<h1>Login Berhasil! Selamat datang ${row.username}</h1>`);
        } else {
            res.status(401).send("<h1>Login Gagal! Username atau password salah.</h1>");
        }
    });
});

app.listen(port, () => {
    console.log(`Server mendengarkan di port ${port}`);
    // VULNERABILITY 3: Hardcoded Secret (TruffleHog/GitLeaks akan mendeteksi ini)
    console.log(`API_KEY_RAHASIA=AKIAIOSFODNN7EXAMPLE`); 
});
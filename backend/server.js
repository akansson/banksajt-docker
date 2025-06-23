import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

const port = 3001;

const pool = mysql.createPool({
  user: "root",
  password: "root",
  host: "localhost",
  database: "bank",
  port: 8889,
});

// Help function to make code look nicer
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

app.post("/users", async (req, res) => {
  const { username, password } = req.body;
  console.log(`Creating user: ${username}`);

  try {
    const existingUsers = await query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const result = await query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );

    const userId = result.insertId;

    await query("INSERT INTO accounts (user_id, balance) VALUES (?, ?)", [
      userId,
      0.0,
    ]);

    const userCount = await query("SELECT COUNT(*) as count FROM users");
    console.log(
      `User created: ${username} (Total users: ${userCount[0].count})`
    );
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.log("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login and get one-time password (token)
app.post("/sessions", async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt: ${username}`);

  try {
    const users = await query(
      "SELECT id FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const userId = users[0].id;
    const token = generateOTP();

    await query("INSERT INTO sessions (user_id, token) VALUES (?, ?)", [
      userId,
      token,
    ]);

    console.log(`Login successful: ${username} (Token: ${token})`);
    res.json({ token });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Get account balance
app.post("/me/accounts", async (req, res) => {
  const { token } = req.body;

  try {
    const sessions = await query(
      "SELECT user_id FROM sessions WHERE token = ?",
      [token]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const userId = sessions[0].user_id;

    const accounts = await query(
      "SELECT balance FROM accounts WHERE user_id = ?",
      [userId]
    );

    const balance = parseFloat(accounts[0].balance);
    console.log(`Balance cheked: ${balance} SEK`);
    res.json({ balance });
  } catch (error) {
    console.log("Error checking balance:", error);
    res.status(500).json({ message: "Error checking balance" });
  }
});

// Deposit money
app.post("/me/accounts/transactions", async (req, res) => {
  const { token, amount } = req.body;
  console.log(`Deposit request: ${amount} SEK with token: ${token}`);

  try {
    const sessions = await query(
      "SELECT user_id FROM sessions WHERE token = ?",
      [token]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const userId = sessions[0].user_id;

    const accounts = await query(
      "SELECT balance FROM accounts WHERE user_id = ?",
      [userId]
    );

    const oldBalance = parseFloat(accounts[0].balance);
    const newBalance = oldBalance + amount;

    await query(
      "UPDATE accounts SET balance = ?, modified = CURRENT_TIMESTAMP WHERE user_id = ?",
      [newBalance, userId]
    );

    console.log(`Deposit successful: ${oldBalance} => ${newBalance} SEK`);
    res.json({ newBalance });
  } catch (error) {
    console.log("Error processing deposit:", error);
    res.status(500).json({ message: "Error processing deposit" });
  }
});

// Starta servern

async function startServer() {
  try {
    await query("SELECT 1");
    console.log("Connected to MySQL database");

    app.listen(port, () => {
      console.log(`Bankens backend körs på http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
}

startServer();

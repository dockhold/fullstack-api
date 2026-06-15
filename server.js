const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { pool, initDb } = require("./db");

const app = express();

// Behind Dockhold's edge, the client IP arrives in X-Forwarded-For. Trust one
// proxy hop so req.ip is the real caller (needed for per-IP rate limiting). If
// you add more proxies in front, raise this to match the hop count.
app.set("trust proxy", 1);

// Cap request bodies — a guestbook message is tiny, so reject anything large.
app.use(express.json({ limit: "10kb" }));

// CORS: allow the deployed frontend's origin. Set ALLOWED_ORIGIN to your web
// app's URL (e.g. https://fullstack-web-xxxx.dockhold.app). If it's unset we
// fall back to "*" so the API is reachable before you know the web URL — tighten
// it to the real origin once the frontend is deployed.
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));

app.get("/", (_req, res) => {
  res.json({
    message: "Full-stack example API. The React frontend calls /api/messages.",
    routes: ["GET /health", "GET /api/messages", "POST /api/messages"],
    docs: "https://dockhold.eu/docs/recipes/deploy-a-full-stack-app",
  });
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// List guestbook entries, newest first.
app.get("/api/messages", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, body, created_at FROM messages ORDER BY created_at DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) {
    console.error("list failed", err);
    res.status(500).json({ error: "could not read messages" });
  }
});

// Rate-limit writes per IP so the open endpoint can't be flooded. Tune to taste.
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too many requests, slow down" },
});

// Add a guestbook entry. Parameterized query — never interpolate user input.
app.post("/api/messages", writeLimiter, async (req, res) => {
  const raw = req.body && req.body.body;
  if (typeof raw !== "string") return res.status(400).json({ error: "body must be a string" });
  const body = raw.trim();
  if (!body) return res.status(400).json({ error: "body is required" });
  if (body.length > 280) return res.status(400).json({ error: "body too long (max 280)" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO messages (body) VALUES ($1) RETURNING id, body, created_at",
      [body]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("insert failed", err);
    res.status(500).json({ error: "could not save message" });
  }
});

// Listen on the assigned port, bound to all interfaces, after the schema is ready.
const port = process.env.PORT || 3000;
initDb()
  .then(() => app.listen(port, "0.0.0.0", () => console.log(`listening on ${port}`)))
  .catch((err) => {
    console.error("db init failed", err);
    process.exit(1);
  });

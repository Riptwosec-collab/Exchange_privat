import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { WebSocketServer } from "ws";
import { watchlist } from "../src/lib/mock-data";

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "stock-intelligence-api" });
});

app.get("/api/quotes", (_req, res) => {
  res.json({ data: watchlist, provider: "mock" });
});

app.post("/api/alerts", (req, res) => {
  res.status(201).json({
    message: "Alert created",
    alert: req.body
  });
});

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server, path: "/ws/quotes" });

wss.on("connection", (socket) => {
  const timer = setInterval(() => {
    const payload = watchlist.map((quote) => ({
      ticker: quote.ticker,
      price: Number((quote.price + (Math.random() - 0.5) * 1.2).toFixed(2)),
      timestamp: new Date().toISOString()
    }));
    socket.send(JSON.stringify({ type: "quotes", payload }));
  }, 1500);

  socket.on("close", () => clearInterval(timer));
});

import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import db from "./lib/db.js";

import errorHandler from "./middleware/errorhandler.js";

import contactRoutes from "./routes/contact.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

db.connect();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Hello from server");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("send-message", (data) => {
    console.log("Nachricht empfangen:", data);
    socket.broadcast.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server läuft mit Socket.io auf http://localhost:${PORT}`);
});

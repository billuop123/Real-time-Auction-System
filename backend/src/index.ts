import express from "express";
import { userRouter } from "./router/userRouter";
import cors from "cors";
import WebSocket, { WebSocketServer } from "ws";
import { itemRouter } from "./router/itemRouter";
import { bidRouter } from "./router/bidRouter";
import { notificationRouter } from "./router/notificationRouter";
import { khaltiRouter } from "./router/khaltiRouter";
import { adminRouter } from "./router/adminRouter";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src https: http:; script-src https: http:; connect-src https: http:;"
  );
  next();
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/item", itemRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/khalti", khaltiRouter);
app.use("/api/v1/admin",adminRouter)

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server is listening in port ${port}`);
});
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data, isBinary) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});

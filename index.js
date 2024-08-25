const express = require("express")
const { WebSocketServer } = require("ws")
const app = express()

app.use(express.static("public"))

const HTTP_PORT = process.env.PORT || 8000;
const WS_PORT = process.env.PORT || 8001;

app.listen(HTTP_PORT, () => {
  console.log(`port : ${HTTP_PORT}`)
})

const wss = new WebSocketServer({ port: WS_PORT })

wss.broadcast = (message) => {
    wss.clients.forEach((client) => {
      client.send(message);
    });
  };
  
  wss.on("connection", (ws, request) => {
    ws.on("message", (data) => {
      wss.broadcast(data.toString());
    });
  
    ws.on("close", () => {
      wss.broadcast(`유저 한명이 떠났습니다. 현재 유저 ${wss.clients.size} 명`);
    });
  

      wss.broadcast(
        `새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`
      );
});
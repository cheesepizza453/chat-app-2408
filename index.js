const express = require("express");
const { Server } = require("ws");
const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT})`));

const wss = new Server({ server });

wss.broadcast = (message) => {
  wss.clients.forEach((client) => {
    client.send(message);
  });
};

wss.on('connection', (ws) => {
    console.log('New client connected');

    // 클라이언트로부터 메시지를 받았을 때
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        
        try {
            const msg = JSON.parse(message);
            // 메시지에 시간 요청이 포함된 경우 현재 시간을 추가
            if (msg.requestTime) {
              const timeMessage = JSON.stringify({
                nickname: msg.nickname || '',
                message: msg.message || '',
                time: getCurrentTime()
              });
              wss.broadcast(timeMessage); // 현재 시간을 포함한 메시지를 클라이언트에 전송
            } else {
              // 요청이 없는 일반 메시지 브로드캐스트
              wss.broadcast(message);
            }
          } catch (error) {
            console.error("JSON 파싱 오류:", error);
          }
    });
    
    // 클라이언트 연결 종료
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    function sendCurrentTime() {
        const timeMessage = JSON.stringify({ time: getCurrentTime() }); 
        ws.send(timeMessage);
    }

    sendCurrentTime();
});

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
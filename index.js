const express = require("express");
const { Server } = require("ws");
const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";
const path = require('path');


const app = express(); // Express 애플리케이션 인스턴스 생성

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});


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
            console.log(msg.join)
            if (msg.join) {
              const joinMessage = JSON.stringify({
                  message: `${msg.nickname}님이 입장하셨습니다.`,
                  join: true
              });
              wss.broadcast(joinMessage); // 입장 메시지를 브로드캐스트
            } else if (msg.requestTime) {
              const timeMessage = JSON.stringify({
                nickname: msg.nickname || '',
                message: msg.message || '',
                time: getCurrentTime()
              });
              wss.broadcast(timeMessage); // 현재 시간을 포함한 메시지를 클라이언트에 전송
            } else {
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
    return `${hours}:${minutes}`;
}
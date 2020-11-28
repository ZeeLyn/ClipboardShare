const fork = require('child_process').fork;
const { clipboard, nativeImage } = require('electron');
const WebSocketServerProcess = fork('./src/websocket_server/server.js');
module.exports = {
    StartServer: (host, port) => {
        WebSocketServerProcess.send({ type: "START_SERVER", payload: { host, port } });
        WebSocketServerProcess.on("message", function (msg) {
            switch (msg.type) {
                case "clipboard-text":
                    clipboard.writeText(msg.body);
                    break;
                case "clipboard-image":
                    var buffer = Buffer.from(msg.body);
                    var img = nativeImage.createFromBuffer(buffer);
                    clipboard.writeImage(img);
                    break;
            }
        });
    },
    StopServer: () => {
        WebSocketServerProcess.send({ type: "STOP_SERVER" });
    },
    SendMessage: (msg) => {
        WebSocketServerProcess.send({ type: "SEND-MESSAGE", payload: { msg } });
    }
};
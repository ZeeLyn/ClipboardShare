const fork = require('child_process').fork;
const WebSocketClientProcess = fork('./src/websocket_client/client.js');
const { clipboard, nativeImage } = require('electron');

WebSocketClientProcess.on("message", function (msg) {
    switch (msg.type) {
        case "clipboard-text":
            clipboard.writeText(msg.body);
            break;
        case "clipboard-image":
            var buffer = Buffer.from(msg.body, "base64");
            var img = nativeImage.createFromBuffer(buffer);
            clipboard.writeImage(img, "clipboard");
            break;
    }
});


module.exports = {
    Connection: (host, port) => {
        WebSocketClientProcess.send({ type: "Connect", payload: { host, port } });
    },
    SendMessage: (message) => {
        WebSocketClientProcess.send({ type: "SendMessage", payload: { message } });
    }
};
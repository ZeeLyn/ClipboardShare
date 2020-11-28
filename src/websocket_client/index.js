const fork = require('child_process').fork;
const WebSocketClientProcess = fork('./src/websocket_client/client.js');

WebSocketClientProcess.on("message", function (msg) {
    switch (msg.type) {
        case "clipboard-text-changed":
            clipboard.writeText(msg.body);

            break;
        case "clipboard-image-changed":
            var buffer = Buffer.from(msg.body);
            var img = nativeImage.createFromBuffer(buffer);
            clipboard.writeImage(img);
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
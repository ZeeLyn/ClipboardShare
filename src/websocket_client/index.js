const fork = require('child_process').fork;
const WebSocketClientProcess = fork('./src/websocket_client/client.js');
const { clipboard, nativeImage } = require('electron');

WebSocketClientProcess.on("message", function (msg) {
    console.warn(msg);
    switch (msg.type) {
        case "clipboard-text":
            console.warn("clipboard-text-changed");
            clipboard.writeText(msg.body);

            break;
        case "clipboard-image":
            console.warn("clipboard-image-changed");
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
const fork = require('child_process').fork;
const { clipboard, nativeImage } = require('electron');
const WebSocketServerProcess = fork('./src/websocket_server/server.js');
var fileWindow = null;
var mainWindow = null;

WebSocketServerProcess.on("message", function (msg) {
    console.warn(msg);
    switch (msg.type) {
        case "clipboard-text":
            clipboard.writeText(msg.body);
            break;
        case "clipboard-image":
            var buffer = Buffer.from(msg.body);
            var img = nativeImage.createFromBuffer(buffer);
            clipboard.writeImage(img);
            break;
        case "OnUserJoin":
            fileWindow.webContents.send("OnUserJoin", msg.body);
            mainWindow.webContents.send("OnUserJoin", msg.body);
            break;
        case "OnProcessChanged":
            fileWindow.webContents.send("OnProcessChanged", msg.body);
            break;
    }
});
module.exports = {
    StartServer: (host, port) => {
        WebSocketServerProcess.send({ type: "START_SERVER", payload: { host, port } });
    },
    SetWindow: (mainWin, fileWin) => { mainWindow = mainWin, fileWindow = fileWin },
    StopServer: () => {
        WebSocketServerProcess.send({ type: "STOP_SERVER" });
    },
    SendMessage: (msg) => {
        WebSocketServerProcess.send({ type: "SEND-MESSAGE", payload: { msg } });
    }
};
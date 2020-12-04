const fork = require('child_process').fork;
const path = require('path');
const { clipboard, nativeImage } = require('electron');
const isDevelopment = process.env.NODE_ENV !== 'production'
const cwd = isDevelopment ? null : path.join(__dirname, '..');
const WebSocketServerProcess = fork(isDevelopment ? './public/server.js' : 'app.asar/server.js', [], {
    cwd: cwd
});
var fileWindow = null;
var mainWindow = null;

var config = null;

WebSocketServerProcess.on("message", function (msg) {
    //console.warn(msg);
    switch (msg.type) {
        case "clipboard-text":
            clipboard.writeText(msg.body);
            break;
        case "clipboard-image":
            var buffer = Buffer.from(msg.body);
            var img = nativeImage.createFromBuffer(buffer);
            clipboard.writeImage(img);
            break;
        //用户连接到服务器是通知
        case "OnUserJoin":
            fileWindow.webContents.send("OnUserJoin", msg.body);
            mainWindow.webContents.send("OnUserJoin", msg.body);
            break;
        //传输进度
        case "OnProcessChanged":
            fileWindow.webContents.send("OnProcessChanged", msg.body);
            break;
        case "OnAbort":
            console.warn("OnAbort", msg.body);
            fileWindow.webContents.send("OnAbort", msg.body);
            break;
    }
});

module.exports = {
    InitServer: (c) => {
        config = c;
        WebSocketServerProcess.send({ type: "SetServerToken", payload: config.GetConfig().token });
    },
    StartServer: (host, port) => {
        WebSocketServerProcess.send({ type: "START_SERVER", payload: { host, port, token: config.token } });
    },
    SetWindow: (mainWin, fileWin) => { mainWindow = mainWin, fileWindow = fileWin },
    StopServer: () => {
        WebSocketServerProcess.send({ type: "STOP_SERVER" });
    },
    SendMessage: (msg) => {
        WebSocketServerProcess.send({ type: "SEND-MESSAGE", payload: { ...msg } });
    }
};
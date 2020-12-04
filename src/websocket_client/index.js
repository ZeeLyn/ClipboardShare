const fork = require('child_process').fork;
const path = require('path');
const isDevelopment = process.env.NODE_ENV !== 'production'
const cwd = isDevelopment ? null : path.join(__dirname, '..');
const WebSocketClientProcess = fork(isDevelopment ? './public/client.js' : "app.asar/client.js", [], {
    cwd: cwd
});
const { clipboard, nativeImage } = require('electron');
var _config = null;
var fileWindow = null;
var mainWindow = null;
WebSocketClientProcess.on("message", function (msg) {
    switch (msg.type) {
        case "clipboard-text":
            console.warn("设置剪切板：" + msg.body);
            clipboard.writeText(msg.body);
            break;
        case "clipboard-image":
            var buffer = Buffer.from(msg.body, "base64");
            var img = nativeImage.createFromBuffer(buffer);
            //var img = nativeImage.createFromPath(msg.body);
            clipboard.writeImage(img, "clipboard");
            break;
        case "connect":
            console.warn("connect");
            mainWindow.webContents.send("OnConnect");
            break;
        case "disconnect":
            console.warn("disconnect");
            mainWindow.webContents.send("OnDisconnect");
            break;
        case "connect_error":
            console.warn("connect_error", msg.body);
            mainWindow.webContents.send("OnConnectError", msg.body);
            break;
    }
});


module.exports = {
    Connection: (conf, host, port, id, token = "", name = "") => {
        _config = conf;
        //console.warn(conf.GetConfig());
        WebSocketClientProcess.send({ type: "Connect", payload: { host, port, id, token, name, save_file_folder: conf.GetConfig().save_file_dir } });
    },
    SetWindow: (mainWin, fileWin) => { mainWindow = mainWin, fileWindow = fileWin },
    SendMessage: (message) => {
        WebSocketClientProcess.send({ type: "SendMessage", payload: { message } });
    }
};
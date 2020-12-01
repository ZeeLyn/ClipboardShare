const fork = require('child_process').fork;
const WebSocketClientProcess = fork('./src/websocket_client/client.js');
const { clipboard, nativeImage } = require('electron');
var _config = null;
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
    }
});


module.exports = {
    Connection: (conf, host, port, id, token = "", name = "") => {
        _config = conf;
        //console.warn(conf.GetConfig());
        WebSocketClientProcess.send({ type: "Connect", payload: { host, port, id, token, name, save_file_folder: conf.GetConfig().save_file_dir } });
    },
    SendMessage: (message) => {
        WebSocketClientProcess.send({ type: "SendMessage", payload: { message } });
    }
};
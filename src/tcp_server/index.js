const fork = require('child_process').fork;
const { clipboard, nativeImage } = require('electron');
const TcpServerProcess = fork('./src/tcp_server/server.js', {
    silent: false
});
module.exports = {
    StartServer: (host, port) => {
        TcpServerProcess.send({ type: "START_SERVER", payload: { host, port } });
        TcpServerProcess.on("message", function (msg) {
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
        TcpServerProcess.send({ type: "STOP_SERVER" });
    }
};
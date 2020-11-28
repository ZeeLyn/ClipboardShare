class WebSocketClient {
    Connect(host, port) {
        var socket = require('socket.io-client')(`http://${host}:${port}`);
        console.warn("连接到：", `http://${host}:${port}`);
        socket.on("clipboard-text-changed", data => {
            console.warn("收到消息->", data);
            process.send({ type: "clipboard-text", body: data });
        });

        socket.on("clipboard-image-changed", data => {
            console.warn("收到图片消息->", data);
            // var buffer = Buffer.from(data);
            // var img = nativeImage.createFromBuffer(buffer);
            //process.send(img);
            process.send({ type: "clipboard-image", body: data });
        });

    }
}

var client = new WebSocketClient();
process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'Connect': {
                client.Connect(m.payload.host, m.payload.port);
                break;
            }
            case "SendMessage":
                tcpClient.SendMessage(m.payload.message);
                break;
            default:
                throw new Error('Unrecognized message received by tcp client');
        }
    } catch (e) {
        console.log(e); // eslint-disable-line no-console
    }
});

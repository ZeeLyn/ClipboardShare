var ss = require('socket.io-stream');
var path = require('path');
const fs = require('fs');
class WebSocketClient {
    Connect(host, port, token = "") {
        if (this.socket)
            this.socket.close();
        // const io = require('socket.io-client');
        this.socket = require('socket.io-client')(`http://${host}:${port}`, {
            reconnectionDelay: 1000 * 5,
            query: { token: token }
        });


        //console.warn("连接到：", `http://${host}:${port}`);
        this.socket.on("connect", () => {
            console.warn("client:连接成功");
        });
        // this.socket.on("reconnecting", () => {
        //     console.warn("client:重新连接");
        // });
        this.socket.on("clipboard-text-changed", data => {
            process.send({ type: "clipboard-text", body: data });
        });

        this.socket.on("clipboard-image-changed", data => {
            process.send({ type: "clipboard-image", body: data });
        });
        var _ = this;
        ss(this.socket).on("clipboard-image-changed", (stream, data) => {
            console.warn("client,send-image：", data);
            var filename = path.basename(data.name);
            var _stream = ss.createStream();
            stream.pipe(_stream);
            // const instance = Buffer.from(stream);
            // const base64 = instance.toString('base64')
            // console.warn(base64);
            _.StreamToBuffer(_stream).then(buffer => {
                console.warn(buffer);
            });
            process.send({ type: "clipboard-image", body: filename });
        });

    }

    StreamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            let buffers = [];
            stream.on('error', reject);
            stream.on('data', (data) => buffers.push(data));
            stream.on('end', () => resolve(Buffer.concat(buffers)));
        });
    }

}

var client = new WebSocketClient();
process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'Connect': {
                client.Connect(m.payload.host, m.payload.port, m.payload.token);
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

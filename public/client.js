var ss = require('socket.io-stream');
var path = require('path');
const fs = require('fs');
var save_file_folder = ""
class WebSocketClient {
    Connect(host, port, id, token = "", name = "") {
        if (this.socket)
            this.socket.close();
        // const io = require('socket.io-client');
        this.socket = require('socket.io-client')(`http://${host}:${port}`, {
            reconnectionDelay: 1000 * 5,
            query: { token, name, id }
        });


        //console.warn("连接到：", `http://${host}:${port}`);
        this.socket.on("connect", () => {
            //console.warn("client:连接成功");
            process.send({ type: "connect", body: "" });
        });
        this.socket.on("disconnect", (e) => {
            //console.warn("disconnect", e);
            process.send({ type: "disconnect", body: e });
        });
        this.socket.on("connect_error", (err) => {
            console.warn("client:connect_error", err.toString());
            process.send({ type: "connect_error", body: err.toString() });
        });
        this.socket.on("error", (err) => {
            console.warn("client:error", err);
        });
        this.socket.on("reconnect_error", (err) => {
            console.warn("client:reconnect_error", err);
            process.send({ type: "reconnect_error", body: err });
        });
        this.socket.on("clipboard-text-changed", data => {
            process.send({ type: "clipboard-text", body: data });
        });

        this.socket.on("clipboard-image-changed", data => {
            process.send({ type: "clipboard-image", body: data });
        });
        var _ = this;
        ss(this.socket).on("receive-file", (stream, data) => {
            var filename = path.basename(data.name);
            var _stream = fs.createWriteStream(path.join(save_file_folder, data.name));
            stream.pipe(_stream);
            // const instance = Buffer.from(stream);
            // const base64 = instance.toString('base64')
            // console.warn(base64);
            // _.StreamToBuffer(_stream).then(buffer => {
            //     console.warn(buffer);
            // });
            // process.send({ type: "clipboard-image", body: filename });
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
                save_file_folder = m.payload.save_file_folder;
                client.Connect(m.payload.host, m.payload.port, m.payload.id, m.payload.token, m.payload.name);
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

const express = require('express');
var Readable = require('stream').Readable;
var Stream = require('stream');
const fs = require('fs');
var ss = require('socket.io-stream');
var path = require("path");
var server_token = "";
const app = express();
var server = require('http').createServer(app).listen(9990, "0.0.0.0");
var io = require('socket.io')(server);
io.use((socket, next) => {
    let token = socket.handshake.query.token;
    if (token == server_token) {
        return next();
    }
    console.error("授权码错误");
    //socket.close();
    return next(new Error("授权码错误"));
});
var clients = [];

const shareGroup = "my-share-group";
io.on("connection", socket => {
    clients.push(socket);
    console.warn(socket.id);
    socket.join(shareGroup);
    SendConnectonList("OnUserJoin");
    socket.on("disconnect", () => {
        socket.leave(shareGroup);
    });
});
var _streams = [];
function SendConnectonList(type) {
    var list = [];
    clients.forEach(c => {
        list.push({
            id: c.handshake.query.id,
            nick_name: c.handshake.query.name
        });
    });
    process.send({ type, body: list });
}
function removeStream(id) {
    var index = _streams.findIndex(p => p.id == id);
    _streams.splice(index, 1);
}

console.warn("启动");


process.on('message', (m) => {
    try {
        switch (m.type) {
            case "SetServerToken":
                server_token = m.payload;
                break;
            case 'SEND-MESSAGE': {
                //console.warn("SEND-MESSAGE");
                switch (m.payload.type) {
                    case "clipboard-text":
                        io.to(shareGroup).emit("clipboard-text-changed", m.payload.body);

                        break;
                    case "clipboard-image":
                        io.to(shareGroup).emit("clipboard-image-changed", m.payload.body);
                        break;
                    case "send-files":
                        var client = clients.find(item => item.handshake.query.id == m.payload.body.to);
                        if (!client) {
                            console.error("找不到客户端：" + m.payload.body.to);
                            return;
                        }
                        //console.warn(m.payload.body);
                        m.payload.body.files.forEach(file => {
                            var totalSize = fs.statSync(file.path).size;
                            var _stream = ss.createStream();
                            ss(client).emit("receive-file", _stream, { name: path.basename(file.path) });
                            var stream = fs.createReadStream(file.path);
                            _streams.push({ id: file.id, stream });
                            var size = 0;
                            var processVal = 0;
                            stream.on("data", chunk => {
                                size += chunk.length;
                                var curr = Math.floor(size / totalSize * 100);
                                if (processVal == curr)
                                    return;
                                processVal = curr;
                                if (processVal >= 100) {
                                    removeStream(file.id);
                                }
                                process.send({
                                    type: "OnProcessChanged", body: { id: file.id, client: m.payload.body.to, val: processVal }
                                });
                            });
                            stream.pipe(_stream);
                        });
                        break;
                    case "abort-send":
                        //console.warn("ABORT_SEND", m.payload);
                        var _stream = _streams.find(s => s.id == m.payload.body.fileid);
                        if (!_stream)
                            return;
                        _stream.stream.close();
                        removeStream(_stream.id);
                        process.send({
                            type: "OnAbort", body: { id: m.payload.body.fileid, client: m.payload.body.client }
                        });
                        break;
                    default:
                        console.error("不支持的类型");
                        break;
                }
                break;
            }

            case 'STOP_SERVER': {

                break;
            }

            default:
                throw new Error('Unrecognized message received by tcp client');
        }
    } catch (e) {
        console.log(e); // eslint-disable-line no-console
    }
});


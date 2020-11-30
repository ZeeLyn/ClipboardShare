const express = require('express');
var Readable = require('stream').Readable;
var Stream = require('stream');
const fs = require('fs');
var ss = require('socket.io-stream');
var path = require("path");

const app = express();
var server = require('http').createServer(app).listen(9990, "0.0.0.0");
var io = require('socket.io')(server);
io.use((socket, next) => {
    let token = socket.handshake.query.token;
    if (token == "123") {
        return next();
    }
    console.error("授权码错误");
    socket.close();
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

function SendConnectonList(type) {
    var list = [];
    clients.forEach(c => {
        list.push({
            id: c.id,
            name: c.handshake.query.name
        });
    });
    process.send({ type, body: list });
}

console.warn("启动");


process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'SEND-MESSAGE': {
                //console.warn("SEND-MESSAGE");
                switch (m.payload.msg.type) {
                    case "clipboard-text":
                        io.to(shareGroup).emit("clipboard-text-changed", m.payload.msg.body);

                        break;
                    case "clipboard-image":
                        io.to(shareGroup).emit("clipboard-image-changed", m.payload.msg.body);
                        break;
                    case "send-files":
                        clients.forEach(client => {
                            m.payload.msg.body.files.forEach(file => {
                                var totalSize = fs.statSync(file).size;
                                var _stream = ss.createStream();
                                ss(client).emit("receive-file", _stream, { name: path.basename(file) });
                                var stream = fs.createReadStream(file);
                                var size = 0;
                                var processVal = 0;
                                stream.on("data", chunk => {
                                    size += chunk.length;
                                    var curr = Math.floor(size / totalSize * 100);
                                    if (processVal == curr)
                                        return;
                                    processVal = curr;
                                    process.send({
                                        type: "OnProcessChanged", body: processVal
                                    });
                                });
                                stream.pipe(_stream);
                            });

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


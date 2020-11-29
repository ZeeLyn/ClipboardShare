const express = require('express');
var Readable = require('stream').Readable;
var Stream = require('stream');
const { nativeImage } = require('electron');
const fs = require('fs');
var ss = require('socket.io-stream');

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
    socket.join(shareGroup);
    socket.on("disconnect", () => {
        socket.leave(shareGroup);
    });
});

console.warn("启动");

process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'SEND-MESSAGE': {
                console.warn("SEND-MESSAGE");
                switch (m.payload.msg.type) {
                    case "clipboard-text":
                        io.to(shareGroup).emit("clipboard-text-changed", m.payload.msg.body);

                        break;
                    case "clipboard-image":
                        io.to(shareGroup).emit("clipboard-image-changed", m.payload.msg.body);
                        break;
                    case "send-file":
                        //console.warn(m.payload.msg.body);
                        var buffer = Buffer.from(m.payload.msg.body, "base64");
                        //io.to(shareGroup).emit("clipboard-image-changed", m.payload.msg.body);
                        clients.forEach(client => {
                            var _stream = ss.createStream();
                            ss(client).emit("clipboard-image-changed", _stream, { name: "clipboard-image.png" });
                            // console.warn(m.payload.msg.body.toString());
                            // 创建一个bufferstream
                            var bufferStream = new Stream.PassThrough();
                            //将Buffer写入
                            bufferStream.end(buffer);
                            console.warn("发送数据");
                            bufferStream.pipe(_stream);
                        });

                        //fs.createReadStream("933299ad16ac8046e7198cba22c4fdd.png").pipe(_stream);
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


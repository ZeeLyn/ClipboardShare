const express = require('express');
const app = express();
var server = require('http').createServer(app).listen(9990);
var io = require('socket.io')(server);
var clients = [];
io.on("connection", socket => {
    console.warn(socket.id);
    clients.push(socket);
});
console.warn("启动");

process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'SEND-MESSAGE': {
                console.warn("SEND-MESSAGE");
                switch (m.payload.msg.type) {
                    case "clipboard-text":
                        console.warn(clients.length);
                        clients.forEach(client => {
                            client.emit("clipboard-text-changed", m.payload.msg.body);
                        });
                        break;
                    case "clipboard-image":
                        clients.forEach(client => {
                            client.emit("clipboard-image-changed", m.payload.msg.body);
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


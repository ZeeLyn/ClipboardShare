const net = require('net');

class TCPServer {

    constructor() {
        this.host = '';
        this.port = null;
    }
    StartServer(host, port) {
        this.host = host;
        this.port = port;
        this.server = net.createServer(function (connection) {
            //console.warn(connection);
            connection.on('end', function (e) {
                console.log('客户端关闭连接');
            });
            connection.pipe(connection);
        });
        this.server.listen(port, host, function () {
            console.log('server is listening');
        });
        this.server.on('connection', socket => {
            //console.warn("join:", socket);

            socket.on('data', data => {
                var msg = JSON.parse(data.toString());
                console.warn("收到消息：", msg);
                //socket.write('you said:' + data.toString());
                switch (msg.type) {
                    case "clipboard-text":
                    case "clipboard-image":
                        process.send(msg);
                        break;
                }
            });

            socket.on('close', () => {

            })
        });
    }
    StopServer() {
        this.server.close();
    }

}
const tcpServer = new TCPServer();

process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'START_SERVER': {
                tcpServer.StartServer(m.payload.host, m.payload.port);
                break;
            }

            case 'STOP_SERVER': {
                tcpServer.StopServer();
                break;
            }

            default:
                throw new Error('Unrecognized message received by tcp client');
        }
    } catch (e) {
        console.log(e); // eslint-disable-line no-console
    }
});


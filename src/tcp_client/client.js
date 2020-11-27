const { createPublicKey } = require('crypto');
var net = require('net');

class TCPClient {
    constructor() {
        this.clients = [];
    }

    Connect(host, port) {
        var _ = this;
        this.client = net.connect(port, host, function (e) {
            console.warn("连接成功");
            _.clients.push({ server: `${host}:${port}`, scoket: _.client });
            _.client.on("end", function () {
                var index = _.clients.findIndex(item => { return item.server == `${host}:${port}` });
                _.clients.splice(index, 1);
            });
        });

    }

    SendMessage(msg) {
        this.clients.forEach(client => {
            client.scoket.write(JSON.stringify(msg));
        });
    }
}

const tcpClient = new TCPClient();
process.on('message', (m) => {
    try {
        switch (m.type) {
            case 'Connect': {
                tcpClient.Connect(m.payload.host, m.payload.port);
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



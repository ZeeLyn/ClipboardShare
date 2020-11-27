const fork = require('child_process').fork;
const TcpClientProcess = fork('./src/tcp_client/client.js');
module.exports = {
    Connection: (host, port) => {
        TcpClientProcess.send({ type: "Connect", payload: { host, port } });
    },
    SendMessage: (message) => {
        TcpClientProcess.send({ type: "SendMessage", payload: { message } });
    }
};
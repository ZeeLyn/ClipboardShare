import { ipcMain } from 'electron'
// const ServerHandlers = require('./tcp_server');
// const ClientHandlers = require('./tcp_client');
// var Stream = require('stream');
const WebSocketServerHandlers = require('./websocket_server');
const WebSocketClientHandlers = require('./websocket_client');
const clipboardWatcher = require('electron-clipboard-watcher');
import config from './lib/config.js'

export default {
    Init: (conf, minWin, fileWin) => {
        //ServerHandlers.StartServer("0.0.0.0", 9999);
        // setTimeout(function () {
        //     ClientHandlers.Connection("127.0.0.1", 9999);
        // }, 3000);

        clipboardWatcher({
            // (optional) delay in ms between polls
            watchDelay: 1000,

            // handler for when image data is copied into the clipboard
            onImageChange: function (nativeImage) {
                var buffer = nativeImage.toPNG();
                //console.warn(buffer);
                // ClientHandlers.SendMessage({ type: "clipboard-image", body: buffer.toString("base64") });
                //ClientHandlers.SendMessage({ type: "clipboard-image", body: buffer.toString("base64") });
                // WebSocketServerHandlers.SendMessage({ type: "clipboard-image", body: buffer.toString("base64") });
                WebSocketServerHandlers.SendMessage({ type: "clipboard-image", body: buffer.toString("base64") });
            },

            // handler for when text data is copied into the clipboard
            onTextChange: function (text) {
                //ClientHandlers.SendMessage({ type: "clipboard-text", body: text });
                //ClientHandlers.SendMessage({ type: "clipboard-text", body: text });
                WebSocketServerHandlers.SendMessage({ type: "clipboard-text", body: text });
            }
        });

        WebSocketServerHandlers.SetWindow(minWin, fileWin);
        WebSocketClientHandlers.SetWindow(minWin, fileWin);
        WebSocketServerHandlers.InitServer(config);
        ipcMain.on("connect_to_server", (event, host, token) => {
            console.warn("host:" + host);
            //ClientHandlers.Connection(arg, 9999);
            WebSocketClientHandlers.Connection(config, host, 9990, conf.uid, token, conf.nick_name);
        });

        ipcMain.on("stop_connect", () => {
            WebSocketClientHandlers.Disconnect();
        })

        ipcMain.on("send_files", (event, files, to) => {
            var body = { files, to };
            //console.warn("发送文件", { files, to });
            WebSocketServerHandlers.SendMessage({
                type: "send-files", body: body
            });
        });
        ipcMain.on("abort_send", (evt, client, fileid) => {
            //console.warn("abort_send");
            WebSocketServerHandlers.SendMessage({
                type: "abort-send", body: { client, fileid }
            });
        });
    }
}

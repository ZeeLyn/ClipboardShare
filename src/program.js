import { ipcMain } from 'electron'
const ServerHandlers = require('./tcp_server');
const ClientHandlers = require('./tcp_client');
const clipboardWatcher = require('electron-clipboard-watcher');
export default {
    Init: () => {
        ServerHandlers.StartServer("0.0.0.0", 9999);
        // setTimeout(function () {
        //     ClientHandlers.Connection("127.0.0.1", 9999);
        // }, 3000);

        clipboardWatcher({
            // (optional) delay in ms between polls
            watchDelay: 1000,

            // handler for when image data is copied into the clipboard
            onImageChange: function (nativeImage) {
                var buffer = nativeImage.toPNG();
                ClientHandlers.SendMessage({ type: "clipboard-image", body: buffer.toString("base64") });
            },

            // handler for when text data is copied into the clipboard
            onTextChange: function (text) {
                ClientHandlers.SendMessage({ type: "clipboard-text", body: text });
            }
        });

        ipcMain.on("connect_to_server", (event, arg) => {
            console.warn("host:" + arg);
            ClientHandlers.Connection(arg, 9999);
        });
    }
}

<template>
    <div class="sendfile">
        <div class="suspension-container" v-if="!show" @dragenter="OnShow">
            <div class="p" @click="OnShow"></div>
            <div class="move-container"></div>
        </div>
        <div v-if="show" class="container">
            <div class="header">
                <img src="../assets/back.png" @click="OnBack" />
                <b>分享的机器列表</b>
            </div>
            <div class="client-list">
                <div
                    v-for="client in clients"
                    :key="client.id"
                    class="client-item"
                    :class="
                        (client.dragenter ? 'dragenter' : '') +
                        (forbiddenChildePointerEvents
                            ? ' forbidden-childe-pointer-events'
                            : '')
                    "
                    @dragover="dragover"
                    @dragenter="dragenter"
                    @dragleave="dragleave"
                    v-on:drop="onDrop"
                    :data-client-id="client.id"
                >
                    <div class="client-info">
                        {{ client.nick_name }}
                    </div>
                    <div
                        class="file-list"
                        v-if="client.files && client.files.length > 0"
                    >
                        <div
                            v-for="file in client.files"
                            :key="file.id"
                            :data-file-id="file.id"
                            class="file-item"
                        >
                            <div class="file-info">
                                <label> {{ file.name }}</label>
                                <div>
                                    <img
                                        title="中止发送"
                                        src="../assets/stop.png"
                                        @click="AbortSend(client.id, file.id)"
                                        v-if="
                                            file.progress < 100 && !file.abort
                                        "
                                    />
                                    <img
                                        title="删除"
                                        src="../assets/del.png"
                                        @click="DeleteSend(client.id, file.id)"
                                        v-if="
                                            file.progress >= 100 || file.abort
                                        "
                                    />
                                </div>
                            </div>
                            <div class="progress">
                                <div
                                    class="progress-bar"
                                    :class="file.abort ? 'abort' : ''"
                                    :style="'width:' + file.progress + '%;'"
                                ></div>
                                <div class="progress-txt">
                                    {{ file.progress }}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
// const { Menu, MenuItem } = remote;
const UUID = require("uuid");
export default {
    name: "SendFile",
    data() {
        return {
            show: false,
            host: "127.0.0.1",
            clients: [
                // {
                //     nick_name: "OWEN",
                //     id: "asfasf",
                //     files: [
                //         {
                //             id: "1",
                //             name: "safasdf.jpg",
                //             progress: 10,
                //             abort: true,
                //         },
                //     ],
                // },
            ],
            forbiddenChildePointerEvents: false,
        };
    },
    mounted() {
        ipcRenderer.on("OnUserJoin", (event, arg) => {
            //console.warn(arg);
            this.clients = [];
            arg.forEach((item) => {
                this.clients.push({
                    ...item,
                    dragenter: false,
                    files: [],
                });
            });
        });
        ipcRenderer.on("OnProcessChanged", (event, msg) => {
            var id = msg.id;
            var val = msg.val;
            var client = this.clients.find((c) => c.id == msg.client);
            if (!client) return;
            var file = client.files.find((f) => f.id == id);
            if (!file) return;
            file.progress = val;
        });

        ipcRenderer.on("OnAbort", (event, arg) => {
            //console.warn("OnAbort", arg);
            var client = this.clients.find((c) => c.id == arg.client);
            if (!client) return;
            var file = client.files.find((f) => f.id == arg.id);
            if (!file) return;
            file.abort = true;
        });

        // const menu = new Menu();
        // menu.append(
        //     new MenuItem({
        //         label: "Undo",
        //         role: "undo",
        //         accelerator: "CmdOrCtrl+Z",
        //     })
        // );
        // document
        //     .querySelector(".sendfile .suspension-container div")
        //     .addEventListener(
        //         "contextmenu",
        //         (e) => {
        //             e.preventDefault();
        //             menu.popup({
        //                 window: remote.getCurrentWindow(),
        //             });
        //         },
        //         false
        //     );
    },
    methods: {
        OnShow() {
            this.show = true;
            ipcRenderer.send("ShowWindow");
        },
        OnBack() {
            this.show = false;
            ipcRenderer.send("ShowMiniWindow");
        },
        onDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            this.forbiddenChildePointerEvents = false;
            var id = e.currentTarget.dataset.clientId;
            console.warn(id);
            var client = this.clients.find((item) => item.id == id);
            client.dragenter = false;
            var files = [];
            for (const f of e.dataTransfer.files) {
                console.warn(f);
                var fileId = UUID.v1();
                files.push({ path: f.path, id: fileId });
                client.files.push({
                    id: fileId,
                    name: f.name,
                    progress: 0,
                    abort: false,
                });
            }
            ipcRenderer.send("send_files", files, id);
        },
        dragenter(e) {
            var id = e.currentTarget.dataset.clientId;
            var client = this.clients.find((item) => item.id == id);
            client.dragenter = true;
            this.forbiddenChildePointerEvents = true;
        },
        dragover(e) {
            e.preventDefault();
            e.stopPropagation();
            // ipcRenderer.send("drag_in_files");
        },
        dragleave(e) {
            var id = e.currentTarget.dataset.clientId;
            var client = this.clients.find((item) => item.id == id);
            client.dragenter = false;
            this.forbiddenChildePointerEvents = false;
            //console.warn("dragleave", e);
        },
        AbortSend(clientid, fileid) {
            ipcRenderer.send("abort_send", clientid, fileid);
        },
        DeleteSend(clientid, fileid) {
            var client = this.clients.find((c) => c.id == clientid);
            if (!client) return;
            var fileIndex = client.files.findIndex((f) => f.id == fileid);
            client.files.splice(fileIndex, 1);
        },
    },
};
</script>
<style>
html,
body {
    background: none;
}
.sendfile {
    height: 100%;
    user-select: none;
    border-radius: 12px;
    overflow: hidden;
}
.suspension-container {
    width: 100px;
    height: 40px;

    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    border-radius: 12px;
    overflow: hidden;
}
.suspension-container .p {
    flex: 1;
    background: #1e1e1e;
}
.suspension-container .move-container {
    -webkit-app-region: drag;
    background: #fff;
    width: 30px;
    height: 100%;
    cursor: move;
}
.container {
    display: flex;
    flex-direction: column;

    height: 100%;
}
.header {
    display: flex;
    justify-content: center;
    padding: 10px 0;
    border-bottom: 1px #2d2d2d solid;
    background: #1e1e1e;
}
.header img {
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-left: 5px;
}
.header b {
    flex: 1;
    margin-right: 25px;
    font-size: 16px;
    color: #fff;
    -webkit-app-region: drag;
}
.client-list {
    flex: 1;
    display: flex;
    padding: 5px 0;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
}
.client-item {
    margin: 5px;
    padding: 10px;
    color: #fff;
    flex: 1;
    background: #2d2d2d;
}
.forbidden-childe-pointer-events * {
    pointer-events: none;
}
.file-list {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.file-list .file-item {
    background: #333;
    margin-top: 5px;
    font-size: 12px;
    padding: 5px 0;
}
.file-list .file-item .file-info {
    display: flex;
    justify-content: space-between;
}
.file-list .file-item .file-info label {
    margin-left: 5px;
}
.file-list .file-item .file-info div {
    margin-right: 5px;
}
.file-list .file-item .file-info div img {
    width: 15px;
    height: 15px;
    cursor: pointer;
    margin-left: 10px;
}
.file-list .file-item .progress {
    border: 1px #eee solid;
    height: 15px;
    font-size: 10px;
    margin: 2px 5px 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.file-list .file-item .progress .progress-bar {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    background: rgb(61, 139, 170);
}
.file-list .file-item .progress .abort {
    background: #ff0000;
}

.file-list .file-item .progress .progress-txt {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}
.dragenter {
    background: rgb(38, 252, 145);
    color: #333;
}
</style>

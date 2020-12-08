<template>
    <div class="sendfile">
        <div
            class="suspension-container"
            v-if="!show"
            @dragenter="OnShow"
            @dblclick="OnShow"
        >
            <div class="p" title="拖入文件试试">
                <img src="../assets/icon.png" />
            </div>
            <div class="move-container" title="移动位置">
                <img src="../assets/move.png" />
            </div>
        </div>
        <div v-if="show" class="container">
            <div class="header">
                <img src="../assets/back.png" @click="OnBack" />
                <b>剪切板分享</b>
                <div class="menu">
                    <img class="menu-icon" src="../assets/menu.png" />
                    <ul class="menu-items">
                        <li>设置</li>
                        <li>连接到其他服务器</li>
                    </ul>
                </div>
            </div>
            <Settings :config="config" v-if="showSettings"></Settings>
            <Connect></Connect>
            <div class="client-list" v-if="clients && clients.length > 0">
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
            <div class="no-client" v-if="!clients || clients.length == 0">
                没有可分享的电脑
            </div>
        </div>
    </div>
</template>

<script>
import Settings from "@/components/Settings.vue";
import Connect from "@/components/Connect.vue";
const { ipcRenderer, remote } = require("electron");
const { Menu } = remote;
import UUID from "uuid";
export default {
    name: "SendFile",
    components: {
        Settings,
        Connect,
    },
    props: {
        msg: String,
    },
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
            showSettings: false,
        };
    },
    mounted() {
        //alert(window.location.href);
        ipcRenderer.on("OnUserJoin", (event, user) => {
            //console.warn(arg);
            this.clients.push({
                ...user,
                dragenter: false,
                files: [],
            });
        });
        ipcRenderer.on("OnUserLeave", (event, arg) => {
            var index = this.clients.findIndex((item) => item.id == arg.id);
            this.clients.splice(index, 1);
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
        var _ = this;
        let trayMenuTemplate = [
            {
                label: "设置",
                click: function () {
                    ipcRenderer.send("show_main_window");
                },
            },
            {
                label: "我分享的电脑",
                click: function () {
                    _.OnShow();
                },
            },
            {
                label: "退出",
                click: function () {
                    ipcRenderer.send("app_exit");
                },
            },
        ];
        const menu = Menu.buildFromTemplate(trayMenuTemplate);

        document
            .querySelector(".sendfile .suspension-container")
            .addEventListener(
                "contextmenu",
                (e) => {
                    e.preventDefault();
                    menu.popup({
                        window: remote.getCurrentWindow(),
                    });
                },
                false
            );
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


<style scoped>
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
    border-radius: 20px;
    overflow: hidden;
    user-select: none;
}
.suspension-container .p {
    flex: 1;
    background: #2d2d2d;
    display: flex;
    justify-content: center;
    align-items: center;
}
.suspension-container .p img {
    width: 26px;
    pointer-events: none;
}
.suspension-container .move-container {
    -webkit-app-region: drag;
    background: #fff;
    width: 30px;
    height: 100%;
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: center;
}
.suspension-container .move-container img {
    width: 24px;
    pointer-events: none;
}
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1e1e1e;
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
    font-size: 15px;
    color: #fff;
    -webkit-app-region: drag;
}
.header .menu-icon {
    margin-right: 10px;
}

.header .menu {
    position: relative;
    cursor: pointer;
}

.header .menu ul {
    position: absolute;
    right: 0;
    top: 23px;
    background: #eee;
    color: #fff;
    font-size: 12px;
    display: none;
    z-index: 9999;
    border: 1px #eee solid;
}

.header .menu:hover .menu-items {
    display: block;
    text-align: left;
}
.header .menu:hover .menu-items li {
    list-style: none;
    white-space: nowrap;
    padding: 5px 10px;
    color: #333;
}
.header .menu:hover .menu-items li:hover {
    background: rgb(53, 156, 216);
    color: #fff;
}
.client-list,
.no-client {
    flex: 1;
    display: flex;
    padding: 5px 0;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
}
.no-client {
    align-items: center;
    justify-content: center;
    color: #666;
}
.client-item {
    margin: 5px;
    padding: 10px;
    color: #fff;
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

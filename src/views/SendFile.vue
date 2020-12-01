<template>
    <div class="home">
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
                                    v-if="file.progress < 100 && !file.abort"
                                />
                                <img
                                    title="删除"
                                    src="../assets/del.png"
                                    @click="DeleteSend(client.id, file.id)"
                                    v-if="file.progress >= 100 || file.abort"
                                />
                            </div>
                        </div>
                        <div class="progress">
                            <div
                                class="progress-bar"
                                :class="file.abort ? 'abort' : ''"
                                :style="'width:' + file.progress + '%;'"
                            ></div>
                            <div class="progress-txt">{{ file.progress }}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
var UUID = require("uuid");
export default {
    name: "SendFile",
    data() {
        return {
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
    },
    methods: {
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
.client-list {
    margin: 5px 0;
    display: flex;
    flex-direction: column;
}
.client-item {
    margin: 5px 0;
    border: 1px dashed #eee;
    padding: 10px;
    color: #fff;
    flex: 1;
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
    border: 1px #fff solid;
    background: rgb(38, 252, 145);
    color: #333;
}
</style>

<template>
    <div class="home">
        <div class="drag" id="drag"></div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
export default {
    name: "SendFile",
    data() {
        return {
            host: "127.0.0.1",
        };
    },
    mounted() {
        ipcRenderer.on("OnUserJoin", (event, arg) => {
            console.warn(arg);
        });
        ipcRenderer.on("OnProcessChanged", (event, msg) => {
            console.warn(msg);
        });
        document.getElementById("drag").addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            var files = [];
            for (const f of e.dataTransfer.files) {
                console.warn(f);
                files.push(f.path);
            }
            ipcRenderer.send("send_files", files, "to");
        });
        document.getElementById("drag").addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            ipcRenderer.send("drag_in_files");
        });
    },
    methods: {},
};
</script>
<style scoped>
.drag {
    width: 100px;
    height: 100px;
    background: #ccc;
}
</style>

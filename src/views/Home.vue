<template>
    <div class="home">
        <input
            type="text"
            placeholder="连接要共享剪切板的电脑IP"
            v-model="host"
        /><input type="button" value="连接" @click="connect_to_server" />
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");

export default {
    name: "Home",
    data() {
        return {
            host: "127.0.0.1",
        };
    },
    methods: {
        connect_to_server() {
            console.warn(this.host);
            ipcRenderer.send("connect_to_server", this.host);
        },
    },
};
</script>

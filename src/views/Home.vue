<template>
    <div class="home">
        <Header v-if="!showInit"></Header>
        <input
            type="text"
            placeholder="连接要共享剪切板的电脑IP"
            v-model="host"
        /><input type="button" value="连接" @click="connect_to_server" />

        <div class="mask" v-if="showInit">
            <div class="container">
                <div class="group">
                    <label>连接秘钥:</label>
                    <input
                        type="text"
                        placeholder="请输入秘钥"
                        v-model="token"
                    />
                </div>
                <input type="button" value="保存" @click="SetToken" />
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import Header from "@/components/Header.vue";
import config from "../lib/config.js";

export default {
    name: "Home",
    components: {
        Header,
    },
    data() {
        return {
            host: "127.0.0.1",
            showInit: false,
            token: "",
        };
    },
    mounted() {
        ipcRenderer.on("OnUserJoin", (event, arg) => {
            console.warn(arg);
        });
        this.conf = config.GetConfig();
        this.token = this.conf.token;
        if (this.token) return;
        this.showInit = true;
    },
    methods: {
        connect_to_server() {
            console.warn(this.host);
            ipcRenderer.send("connect_to_server", this.host, "hello");
        },
        SetToken() {
            if (!this.token) {
                alert("请输入秘钥！");
                return;
            }
            this.conf.token = this.token;
            config.ModifyConfig(this.conf);
            this.showInit = false;
        },
    },
};
</script>
<style scoped>
.mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.mask .container {
    background: #fff;
    padding: 30px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
}
.mask .container .group {
    display: flex;
    flex-direction: column;
}
.mask .container .group label {
    font-size: 12px;
    text-align: left;
    margin-bottom: 4px;
}
</style>

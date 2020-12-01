<template>
    <div class="home">
        <Header v-if="!showInit"></Header>
        <input
            type="text"
            placeholder="连接要共享剪切板的电脑IP"
            v-model="host"
        />
        <input type="text" placeholder="秘钥" v-model="connection_token" />
        <input type="button" value="连接" @click="connect_to_server" />

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
                <div class="group">
                    <label>接收文件保存目录:</label>
                    <div>
                        <input
                            type="text"
                            placeholder="请选择接收文件默认保存目录"
                            v-model="folder"
                            readonly="readonly"
                        />
                        <span @click="OnChooseFolder">选择</span>
                    </div>
                </div>
                <input type="button" value="保存" @click="SaveConfig" />
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
            connection_token: "",
            showInit: false,
            token: "",
            folder: "",
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
        ipcRenderer.on("OnChangeSaveFileFolder", (event, folder) => {
            this.folder = folder;
        });
    },
    methods: {
        connect_to_server() {
            console.warn(this.host);
            ipcRenderer.send(
                "connect_to_server",
                this.host,
                this.connection_token
            );
        },
        SaveConfig() {
            if (!this.token) {
                alert("请输入秘钥！");
                return;
            }
            if (!this.folder) {
                alert("请选择文件默认保存目录！");
                return;
            }
            this.conf.token = this.token;
            this.conf.save_file_dir = this.folder;
            config.ModifyConfig(this.conf);
            this.showInit = false;
            ipcRenderer.send("init-completed");
        },
        OnChooseFolder() {
            ipcRenderer.send("ChooseSaveFileFolder");
        },
    },
};
</script>
<style scoped>
.home {
    margin-top: 100px;
}
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
    width: 400px;
}
.mask .container .group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}
.mask .container .group div {
    display: flex;
}
.mask .container .group div input {
    flex: 1;
}
.mask .container .group div span {
    margin: 0 0 0 5px;
    display: flex;
    align-items: center;
    border: 1px #ccc solid;
    padding: 0 5px;
    cursor: pointer;
}
.mask .container .group label {
    font-size: 12px;
    text-align: left;
    margin-bottom: 4px;
}
</style>

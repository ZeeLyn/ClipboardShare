<template>
    <div class="connect">
        <div class="form">
            <div v-if="connect_info.status == 0">连接到分享主机</div>
            <div v-if="connect_info.status == 0">
                <input
                    type="text"
                    placeholder="要共享剪的电脑IP"
                    v-model="host"
                    name="host"
                />
                <input
                    type="password"
                    placeholder="秘钥"
                    v-model="connection_token"
                    name="token"
                    maxlength="5"
                />
                <input type="button" value="连接" @click="connect_to_server" />
            </div>
            <div v-if="connect_info.status == 1">当前正在接收分享</div>
            <div class="connect_info" v-if="connect_info.status == 1">
                <label>{{ connect_info.host }}</label>
            </div>
            <div
                v-if="connect_info.status == 1"
                class="stop_connect"
                @click="stop_connect"
            >
                断开
            </div>
        </div>
    </div>
</template>
<script>
const { ipcRenderer } = require("electron");
// import config from "../lib/config.js";

export default {
    name: "Connect",
    props: {
        config: { type: Object, value: null }
    },
    data() {
        return {
            host: "",
            connection_token: "",
            connect_info: {
                status: 0,
                host: "",
            },
        };
    },
    mounted() {
        // var conf = config.GetConfig();
        // this.token = conf.token;
        // this.nick_name = conf.nick_name;
        // this.folder = conf.save_file_dir;
        // ipcRenderer.on("OnChangeSaveFileFolder", (event, folder) => {
        //     // console.warn(folder);
        //     // console.warn(conf);
        //     conf.save_file_dir = folder;
        //     config.ModifyConfig(conf);
        // });
        this.host=this.config.connect_info.host;
        ipcRenderer.on("OnConnect", (evt, host) => {
            console.warn("ok", host);
            this.connect_info.status = 1;
            this.connect_info.host = host;
            this.config.connect_info.host=host;
        });
        ipcRenderer.on("OnDisconnect", () => {
            this.connect_info.status = 0;
            this.connect_info.host = "";
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
        stop_connect() {
            ipcRenderer.send("stop_connect");
        },
    },
};
</script>


<style scoped>
.form {
    display: flex;
    border: 1px #666 dashed;
    padding: 15px;
    margin: 10px 10px;
    flex-direction: column;
    align-items: center;
}
.form div {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #eee;
    font: 12px;
    margin-bottom: 10px;
}
.form input[type="text"] {
    width: 100px;
    text-align: center;
    margin: 0 3px 0 0;
}
.form input[type="password"] {
    text-align: center;
    width: 60px;
    margin: 0 3px 0 0;
}
.stop_connect {
    background: #8f2222;
    cursor: pointer;
    width: 120px;
    padding: 5px 0;
}
</style>

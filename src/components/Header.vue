<template>
    <div class="header">
        <label>昵称：{{ nick_name }}</label>
        <label>接收文件保存目录：{{ folder }}</label>
        <label>秘钥：{{ token }}</label>
        <input type="button" value="选择" @click="OnChooseFolder" />
    </div>
</template>
<script>
const { ipcRenderer } = require("electron");
import config from "../lib/config.js";

export default {
    name: "Header",
    props: {
        msg: String,
    },
    data() {
        return {
            token: "",
            nick_name: "",
            folder: "",
        };
    },
    mounted() {
        var conf = config.GetConfig();
        this.token = conf.token;
        this.nick_name = conf.nick_name;
        this.folder = conf.save_file_dir;
        ipcRenderer.on("OnChangeSaveFileFolder", (event, folder) => {
            console.warn(folder);
            console.warn(conf);
            conf.save_file_dir = folder;
            config.ModifyConfig(conf);
        });
    },
    methods: {
        OnChooseFolder() {
            ipcRenderer.send("ChooseSaveFileFolder");
        },
    },
};
</script>


<style scoped>
.header {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    height: 40px;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    color: #fff;
    padding: 10px 0;
}
</style>

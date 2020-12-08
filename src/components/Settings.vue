<template>
    <div class="settings" v-if="config">
        <div class="group">
            <label>您的显示昵称:</label>
            <span v-if="!nick_name_editing">{{ config.nick_name }}</span>
            <input
                v-if="nick_name_editing"
                type="text"
                placeholder="请输入昵称"
                v-model="config.nick_name"
            />
        </div>
        <div class="group">
            <label>连接验证秘钥:</label>
            <span v-if="!token_editing">******</span>
            <input
                v-if="token_editing"
                type="text"
                placeholder="请输入秘钥"
                v-model="config.token"
            />
        </div>
        <div class="group">
            <label>文件保存目录:</label>
            <span>{{ config.save_file_dir }}</span>
        </div>
    </div>
</template>
<script>
// const { ipcRenderer } = require("electron");
// import config from "../lib/config.js";

export default {
    name: "Header",
    props: {
        config: { type: Object, value: null },
    },
    data() {
        return {
            nick_name: "",
            nick_name_editing: false,
            token: "",
            token_editing: false,
            folder: "",
        };
    },
    mounted() {
        console.warn(this.config);
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
    },
    methods: {
        // OnChooseFolder() {
        //     ipcRenderer.send("ChooseSaveFileFolder");
        // },
    },
};
</script>


<style scoped>
</style>

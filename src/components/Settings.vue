<template>
    <div class="settings" v-if="config">
        <div class="container">
            
            <div class="group">
                <label>您的显示昵称:</label>
                <input
                    type="text"
                    placeholder="请输入昵称"
                    v-model="nick_name"
                />
            </div>
            <div class="group">
                <label>连接验证秘钥:</label>
                <input
                    type="password"
                    placeholder="请输入秘钥"
                    v-model="token"
                />
            </div>
            <div class="group">
            
                <label>文件保存目录:</label>
                <div>
                    <input
                        type="text"
                        placeholder="请选择目录"
                        v-model="folder"
                        readonly="readonly"
                    />
                    <span @click="OnChooseFolder">选择</span>
                </div>
            </div>
            <div class="group">
                <input type="button" value="保存" @click="SaveSettings">
            </div>
        </div>
    </div>
</template>
<script>
// const { ipcRenderer } = require("electron");
// import config from "../lib/config.js";
const { ipcRenderer, remote } = require("electron");
export default {
    name: "Header",
    props: {
        config: { type: Object, value: null },
    },
    data() {
        return {
            nick_name: "",
            token: "",
            folder: "",
        };
    },
    mounted() {
        ipcRenderer.on("OnChangeSaveFileFolder", (event, folder) => {
            this.folder = folder;
        });
    },
    methods: {
        OnChooseFolder() {
            ipcRenderer.send("ChooseSaveFileFolder");
        },
        SaveSettings(){
            if(!this.nick_name)
            {
                remote.dialog.showErrorBox("错误","请输入昵称！");
                return;
            }
        }
    },
};
</script>


<style scoped>
.settings{position: fixed; background: #252525; color: #eee; left: 0; top: 0; right: 0; bottom: 0; display: flex;justify-content: center; flex-direction: column; z-index: 3;}
.settings .container {
    padding: 30px 0;
    display: flex;
    flex-direction: column;
    margin: 0 10px;
}

.settings .container .group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}
.settings .container .group div {
    display: flex;
}
input[type="text"] {
    flex: 1;
    color: #eee !important;
}
.settings .container .group div span {
    margin: 0 0 0 5px;
    display: flex;
    align-items: center;
    border: 1px #ccc solid;
    padding: 0 5px;
    cursor: pointer;
}
.settings .container .group label {
    font-size: 12px;
    text-align: left;
    margin-bottom: 4px;
}
.back-btn{background: #666;}
</style>

<template>
    <div class="hello">
        <input type="button" value="关闭" @click="Close" />
    </div>
</template>
<script>
const { ipcRenderer } = require("electron");
export default {
    name: "HelloWorld",
    data() {
        return {};
    },

    methods: {
        Close() {
            ipcRenderer.send("Close", "ccc");
        },
    },
};
</script>


<style scoped>
</style>

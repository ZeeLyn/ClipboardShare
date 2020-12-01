<template>
    <div id="app">
        <!-- <div id="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link> |
            <router-link to="/sendfile">发送文件</router-link>
        </div> -->
        <router-view />
    </div>
</template>
<script>
const { ipcRenderer } = require("electron");
export default {
    name: "app",
    data() {
        return {
            host: "127.0.0.1",
        };
    },
    mounted() {
        ipcRenderer.on("OnUserJoin", (event, arg) => {
            console.warn(arg);
        });
    },
    methods: {},
};
</script>
<style>
* {
    margin: 0;
    padding: 0;
}
html,
body {
    background: #1e1e1e;
    height: 100%;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
    font-size: 14px;
    height: 100%;
}
input[type="text"] {
    background: none;
    border: 1px #ccc solid;
    color: #fff;
    padding: 10px 6px;
    outline: none;
    color: #000;
    min-width: 200px;
}

input[type="button"] {
    background: #2c3e50;
    border: none;
    border-radius: 0;
    color: #fff;
    margin-top: 10px;
    padding: 10px 0;
}

#nav {
    padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #42b983;
}
</style>

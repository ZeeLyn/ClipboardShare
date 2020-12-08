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
input[type="text"],
input[type="password"] {
    background: none;
    border: 1px #ccc solid;
    color: #fff;
    padding: 7px 10px;
    outline: none;
    font-size: 12px;
    outline: none;
}

input[type="button"] {
    background: #2c3e50;
    border: none;
    border-radius: 0;
    color: #fff;
    padding: 6px 10px;
    font-size: 12px;
    outline: none;
    border: 1px #ccc solid;
    cursor: pointer;
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

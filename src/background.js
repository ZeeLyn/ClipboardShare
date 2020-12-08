'use strict'

import { app, protocol, BrowserWindow, screen, ipcMain, dialog, Tray, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
var path = require('path');
import config from './lib/config.js'
const isDevelopment = process.env.NODE_ENV !== 'production'
var appTray = null;
import program from "./program.js";
var suspensionWindow = null;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } }
])
var mainWin = null;
var configs = config.GetConfig();
async function createWindow() {
	// Create the browser window.

	const win = mainWin = new BrowserWindow({
		width: configs.token ? 1000 : 2000,
		height: configs.token ? 400 : 1500,
		darkTheme: true,
		show: true,
		frame: configs.token ? false : true,
		skipTaskbar: true,
		transparent: true,
		alwaysOnTop: true,
		// minimizable: false,
		// maximizable: false,
		// closable: false,
		webPreferences: {
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
			nodeIntegration: true,
			enableRemoteModule: true
		}
	})
	win.on('ready-to-show', () => {
		//createSuspensionWindow();
	});
	win.setMenu(null);
	win.on("close", event => {
		event.preventDefault();
		win.hide();
		win.setSkipTaskbar(true);
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		// Load the index.html when not in development
		win.loadURL('app://./index.html')
	}
	//win.webContents.openDevTools();
	process.env.ELECTRON_RUN_AS_NODE = 0;

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS)
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString())
		}
	}
	createWindow();
	//createSuspensionWindow();

	program.Init(configs, mainWin, suspensionWindow)

	const cwd = isDevelopment ? null : path.join(__dirname, '..');
	appTray = new Tray(isDevelopment ? path.join("./public", "app.png") : path.join(cwd, "app.asar/app.png"));
	appTray.setToolTip("局域网剪切板分享");
	let trayMenuTemplate = [
		{
			label: "关于",
			click: function () {
				dialog.showMessageBox({
					type: "info",
					title: "关于",
					message: "v " + app.getVersion(),
					buttons: ["ok"]
				});
			}
		}, {
			label: "设置",
			click: function () {
				mainWin.show();
				mainWin.setSkipTaskbar(false);
			}
		}
		, {
			label: "暂停分享",
			type: "checkbox",
			click: function (e) {
				console.warn(e.checked);
			}
		}
		, {
			label: '退出',
			click: function () {
				app.exit();
			}
		}];
	const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
	appTray.setContextMenu(contextMenu);
	appTray.on("double-click", () => {
		mainWin.show();
		mainWin.setSkipTaskbar(false);
	});
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit()
			}
		})
	} else {
		process.on('SIGTERM', () => {
			app.quit()
		})
	}
}

function createSuspensionWindow() {
	suspensionWindow = new BrowserWindow({
		title: "发送文件",
		width: 1300, height: 600,
		type: "toolbar",
		frame: true,
		resizable: false,
		show: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			//webSecurity: false
		},
		minimizable: false,
		maximizable: false,
		closable: false,
		transparent: false,
		alwaysOnTop: true,
		skipTaskbar: true,
		titleBarStyle: "hidden"
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		//await suspensionWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "#/sendfile")
		suspensionWindow.loadURL('http://www.baidu.com');
		console.warn(process.env.WEBPACK_DEV_SERVER_URL + "#/sendfile");

	} else {
		// Load the index.html when not in development
		//suspensionWindow.loadURL('app://./index.html#/sendfile')

		suspensionWindow.loadURL('https://www.baidu.com');
	}
	suspensionWindow.once('ready-to-show', () => {
		//if (configs.token)
		suspensionWindow.show();
	});
	suspensionWindow.webContents.on("did-fail-load", function () {
		dialog.showMessageBox("did-fail-load");
	})

	if (configs.postion) {
		suspensionWindow.setPosition(configs.postion.x, configs.postion.y, true);
	}

	if (!process.env.IS_TEST)
		suspensionWindow.openDevTools();
	//suspensionWindow.webContents.openDevTools()

	// suspensionWindow.on("", function () {
	// 	console.warn("focus");
	// });

	// const size = screen.getPrimaryDisplay().workAreaSize;   //获取显示器的宽高
	// const winSize = win.getSize();  //获取窗口宽高

	// //设置窗口的位置 注意x轴要桌面的宽度 - 窗口的宽度
	// win.setPosition(size.width - winSize[0], 100);


	// let trayMenuTemplate = [
	// 	{
	// 		label: 'DEV',
	// 		click: function () {
	// 			suspensionWindow.webContents.openDevTools();
	// 		}
	// 	}];
	// const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
	// suspensionWindow.setMenu(contextMenu);
	suspensionWindow.on("moved", (e) => {
		//console.warn(e.sender.getPosition());
		var p = e.sender.getPosition();
		configs.postion = { x: p[0], y: p[1] };
		config.ModifyConfig(configs);
	});

}
//将文件拖入悬浮窗
ipcMain.on("drag_in_files", (event, arg) => {
	if (suspensionWindow) {
		//suspensionWindow.setSize(300, 300, true);
	}
});
//选择文件保存目录
ipcMain.on("ChooseSaveFileFolder", (event, arg) => {
	dialog.showOpenDialog({ properties: ["openDirectory"] }).then(e => {
		//console.warn(e);
		if (e.canceled)
			return;
		mainWin.webContents.send("OnChangeSaveFileFolder", e.filePaths[0]);
	});
});
//基本信息填写完成
ipcMain.on("init-completed", (event, arg) => {
	//suspensionWindow.show();
});

ipcMain.on("ShowWindow", () => {
	// if (process.platform == "win32")
	// 	mainWin.setResizable(true)
	mainWin.setSize(400, 600, true);
	// if (process.platform == "win32")
	// 	mainWin.setResizable(false)

});
ipcMain.on("ShowMiniWindow", () => {
	//console.warn("ShowMiniWindow");
	// if (process.platform == "win32")
	// 	mainWin.setResizable(true)
	mainWin.setSize(100, 40, true);
	// if (process.platform == "win32")
	// 	mainWin.setResizable(false)

});

ipcMain.on("show_main_window", () => {
	mainWin.show();
	mainWin.setSkipTaskbar(false);
});
ipcMain.on("app_exit", () => {
	app.exit();
})
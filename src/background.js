'use strict'

import { app, protocol, BrowserWindow, screen, ipcMain, dialog, Tray, Menu, nativeImage, Point } from 'electron'
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
		title: "局域网剪切板分享",
		icon: nativeImage.createFromPath(isDevelopment ? path.join("./public", "app.png") : path.join(cwd, "app.asar/app.png")),
		width: configs.token ? 100 : 400,
		height: configs.token ? 32 : 600,
		darkTheme: true,
		show: true,
		frame: false,
		skipTaskbar: configs.token ? true : false,
		transparent: true,
		alwaysOnTop: configs.token ? true : false,
		minimizable: false,
		maximizable: false,
		closable: false,
		webPreferences: {
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
			nodeIntegration: true,
			enableRemoteModule: true
		}
	})
	if (configs.postion) {
		win.setPosition(configs.postion.x, configs.postion.y);
	}
	win.on('ready-to-show', () => {
		//createSuspensionWindow();
	});
	win.setMenu(null);
	win.on("close", event => {
		event.preventDefault();
		win.hide();
		win.setSkipTaskbar(true);
	});
	win.on("moved", (e) => {
		var p = e.sender.getPosition();
		configs.postion = { x: p[0], y: p[1] };
		config.ModifyConfig(configs);
	});
	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		//if (!process.env.IS_TEST) win.webContents.openDevTools()
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
		}
		, {
			label: "暂停分享",
			type: "checkbox",
			checked: !configs.enable,
			click: function (e) {
				//console.warn(e);
				configs.enable = !e.checked;
				program.SetStatus(!e.checked);
				mainWin.webContents.send("SetShareStatus", !e.checked);
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
	// appTray.on("double-click", () => {
	// 	ShowBigWindow();
	// });
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
	mainWin.flashFrame(false);
});

function ShowBigWindow() {
	if (process.platform == "win32")
		mainWin.setResizable(true)
	mainWin.setSize(400, 600, true);
	if (process.platform == "win32")
		mainWin.setResizable(false)
	mainWin.setAlwaysOnTop(false);
	mainWin.setSkipTaskbar(false);

	var postion = mainWin.getPosition();
	let currentDisplay = screen.getDisplayNearestPoint({ x: postion[0], y: postion[1] });
	let currentDisplaySize = currentDisplay.size;
	//console.warn(postion, currentDisplay, screen.getAllDisplays());
	if (postion[0] + (400 * currentDisplay.scaleFactor) > currentDisplaySize.width + currentDisplay.bounds.x) {
		mainWin.setPosition(currentDisplaySize.width + currentDisplay.bounds.x - (400 * currentDisplay.scaleFactor), postion[1], true);
	}

}

//打开大窗口
ipcMain.on("ShowWindow", () => {
	//console.warn("ShowWindow");
	ShowBigWindow();
});
//打开浮层
ipcMain.on("ShowMiniWindow", () => {
	if (process.platform == "win32")
		mainWin.setResizable(true)
	mainWin.setSize(100, 32, true);
	if (process.platform == "win32")
		mainWin.setResizable(false)
	mainWin.setAlwaysOnTop(true);
	mainWin.setSkipTaskbar(true);
	if (configs.postion)
		mainWin.setPosition(configs.postion.x, configs.postion.y, true);
});


ipcMain.on("app_exit", () => {
	app.exit();
})
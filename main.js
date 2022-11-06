const {Main, MenuItem, ipcMain} = require('chuijs');
const { TelegramSrc } = require("./app/TelegramSrc");
const json = require('./package.json');
// Main
let main = new Main({
    name: json.description,
    width: 900,
    height: 725,
    render: `${__dirname}/app/app.js`,
    devTools: false,
    menuBarVisible: false,
    icon: `${__dirname}/resources/icons/app/icon.png`,
});
main.start({
    tray: [
        new MenuItem().button('Показать \\ Скрыть', () => { main.hideAndShow() }),
        new MenuItem().separator(),
        new MenuItem().button("Консоль", () => { main.toggleDevTools() }),
        new MenuItem().separator(),
        new MenuItem().quit('Выход')
    ]
})

main.enableAutoUpdateApp(3000, json.version);

const tgSrc = new TelegramSrc(main);

ipcMain.on("getUser", async () => await tgSrc.getUser());
ipcMain.on("LOGOUT", async () => await tgSrc.logOut());
ipcMain.on("getAuth", async () => await tgSrc.getAuth());
ipcMain.on('getTokenForQRCode', async (event, password) => await tgSrc.authQrCode(password));
ipcMain.on('loginInPhone', async () => {
    await tgSrc.loginInPhone(
        new Promise((resolve) => ipcMain.on("channel_phone", async (event, phone) => resolve(phone))),
        new Promise((resolve) => ipcMain.on("channel_code", async (event, code) => resolve(code))),
        new Promise((resolve) => ipcMain.on("channel_pass", async (event, password) => resolve(password)))
    )
});
ipcMain.on('tg_crt_chat', async (e, userList, pin_message, inc_num, desc, doc_link) => await tgSrc.createChat(userList, pin_message, inc_num, desc, doc_link));
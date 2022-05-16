const { Main, MenuItem, ipcMain } = require('chui-electron');
const electron = require("electron");
//
const {TelegramClient} = require("telegram");
const api_id = 12415990;
const api_hash = '240958bf7eb5068290dff67cb3c73b1f';
const { StoreSession } = require("telegram/sessions");
const storeSession = new StoreSession("my_session");
const client = new TelegramClient(storeSession, api_id, api_hash, {
    connectionRetries: 5
});
//

let main = new Main({
    name: "Создание чата в Telegram",
    width: 600,
    height: 780,
    render: `${__dirname}/app/app.js`,
    devTools: false,
    menuBarVisible: false,
    icon: `${__dirname}/resources/icons/app/icon.png`
});
main.start({
    hideOnClose: false,
    tray: [
        new MenuItem().button('Показать \\ Скрыть', () => { main.hideAndShow() }),
        new MenuItem().separator(),
        new MenuItem().toggleDevTools('Консоль разработчика'),
        new MenuItem().separator(),
        new MenuItem().quit('Выход')
    ]
})
//
ipcMain.on('getTokenForQRCode', async (event) => {
    await storeSession.load()
    await client.connect();
    storeSession.save()
    if (!await client.checkAuthorization()) {
        const test = await client.signInUserWithQrCode({apiId: client.apiId, apiHash: client.apiHash},
            {
                onError: async (e) => {
                    console.log("error", e);
                    return true;
                },
                qrCode: async (code) => {
                    electron.BrowserWindow.getAllWindows().filter(b => {
                        b.webContents.send('generatedTokenForQRCode', `tg://login?token=${code.token.toString("base64")}`)
                    })
                }
            }
        );
        console.log(test)
    }
    console.log("You should now be connected.");
    console.log(client.session.save());
    await client.sendMessage("me", {message: "Перезагрузка приложения!!"});
})
//
ipcMain.on('tg_crt_chat', (e, userList, pin_message, inc_num, desc, doc_link) => {
    require('./app/src').createChat(userList, pin_message, inc_num, desc, doc_link).then(r => console.log(r))
})
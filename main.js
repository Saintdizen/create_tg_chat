const { Main, MenuItem, ipcMain } = require('chui-electron');
const main = new Main({
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
ipcMain.on('tg_send_code', (e, phone) => {
    require('./app/src').firstAuth(phone).then(r => console.log(r))
})
ipcMain.on('tg_auth', (e, phone, code, appData) => {
    require('./app/src').auth(phone, code, appData).then(r => console.log(r))
})
ipcMain.on('tg_crt_chat', (e, userList, pin_message, inc_num, desc, doc_link) => {
    require('./app/src').createChat(userList, pin_message, inc_num, desc, doc_link).then(r => console.log(r))
})
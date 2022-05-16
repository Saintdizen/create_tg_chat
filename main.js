const { Main, MenuItem, ipcMain } = require('chui-electron');
const electron = require("electron");
//
const { TelegramClient, Api } = require("telegram");
const api_id = 12415990;
const api_hash = '240958bf7eb5068290dff67cb3c73b1f';
const dc_id = 2;
const port = 443;
const ip = "149.154.167.41";
const ses_name = "create_tg_chat"
//
const client = new TelegramClient(ses_name, api_id, api_hash, {});
client.session.setDC(dc_id, ip, port);
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
//
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
ipcMain.on('getTokenForQRCode', async () => {
    await client.connect();
    if (!await client.checkAuthorization()) {
        await client.signInUserWithQrCode({apiId: client.apiId, apiHash: client.apiHash},
            {
                onError: async (e) => {
                    await sendAuthStatus('error', false, `${e}`);
                    return true;
                },
                qrCode: async (code) => {
                    electron.BrowserWindow.getAllWindows().filter(async b => {
                        await b.webContents.send('generatedTokenForQRCode', `tg://login?token=${code.token.toString("base64")}`)
                    })
                }
            }
        ).then(async (user) => {
            await sendAuthStatus(true);
            await sendLog('success', `Онлайн: ${user.firstName} ${user.lastName}`);
        });
    } else {
        const me = await client.getMe();
        await sendAuthStatus(true);
        await sendLog('success', `Онлайн: ${me.firstName} ${me.lastName}`);
    }
})
//
ipcMain.on('tg_crt_chat', async (e, userList, pin_message, inc_num, desc, doc_link) => {
    try {
        //Создать группу
        await sendLog(undefined, `Создание группы...`)
        let date_STRING = format(new Date());
        const res_cr_chat = await client.invoke(new Api.channels.CreateChannel({
            megagroup: true,
            title: `${date_STRING} - ${desc} - ${inc_num}`,
            about: `Создан чат по проблеме ${date_STRING} - ${desc} - ${inc_num}`,
        }));
        let chat_id = res_cr_chat.updates[2].channelId.value;

        //Получение ссылки на приглашение в чат
        await sendLog(undefined, `Получение ссылки на приглашение в чат...`)
        const invite_link = await client.invoke(new Api.messages.ExportChatInvite({
            peer: chat_id,
        }));
        let tg_link = invite_link.link;

        //Корректировка сообщения
        await sendLog(undefined, `Корректировка сообщения...`)
        let message = pin_message.split('\n');
        message[1] = `<b><a href="${doc_link}">Ссылка</a></b>  на отчет по инциденту`
        message.push(`\nПриглашение в оперативный чат: ${tg_link}`)
        const new_message = message.join('\n')

        //Отправка сообщения
        await sendLog(undefined, `Отправка и закрепление сообщения...`)
        await client.sendMessage(chat_id, {
            message: new_message,
            parseMode: 'html',
            linkPreview: false
        }).then(async (e) => {
            await client.pinMessage(chat_id, e.id, {notify: true})
        })

        //Добавить людей
        await sendLog(undefined, `Добавление пользователей в чат...`)
        for (let user of userList) {
            await client.invoke(new Api.channels.InviteToChannel({
                channel: chat_id,
                users: [`${user}`],
            })).catch(async (e) => {
                await sendLog('error', `Пользователь с ником ${user} не найден\n(${e})`)
            });
        }
        const { Notification } = require('electron')
        new Notification({title: 'Создание чата в Telegram', body: 'Чат успешно создан!'}).show()
    } catch (e) {
        await sendLog('error', e.message)
    }
})

// Отправка логов
async function sendLog(type = String(undefined), message = String(undefined)) {
    electron.BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('sendLog', type, message)
    })
}
// Отправить статус авторизации
async function sendAuthStatus(status = Boolean(undefined)) {
    electron.BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('sendAuthStatus', status)
    })
}
//Формат даты
function format(date) {
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    //Определение дня и месяца
    if (day < 10) { day = "0" + day }
    if (month < 10) { month = "0" + month }
    return String(day + "-" + month + "-" + year)
}
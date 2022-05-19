const os = require("os");
const electron = require("electron");
const { Main, MenuItem, ipcMain } = require('chui-electron');
// GoogleSheets
const { GoogleSheets } = require('./app/google_sheets/google_sheets')
let googleSheets = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
// TelegramClient
const { TelegramClient, Api } = require("telegram");
const client = new TelegramClient("create_tg_chat", 12415990, "240958bf7eb5068290dff67cb3c73b1f", {
    appVersion: '0.0.9',
    deviceModel: `${os.hostname().toUpperCase()} ${os.platform().toUpperCase()} ${os.arch().toString()}`,
    langCode: 'ru',
    systemVersion: os.release().toString(),
    systemLangCode: 'ru'
});
client.session.setDC(2, "149.154.167.41", 443);
// Main
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
// ipcMain
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
            await createUserData(`@${user.username}`)
        });
    } else {
        const me = await client.getMe();
        await sendAuthStatus(true);
        await sendLog('success', `Онлайн: ${me.firstName} ${me.lastName}`);
        await createUserData(`@${me.username}`)
    }
})
ipcMain.on('tg_crt_chat', async (e, userList, pin_message, inc_num, desc, doc_link) => {
    try {
        //Создать группу
        await setProgressText('Создание группы...')
        await setProgressValue(25)
        let date_STRING = format(new Date());
        const res_cr_chat = await client.invoke(new Api.channels.CreateChannel({
            megagroup: true,
            title: `${date_STRING} - ${desc} - ${inc_num}`,
            about: `Создан чат по проблеме ${date_STRING} - ${desc} - ${inc_num}`,
        }));
        let chat_id = res_cr_chat.updates[2].channelId.value;

        //Получение ссылки на приглашение в чат
        await setProgressText('Получение ссылки на приглашение в чат...')
        await setProgressValue(40)
        const invite_link = await client.invoke(new Api.messages.ExportChatInvite({
            peer: chat_id,
        }));
        let tg_link = invite_link.link;

        //Корректировка сообщения
        await setProgressText('Корректировка сообщения...')
        await setProgressValue(55)
        let message = pin_message.split('\n');
        message[1] = `<b><a href="${doc_link}">Ссылка</a></b>  на отчет по инциденту`
        message.push(`\nПриглашение в оперативный чат: ${tg_link}`)
        const new_message = message.join('\n')

        //Отправка сообщения
        await setProgressText('Отправка и закрепление сообщения...')
        await setProgressValue(70)
        await client.sendMessage(chat_id, {
            message: new_message,
            parseMode: 'html',
            linkPreview: false
        }).then(async (e) => {
            await client.pinMessage(chat_id, e.id, {notify: true})
        })

        //Добавить людей
        await setProgressText('Добавление пользователей в чат...')
        await setProgressValue(85)
        for (let user of userList) {
            await client.invoke(new Api.channels.InviteToChannel({
                channel: chat_id,
                users: [`${user}`],
            })).catch(async () => {
                await setProgressLogText(`Пользователь с ником ${user} не найден`)
            });
        }
        const { Notification } = require('electron')
        await setProgressText('Чат успешно создан!')
        await setProgressValue(100)
        await closeDialog()
        new Notification({title: 'Создание чата в Telegram', body: 'Чат успешно создан!'}).show()
    } catch (e) {
        await closeDialog()
        await setProgressLogText(e.message)
        await console.log(e.message)
    }
})
// ФУНКЦИИ
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
// Конфигурация пользователя
async function createUserData(tag_tg = String(undefined)) {
    let USERS = await googleSheets.read('USERS!A1:C')
    for (let user of USERS) {
        if (tag_tg.includes(user[0])) {
            electron.BrowserWindow.getAllWindows().filter(b => {
                b.webContents.send('user_data', user[0], user[1], user[2])
            })
        }
    }
    await sendLog('success', `Конфигурация загружена`)
}
// Прогресс бар
async function setProgressValue(value = Number(undefined)) {
    electron.BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('setProgressValue', value)
    })
}
async function setProgressText(text = String(undefined)) {
    electron.BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('setProgressText', text)
    })
}
async function setProgressLogText(text = String(undefined)) {
    electron.BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('setProgressLogText', text)
    })
}
async function closeDialog() {
    electron.BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('closeDialog')
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
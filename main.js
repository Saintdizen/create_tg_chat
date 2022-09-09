const os = require("os");
let username = os.userInfo().username
const { transliterate } = require('transliteration');
let username_new = username.replaceAll(new RegExp("[^a-zA-Zа-яА-Я\\s0-9]", 'g'), '').trim().replaceAll(" ", '_')

const { BrowserWindow } = require("electron");
const { Main, MenuItem, ipcMain, ipcRenderer} = require('chuijs');
// GoogleSheets
const { GoogleSheets } = require('./app/google_sheets/google_sheets')
let googleSheets = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
// TelegramClient
const { TelegramClient, Api} = require("telegram");
const json = require('./package.json')

const client = new TelegramClient(`${transliterate(username_new).toLowerCase()}_create_tg_chat`, 5030579, "c414e180e62df5a8d8078b8e263be014", {
    appVersion: json.version,
    deviceModel: `${os.hostname().toUpperCase()} ${os.platform().toUpperCase()}`,
    langCode: 'ru',
    systemVersion: os.release().toString(),
    systemLangCode: 'ru'
});

const appName = 'Создание чата в Telegram'

client.session.setDC(2, "149.154.167.41", 443);
// Main
let main = new Main({
    name: appName,
    width: 1090,
    height: 700,
    render: `${__dirname}/app/app.js`,
    devTools: false,
    menuBarVisible: false,
    icon: `${__dirname}/resources/icons/app/icon.png`
});
main.start({
    hideOnClose: false,
    menuBar: [
        new MenuItem().submenu("Меню", [
            new MenuItem().button('Скрыть', () => { main.hideAndShow() }),
            new MenuItem().separator(),
            new MenuItem().toggleDevTools('Консоль'),
            new MenuItem().separator(),
            new MenuItem().quit('Выход')
        ])
    ],
    tray: [
        new MenuItem().button('Показать \\ Скрыть', () => { main.hideAndShow() }),
        new MenuItem().separator(),
        new MenuItem().quit('Выход')
    ]
})

ipcMain.on("getUser", async () => {
    await client.connect();
    try {
        const me = await client.getMe();
        await sendAuthStatus(true);
        await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
        await createUserData(`@${me.username}`)
    } catch (e) {
        await sendAuthStatus(false);
        await sendLog('error', `Авторизация`, e.message)
    }
})

ipcMain.on("getAuth", async () => {
    BrowserWindow.getAllWindows().filter(async b => {
        await b.webContents.send('checkAuthorization', await client.checkAuthorization())
    })
})
// ipcMain
ipcMain.on('getTokenForQRCode', async (event, password) => {
    //await client.connect();
    if (!await client.checkAuthorization()) {
        await client.signInUserWithQrCode({apiId: client.apiId, apiHash: client.apiHash},
            {
                onError: async (e) => {
                    await sendAuthStatus('error', false, `${e}`);
                    return true;
                },
                qrCode: async (code) => {
                    BrowserWindow.getAllWindows().filter(async b => {
                        await b.webContents.send('generatedTokenForQRCode', `tg://login?token=${code.token.toString("base64")}`)
                    })
                },
                password: async (hint) => {
                    console.log(hint)
                    return password;
                }
            }
        ).then(async (user) => {
            await sendAuthStatus(true);
            await sendLog('success', "Авторизация", `${user.firstName} ${user.lastName}`);
            await createUserData(`@${user.username}`)
        });
    } else {
        const me = await client.getMe();
        await sendAuthStatus(true);
        await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
        await createUserData(`@${me.username}`)
    }
})

ipcMain.on('loginInPhone', async () => {
    //await client.connect();
    if (!await client.checkAuthorization()) {
        await client.start({
            phoneNumber: async () => await new Promise((resolve) => {
                ipcMain.on("channel_phone", async (event, code) => resolve(code))
            }),
            phoneCode: async () => await new Promise((resolve) => {
                ipcMain.on("channel_code", async (event, code) => resolve(code))
            }),
            password: async () => await new Promise((resolve) => {
                ipcMain.on("channel_pass", async (event, code) => resolve(code))
            }),
            onError: async (err) => console.log(err),
        }).then(async () => {
            const me = await client.getMe();
            await sendAuthStatus(true);
            await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
            await createUserData(`@${me.username}`)
        });
    } else {
        const me = await client.getMe();
        await sendAuthStatus(true);
        await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
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

        //Изменение разрешений группы
        await client.invoke(
            new Api.messages.EditChatDefaultBannedRights({
                peer: chat_id,
                bannedRights: new Api.ChatBannedRights({
                    untilDate: 0,
                    changeInfo: true,
                    inviteUsers: true,
                    pinMessages: true,
                }),
            })
        );

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
        let message = pin_message.toString().replaceAll("<p>", "").replaceAll("</p>", "").split('\n');
        message[1] = `<b><a href="${doc_link}">Ссылка</a></b>  на отчет по инциденту`
        message.push(`\n<b>Приглашение в оперативный чат:</b> ${tg_link}`)
        const new_message = message.join('\n')

        //Отправка сообщения
        await setProgressText('Отправка и закрепление сообщения...')
        await setProgressValue(70)
        await client.sendMessage(chat_id, {
            message: new_message,
            parseMode: 'html',
            linkPreview: false
        }).then(async (e) => {
            await client.pinMessage(chat_id, e.id, {notify: false})
        })

        //Добавить людей
        await setProgressText('Добавление пользователей в чат...')
        await setProgressValue(85)
        for (let user of Array.from(new Set(userList))) {
            try {
                await client.invoke(new Api.channels.InviteToChannel({
                    channel: chat_id,
                    users: [`${user}`],
                }))
                await client.invoke(
                    new Api.channels.EditAdmin({
                        channel: chat_id,
                        userId: user,
                        adminRights: new Api.ChatAdminRights({
                            changeInfo: true,
                            postMessages: true,
                            editMessages: true,
                            deleteMessages: true,
                            banUsers: true,
                            inviteUsers: true,
                            pinMessages: true,
                            addAdmins: true,
                            anonymous: false,
                            manageCall: true,
                            other: true,
                        }),
                        rank: "Администратор",
                    })
                );
            } catch (e) {
                if (e.message.includes("A wait of ")) {
                    await setProgressLogText(e.message)
                    break
                } else {
                    await setProgressLogText(`Пользователь с ником ${user} не найден`)
                }
            }
        }
        const { Notification } = require('electron')
        await setProgressText('Чат успешно создан!')
        await setProgressValue(100)
        await closeDialog()
        new Notification({title: appName, body: 'Чат успешно создан!'}).show()
    } catch (e) {
        await closeDialog()
        await setProgressLogText(e.message)
        await console.log(e.message)
    }
})
// ФУНКЦИИ
// Отправка логов
async function sendLog(type = String(undefined), title = String(undefined), message = String(undefined)) {
    BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('sendLog', type, title, message)
    })
}
// Отправить статус авторизации
async function sendAuthStatus(status = Boolean(undefined)) {
    BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('sendAuthStatus', status)
    })
}
// Конфигурация пользователя
async function createUserData(tag_tg = String(undefined)) {
    await sleep(1000)
    await googleSheets.read('USERS!A1:C').then(async (users) => {
        users.forEach(user => {
            if (tag_tg.includes(user[0])) {
                BrowserWindow.getAllWindows().filter(b => {
                    b.webContents.send('user_data', user[0], user[1], user[2])
                })
            }
        })
        await sendLog('success', `Настройки пользователя`, `Настройки загружены`)
    })
}
// Прогресс бар
async function setProgressValue(value = Number(undefined)) {
    BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('setProgressValue', value)
    })
}
async function setProgressText(text = String(undefined)) {
    BrowserWindow.getAllWindows().filter(b => {
        b.webContents.send('setProgressText', text)
    })
}
async function setProgressLogText(text = String(undefined)) {
    BrowserWindow.getAllWindows().forEach(b => {
        b.webContents.send('setProgressLogText', text)
    })
}
async function closeDialog() {
    BrowserWindow.getAllWindows().filter(b => {
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
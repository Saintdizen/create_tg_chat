const os = require("os");
const fs = require("fs");
let username = os.userInfo().username
const { transliterate } = require('transliteration');
let username_new = username.replaceAll(new RegExp("[^a-zA-Zа-яА-Я\\s0-9]", 'g'), '').trim().replaceAll(" ", '_');
let sessionPath = require('path').join(require('os').homedir(), 'sessions_create_tg_chat');
let sessionFile = `${transliterate(username_new).toLowerCase()}.json`;
let fullSessionPath = require("path").join(sessionPath, sessionFile);

const {Main, MenuItem, ipcMain} = require('chuijs');
// GoogleSheets
const {GoogleSheets} = require('./app/google_sheets/google_sheets')
let googleSheets = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
// TelegramClient
const {TelegramClient, Api} = require("telegram");
// StringSession
const {StringSession} = require("telegram/sessions");
// JSON
const json = require('./package.json');

let stringSession = new StringSession("");
if (fs.existsSync(fullSessionPath)) stringSession = new StringSession(require(fullSessionPath).session);

const client = new TelegramClient(stringSession, 5030579, "c414e180e62df5a8d8078b8e263be014", {
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

setTimeout(async () => {
    const adapter = await main.getAutoUpdateAdapter();
    let updates = await adapter.checkUpdates();
    if (updates !== null) {
        let ver = updates.versionInfo.version;
        if (ver > json.version) {
            await sendNotificationUpdate("Проверка обновлений", `Доступна новая версия ${updates.versionInfo.version}`);
        }
        adapter.addUpdateDownloadedEvent(async () => {
            await sendNotificationUpdate("Проверка обновлений", "Обновление загружено\nОбновление будет установлено автоматически\nПо завершению установки приложение перезапустится");
            await adapter.quitAndInstall();
        })
    } else {
        await sendNotificationUpdate("Проверка обновлений", "Обновлений не найдено");
    }
}, 5000);

ipcMain.on("getUser", async () => {
    await client.connect();
    try {
        const me = await client.getMe();
        await sendUserData(me);
        await sendAuthStatus(true);
        await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
        await createUserData(`@${me.username}`)
    } catch (e) {
        await sendAuthStatus(false);
    }
})

ipcMain.on("LOGOUT", async () => {
    await client.invoke(new Api.auth.LogOut({}));
    if (fs.existsSync(fullSessionPath)) fs.unlinkSync(fullSessionPath);
    main.restart();
})

ipcMain.on("getAuth", async () => {
    let auth = await client.checkAuthorization();
    main.getWindow().webContents.send("checkAuthorization", auth)
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
                    let qr = `tg://login?token=${code.token.toString("base64")}`;
                    main.getWindow().webContents.send("generatedTokenForQRCode", qr)
                },
                password: async (hint) => {
                    console.log(hint)
                    return password;
                }
            }
        ).then(async (user) => {
            await sendUserData(user)
            await sendAuthStatus(true);
            await sendLog('success', "Авторизация", `${user.firstName} ${user.lastName}`);
            await createUserData(`@${user.username}`)
            await saveSession(client);
        });
    } else {
        const me = await client.getMe();
        await sendUserData(me);
        await sendAuthStatus(true);
        await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
        await createUserData(`@${me.username}`)
    }
})

ipcMain.on('loginInPhone', async () => {
    //await client.connect();
    if (!await client.checkAuthorization()) {
        await client.start({
            phoneNumber: async () => await new Promise((resolve) => ipcMain.on("channel_phone", async (event, code) => resolve(code))),
            phoneCode: async () => await new Promise((resolve) => ipcMain.on("channel_code", async (event, code) => resolve(code))),
            password: async () => await new Promise((resolve) => ipcMain.on("channel_pass", async (event, code) => resolve(code))),
            onError: async (err) => await sendAuthPhoneError("Авторизация по номеру", err),
        }).then(async () => {
            const me = await client.getMe();
            await sendUserData(me)
            await sendAuthStatus(true);
            await sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
            await createUserData(`@${me.username}`)
            await saveSession(client);
        });
    } else {
        const me = await client.getMe();
        await sendUserData(me)
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
        try {
            await client.sendMessage(chat_id, {
                message: new_message,
                parseMode: 'html',
                linkPreview: false
            }).then(async (e) => {
                await client.pinMessage(chat_id, e.id, {notify: false})
            })
            let today = new Date();
            await client.sendMessage(chat_id, {
                message: `В ближайшее время будет произведены архивация и удаление чата`,
                schedule: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 8, 0).getTime() / 1000
            })
        } catch (e) {
            if (e.message.includes("A wait of ")) {
                await setProgressLogText(e.message)
            } else {
                await setProgressLogText(e.message)
            }
        }
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
        await setProgressText('Чат успешно создан!')
        await setProgressValue(100)
        await closeDialog()
        await sendNotification(appName, 'Чат успешно создан!');
    } catch (e) {
        await closeDialog()
        await setProgressLogText(e.message)
        await console.log(e.message)
    }
})
// ФУНКЦИИ
// Отправка логов
async function sendLog(type = String(undefined), title = String(undefined), message = String(undefined)) {
    main.getWindow().webContents.send("sendLog", type, title, message)
}
async function sendAuthPhoneError(title = String(undefined), message = String(undefined)) {
    main.getWindow().webContents.send("sendAuthPhoneError", title, message)
}
// Отправить статус авторизации
async function sendAuthStatus(status = Boolean(undefined)) {
    main.getWindow().webContents.send("sendAuthStatus", status)
}

async function saveSession(client) {
    let sessionString = await client.session.save();
    fs.access(sessionPath, (error) => {
        // Создание папки сессии
        if (error) {
            fs.mkdir(sessionPath, { recursive: true }, async (err) => {
                if (err) await sendLog('error', `Сохранение сессии`, `Ошибка: ${err}`);
            });
        }
        // Создание файла сессии
        let json = `{ 
    "session": "${sessionString}"
}`
        //
        fs.writeFile(fullSessionPath, json, async (err) => {
            if (err) {
                await sendLog('error', `Сохранение сессии`, `Ошибка: ${err}`)
            } else {
                await sendLog('success', `Сохранение сессии`, `Сессия успешно сохранена!`)
            }
        })
    });
}

// Конфигурация пользователя
async function createUserData(tag_tg = String(undefined)) {
    let users = await googleSheets.read('USERS!A1:C').catch(async err => await sendLog('error', `Настройки пользователя`, err));
    users.forEach(user => {
        if (user[0] === tag_tg) {
            setTimeout(async () => {
                main.getWindow().webContents.send("user_data", user[0], user[1], user[2]);
                await sendLog('success', `Настройки пользователя`, `Настройки загружены`)
            }, 1000);
        }
    })
}
// Прогресс бар
async function setProgressValue(value = Number(undefined)) {
    main.getWindow().webContents.send("setProgressValue", value)
}
async function setProgressText(text = String(undefined)) {
    main.getWindow().webContents.send("setProgressText", text)
}
async function setProgressLogText(text = String(undefined)) {
    main.getWindow().webContents.send("setProgressLogText", text)
}
async function closeDialog() {
    main.getWindow().webContents.send("closeDialog")
}
async function sendUserData(user) {
    main.getWindow().webContents.send("sendUserData", user)
}
async function sendNotification(text, body) {
    main.getWindow().webContents.send("sendNotification", text, body)
}
async function sendNotificationUpdate(text, body) {
    main.getWindow().webContents.send("sendNotificationUpdate", text, body)
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
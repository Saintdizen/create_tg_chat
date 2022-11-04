const {TelegramClient, Api} = require("telegram");
const json = require("../package.json");
const os = require("os");
const path = require("path");
const {transliterate} = require("transliteration");
const fs = require("fs");
const {StringSession} = require("telegram/sessions");
const {GoogleSheets} = require('../app/google_sheets/google_sheets');
let googleSheets = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');

class TelegramSrc {
    #mainApp = undefined;
    #client = undefined;
    #username_new = os.userInfo().username.replaceAll(new RegExp("[^a-zA-Zа-яА-Я\\s\\d]", 'g'), '').trim().replaceAll(" ", '_');
    #sessionPath = path.join(os.homedir(), 'sessions_create_tg_chat');
    #sessionFile = `${transliterate(this.#username_new).toLowerCase()}.json`;
    #fullSessionPath = path.join(this.#sessionPath, this.#sessionFile);
    #stringSession = new StringSession("");
    constructor(mainApp) {
        this.#mainApp = mainApp;
        this.#createSessionDir();
        if (fs.existsSync(this.#fullSessionPath)) this.#stringSession = new StringSession(require(this.#fullSessionPath).session);
        this.#client = new TelegramClient(this.#stringSession, 5030579, "c414e180e62df5a8d8078b8e263be014", {
            appVersion: json.version,
            deviceModel: `${os.hostname().toUpperCase()} ${os.platform().toUpperCase()}`,
            langCode: 'ru',
            systemVersion: os.release().toString(),
            systemLangCode: 'ru'
        });
        this.#client.session.setDC(2, "149.154.167.41", 443);
    }
    format(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if (day < 10) { day = "0" + day }
        if (month < 10) { month = "0" + month }
        return String(day + "-" + month + "-" + year)
    }
    #createSessionDir() {
        if (!fs.existsSync(this.#sessionPath)) fs.mkdirSync(this.#sessionPath, { recursive: true });
    }
    async #sendLog(type = String(undefined), title = String(undefined), message = String(undefined)) {
        this.#mainApp.getWindow().webContents.send("sendLog", type, title, message)
    }
    async #setProgressValue(value = Number(undefined)) {
        this.#mainApp.getWindow().webContents.send("setProgressValue", value)
    }
    async #setProgressText(text = String(undefined)) {
        this.#mainApp.getWindow().webContents.send("setProgressText", text)
    }
    async #setProgressLogText(text = String(undefined)) {
        this.#mainApp.getWindow().webContents.send("setProgressLogText", text)
    }
    async #closeDialog() {
        this.#mainApp.getWindow().webContents.send("closeDialog")
    }
    async #sendUserData(user) {
        this.#mainApp.getWindow().webContents.send("sendUserData", user)
    }
    async #sendNotification(text, body) {
        this.#mainApp.getWindow().webContents.send("sendNotification", text, body)
    }
    async #sendAuthPhoneError(title = String(undefined), message = String(undefined)) {
        this.#mainApp.getWindow().webContents.send("sendAuthPhoneError", title, message)
    }
    async #sendAuthStatus(status = Boolean(undefined)) {
        this.#mainApp.getWindow().webContents.send("sendAuthStatus", status)
    }
    //
    async #saveSession() {
        try {
            let sessionString = await this.#client.session.save();
            let json = `{"session": "${sessionString}"}`
            fs.writeFileSync(this.#fullSessionPath, json);
            await this.#sendLog('success', `Сохранение сессии`, `Сессия успешно сохранена!`)
        } catch (e) {
            await this.#sendLog('error', `Сохранение сессии`, `Ошибка: ${e}`)
        }
    }
    async #createUserData(tag_tg = String(undefined)) {
        let users = await googleSheets.read('USERS!A1:C').catch(async err => await this.#sendLog('error', `Настройки пользователя`, err));
        users.forEach(user => {
            if (user[0] === tag_tg) {
                setTimeout(async () => {
                    this.#mainApp.getWindow().webContents.send("user_data", user[0], user[1], user[2]);
                    await this.#sendLog('success', `Настройки пользователя`, `Настройки загружены`)
                }, 1000);
            }
        })
    }
    //
    async getUser() {
        await this.#client.connect();
        try {
            const me = await this.#client.getMe();
            await this.#sendUserData(me);
            await this.#sendAuthStatus(true);
            await this.#sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
            await this.#createUserData(`@${me.username}`)
        } catch (e) {
            await this.#sendAuthStatus(false);
        }
    }
    async getAuth() {
        let auth = await this.#client.checkAuthorization();
        this.#mainApp.getWindow().webContents.send("checkAuthorization", auth)
    }
    async authQrCode(password) {
        if (!await this.#client.checkAuthorization()) {
            await this.#client.signInUserWithQrCode({apiId: this.#client.apiId, apiHash: this.#client.apiHash},
                {
                    onError: async (e) => {
                        await this.#sendAuthStatus('error', false, `${e}`);
                        return true;
                    },
                    qrCode: async (code) => {
                        let qr = `tg://login?token=${code.token.toString("base64")}`;
                        this.#mainApp.getWindow().webContents.send("generatedTokenForQRCode", qr)
                    },
                    password: async () => {
                        return password;
                    }
                }
            ).then(async (user) => {
                await this.#sendUserData(user)
                await this.#sendAuthStatus(true);
                await this.#sendLog('success', "Авторизация", `${user.firstName} ${user.lastName}`);
                await this.#createUserData(`@${user.username}`)
                await this.#saveSession();
            });
        } else {
            const me = await this.#client.getMe();
            await this.#sendUserData(me);
            await this.#sendAuthStatus(true);
            await this.#sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
            await this.#createUserData(`@${me.username}`)
        }
    }
    async loginInPhone(phone, code, password) {
        if (!await this.#client.checkAuthorization()) {
            await this.#client.start({
                phoneNumber: async () => await phone,
                phoneCode: async () => await code,
                password: async () => await password,
                onError: async (err) => await this.#sendAuthPhoneError("Авторизация по номеру", err),
            }).then(async () => {
                const me = await this.#client.getMe();
                await this.#sendUserData(me)
                await this.#sendAuthStatus(true);
                await this.#sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
                await this.#createUserData(`@${me.username}`)
                await this.#saveSession();
            });
        } else {
            const me = await this.#client.getMe();
            await this.#sendUserData(me)
            await this.#sendAuthStatus(true);
            await this.#sendLog('success', "Авторизация", `${me.firstName} ${me.lastName}`);
            await this.#createUserData(`@${me.username}`)
        }
    }
    async createChat(userList, pin_message, inc_num, desc, doc_link) {
        try {
            //Создать группу
            await this.#setProgressText('Создание группы...')
            await this.#setProgressValue(25)
            let date_STRING = this.format(new Date());
            const res_cr_chat = await this.#client.invoke(new Api.channels.CreateChannel({
                megagroup: true,
                title: `${date_STRING} - ${desc} - ${inc_num}`,
                about: `Создан чат по проблеме ${date_STRING} - ${desc} - ${inc_num}`,
            }));
            let chat_id = res_cr_chat.updates[2].channelId.value;

            //Изменение разрешений группы
            await this.#client.invoke(
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
            await this.#setProgressText('Получение ссылки на приглашение в чат...')
            await this.#setProgressValue(40)
            const invite_link = await this.#client.invoke(new Api.messages.ExportChatInvite({
                peer: chat_id,
            }));
            let tg_link = invite_link.link;

            //Корректировка сообщения
            await this.#setProgressText('Корректировка сообщения...')
            await this.#setProgressValue(55)
            let message = pin_message.toString().replaceAll("<p>", "").replaceAll("</p>", "").split('\n');
            message[1] = `<b><a href="${doc_link}">Ссылка</a></b>  на отчет по инциденту`
            message.push(`\n<b>Приглашение в оперативный чат:</b> ${tg_link}`)
            const new_message = message.join('\n')

            //Отправка сообщения
            await this.#setProgressText('Отправка и закрепление сообщения...')
            await this.#setProgressValue(70)
            try {
                await this.#client.sendMessage(chat_id, {
                    message: new_message,
                    parseMode: 'html',
                    linkPreview: false
                }).then(async (e) => {
                    await this.#client.pinMessage(chat_id, e.id, {notify: false})
                })
                let today = new Date();
                await this.#client.sendMessage(chat_id, {
                    message: `В ближайшее время будет произведены архивация и удаление чата`,
                    schedule: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 8, 0).getTime() / 1000
                })
            } catch (e) {
                if (e.message.includes("A wait of ")) {
                    await this.#setProgressLogText(e.message)
                } else {
                    await this.#setProgressLogText(e.message)
                }
            }
            //Добавить людей
            await this.#setProgressText('Добавление пользователей в чат...')
            await this.#setProgressValue(85)
            for (let user of Array.from(new Set(userList))) {
                try {
                    await this.#client.invoke(new Api.channels.InviteToChannel({
                        channel: chat_id,
                        users: [`${user}`],
                    }))
                    await this.#client.invoke(
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
                        await this.#setProgressLogText(e.message)
                        break
                    } else {
                        await this.#setProgressLogText(`Пользователь с ником ${user} не найден`)
                    }
                }
            }
            await this.#setProgressText('Чат успешно создан!')
            await this.#setProgressValue(100)
            await this.#closeDialog()
            await this.#sendNotification(json.description, 'Чат успешно создан!');
        } catch (e) {
            await this.#closeDialog()
            await this.#setProgressLogText(e.message)
            await console.log(e.message)
        }
    }
    async logOut() {
        await this.#client.invoke(new Api.auth.LogOut({}));
        if (fs.existsSync(this.#fullSessionPath)) fs.unlinkSync(this.#fullSessionPath);
        this.#mainApp.restart();
    }
}
exports.TelegramSrc = TelegramSrc
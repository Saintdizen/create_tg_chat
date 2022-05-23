const {app} = require('electron').remote;
//CHUI
let { Page, Button, TextInput, ContentBlock, Styles, CheckBox, Badge, TextArea, Notification, BadgeStyle, ipcRenderer,
    NotificationStyle, Image, Dialog, ProgressBar, Label
} = require('chui-electron');
let QRCode = require("qrcode");
//
const path = require('path')
let user_data_path = path.join(app.getPath('userData'), 'user_data.json')
const {TGApis} = require("./apis");
const api = new TGApis(user_data_path)
//GOOGLE
let { GoogleSheets, GoogleDrive } = require('./google_sheets/google_sheets')
let googleSheets = new GoogleSheets('1zlmN2pioRFLfVqcNdvcCjZ4gw3AzkkhMLE83cwgIKv8');
let googleSheets_DB = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
let googleDrive = new GoogleDrive();
//
let lists = [];
let report = {
    folder_id: String(undefined),
    file_id: String(undefined)
}
let QRCode_block = undefined;
let block_radios = undefined;
let block = undefined;
let progressBlock = undefined;

class CreateChatTG extends Page {
    constructor() {
        super();
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        block_radios = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        QRCode_block = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        //QR_CODE
        generateQRCode(this);
        block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.WRAP, Styles.ALIGN.BASELINE, Styles.JUSTIFY.START);
        block.setWidth("-webkit-fill-available")
        progressBlock = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);

        //Статус выполнения
        progressBlock.setWidth("-webkit-fill-available")
        let modal = new Dialog({
            width: "80%",
            height: "max-content",
        })
        let progressBar = new ProgressBar(100);
        progressBar.setWidth("-webkit-fill-available")
        progressBar.setValue(0)
        progressBlock.add(progressBar)
        modal.addToBody(progressBlock)
        this.add(modal)
        //
        let inc_num = new TextInput({
            title: 'Номер инцидента',
            placeholder: 'Номер инцидента',
            width: '-webkit-fill-available',
            required: false
        });
        inc_num.setValue('IM')
        let desc = new TextInput({
            title: 'Описание',
            placeholder: 'Описание',
            width: '-webkit-fill-available',
            required: false
        });
        let pin_message = new TextArea({
            title: 'Закрепленное сообщение',
            placeholder: 'Закрепленное сообщение',
            width: '-webkit-fill-available',
            height: '202px',
            required: false
        });
        pin_message.setValue(`Описание инцидента:
Ссылка на отчет по инциденту
Ссылка на оперативный чат
Отвественный:

Время начала:
Время окончания:
Статус:`)

        let label_1 = new Badge('Наименование чата сформируется по шаблону:\nДД.ММ.ГГГГ - Описание - № Инцидента', BadgeStyle.WARNING);
        let label_2 = new Badge('Дата и номер инцидента будут добалвены автоматически', BadgeStyle.WARNING);
        let label_3 = new Badge('Добавьте в чат снимок экрана с зафиксированной ошибкой', BadgeStyle.WARNING);

        let button_c_chat = new Button('Создать чат', async () => {
            if (lists.length !== 0) {
                modal.open()
                progressBar.setProgressText('Клонирование документа с отчетом...')
                let date_STRING = format(new Date());
                try {
                    await googleDrive.copyDocument({
                        title: `${date_STRING} - ${inc_num.getValue()}`,
                        parentFolderId: report.folder_id,
                        fileId: report.file_id
                    }).then(async id => {
                        if (id !== undefined) {
                            try {
                                progressBar.setValue(10)
                                let link = `https://docs.google.com/document/d/${id}/edit`;
                                progressBar.setProgressText('Создание чата...')
                                // Создание группы
                                progressBar.setProgressText('Создание группы...')
                                progressBar.setValue(25)
                                let date_STRING = format(new Date());
                                let channel = await api.createChannel(
                                    `${date_STRING} - ${desc.getValue()} - ${inc_num.getValue()}`,
                                    `Создан чат по проблеме ${date_STRING} - ${desc.getValue()} - ${inc_num.getValue()}`
                                ).catch(e => console.log(e))
                                let chat_id = String(channel.chats[0].id)
                                let access_hash = String(channel.chats[0].access_hash)
                                console.log(channel)

                                //Получение ссылки на приглашение в чат
                                progressBar.setProgressText('Получение ссылки на приглашение в чат...')
                                progressBar.setValue(40)
                                const invite = await api.exportChatInvite(chat_id, access_hash).catch(e => console.log(e));
                                let invite_link = invite.link

                                //Отправка сообщения
                                progressBar.setProgressText('Отправка сообщения...')
                                progressBar.setValue(55)
                                const mes = await api.sendMessage(chat_id, access_hash, pin_message.getValue(), link, invite_link).catch(e => console.log(e));
                                let message_to_pin = mes.updates[0].id

                                //Закрепление сообщения
                                progressBar.setProgressText('Закрепление сообщения...')
                                progressBar.setValue(70)
                                await api.updatePinnedMessage(chat_id, access_hash, message_to_pin).catch(e => console.log(e));

                                //Добавить людей
                                progressBar.setProgressText('Добавление пользователей в чат...')
                                progressBar.setValue(85)

                                let no_dubl = Array.from(new Set(lists))
                                const inv = await api.inviteToChannel(chat_id, access_hash, no_dubl).catch(e => console.log(e));
                                console.log(inv)

                                //Чат успешно создан!
                                progressBar.setProgressText('Чат успешно создан!')
                                progressBar.setValue(100)
                                let close = new Button('Закрыть', () => {
                                    modal.close()
                                    progressBar.setProgressText("")
                                    progressBar.setValue(0)
                                })
                                modal.addToFooter(close)
                            } catch (e) {
                                progressBlock.add(new Label(e.message))
                                let close = new Button('Закрыть', () => {
                                    modal.close()
                                    progressBar.setProgressText("")
                                    progressBar.setValue(0)
                                })
                                modal.addToFooter(close)
                            }
                        }
                    })
                } catch (e) {
                    progressBlock.add(new Label(e))
                    modal.addToFooter(new Button('Закрыть', () => {
                        modal.close()
                        progressBar.setProgressText("")
                        progressBar.setValue(0)
                    }))
                }
            } else {
                new Notification('Выберите список пользователей!').show()
            }
        });
        block.add(block_radios, inc_num, desc, pin_message, label_1, label_2, label_3, button_c_chat)
    }
}

async function createDataUser(tag_tg = String(undefined)) {
    let USERS = await googleSheets_DB.read('USERS!A1:C')
    for (let user of USERS) {
        if (tag_tg.includes(user[0])) {
            await googleSheets.getLists().then(async values => {
                for (let list of values.data.sheets) {
                    let check = new CheckBox({
                        title: list.properties.title.replace(` (${user[2]})`, ''),
                        changeListener: async (e) => {
                            if (e.target.checked) {
                                await googleSheets.read(`${list.properties.title}!A1:C`).then(values => {
                                    let users_list = values.filter(data => data.length !== 0);
                                     users_list.forEach(users => {
                                        if (users.length !== 0) {
                                            lists.push({
                                                _: 'inputUser',
                                                user_id: users[1],
                                                access_hash: ""
                                            })
                                        }
                                    })
                                }).finally(async () => {
                                    await googleSheets_DB.read(`REPORTS!A1:D`).then(res => {
                                        res.filter(val => {
                                            if (val[1].includes(check.getTitle())) {
                                                report.folder_id = val[2]
                                                report.file_id = val[3]
                                            }
                                        })
                                    })
                                    lists = lists.filter((values, index) => {
                                        return index === lists.findIndex(obj => {
                                            return JSON.stringify(obj) === JSON.stringify(values);
                                        });
                                    })
                                    console.log(lists)
                                    new Notification('Список пользователей обновлен', NotificationStyle.SUCCESS).show()
                                })
                            } else {
                                googleSheets.read(`${list.properties.title}!A1:C`).then(values => {
                                    lists = []
                                    report.folder_id = undefined
                                    report.file_id = undefined
                                }).finally(() => {
                                    console.log(Array.from(new Set(lists)))
                                    new Notification('Список пользователей обновлен', NotificationStyle.SUCCESS).show()
                                })
                            }
                        }
                    });
                    if (list.properties.title.includes("Тестер") || list.properties.title.includes("Общая проблема")) {
                        block_radios.add(check);
                    }
                    if (list.properties.title.includes(user[2])) {
                        block_radios.add(check);
                    } else if (user[2].includes("*")) {
                        block_radios.add(check);
                    }
                }
            })
        }
    }
    new Notification('Конфигурация загружена', NotificationStyle.SUCCESS).show()
}

async function generateQRCode(page) {
    page.add(QRCode_block)
    QRCode_block.setWidth("-webkit-fill-available")
    if (!await api.getAuth()) {
        let code = await api.exportLoginToken()
        QRCode.toDataURL(code).then(src => {
            QRCode_block.add(new Image(src, "280px", "280px"))
        })
        api.addUpdateShortListener(async (updateInfo) => {
            if (updateInfo.update._ === 'updateLoginToken') {
                await api.exportLoginToken()
                const user = await api.getUser();
                await api.client.storage.set("user_id", user.id)
                await api.client.storage.set("access_hash", user.access_hash)
                await api.client.storage.set("first_name", user.first_name)
                await api.client.storage.set("last_name", user.last_name)
                await api.client.storage.set("username", user.username)
                //await sendAuthStatus(true);
                new Notification(`Онлайн: ${user.first_name} ${user.last_name}`, NotificationStyle.SUCCESS).show()
                await createDataUser(`@${user.username}`)
                page.remove(QRCode_block)
                page.add(block)
            }
        })
    } else {
        let me = await api.getUser();
        //await sendAuthStatus(true);
        new Notification(`Онлайн: ${me.first_name} ${me.last_name}`, NotificationStyle.SUCCESS).show()
        await createDataUser(`@${me.username}`)
        page.remove(QRCode_block)
        page.add(block)
    }
}
function format(date) {
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    //Определение дня и месяца
    if (day < 10) { day = "0" + day }
    if (month < 10) { month = "0" + month }
    return String(day + "-" + month + "-" + year)
}
exports.CreateChatTG = CreateChatTG
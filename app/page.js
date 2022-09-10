'use strict';
const {
    Page, Button, TextInput, ContentBlock, Styles, Notification, ipcRenderer, NotificationStyle,
    Image, Dialog, ProgressBar, Label, RadioGroup, Spinner, SpinnerSize, PasswordInput, TextEditor
} = require('chuijs');
const { GoogleSheets, GoogleDrive } = require('./google_sheets/google_sheets')
const QRCode = require("qrcode");
const {AuthHelpDialog, CreateHelpDialog} = require("./page_help");
let googleSheets = new GoogleSheets('1zlmN2pioRFLfVqcNdvcCjZ4gw3AzkkhMLE83cwgIKv8');
let googleSheets_DB = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
let googleDrive = new GoogleDrive();
let lists = [];
const report = {
    folder_id: String(undefined),
    file_id: String(undefined)
}
//
class CreateChatTG extends Page {
    #help_auth_dialog = new AuthHelpDialog();
    #help_create_dialog = new CreateHelpDialog();
    #tabs_block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
    #qr = undefined;
    #phone = undefined;
    constructor() {
        super();
        // Настройки страницы
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        this.setFullWidth();
        // ===
        this.#enableLogsNotification();
        this.add(this.#help_auth_dialog)
        this.add(this.#help_create_dialog)
        //
        this.#tabs_block.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#tabs_block.add(
            new Button("Авторизация по QR-коду", () => {
                this.#qr = this.#qrCodeBlock();
                this.#tabs_block.clear();
                this.#tabs_block.add(this.#qr)
            }),
            new Button("Авторизация по телефону", () => {
                this.#phone = this.#phoneBlock();
                this.#tabs_block.clear();
                this.#tabs_block.add(this.#phone)
            })
        );
        //
        ipcRenderer.send("getUser")
        ipcRenderer.on('sendAuthStatus', (e, status) => {
            if (status) {
                this.remove(this.#tabs_block)
                this.add(this.#mainBlock())
                this.#help_create_dialog.open()
            } else {
                this.add(this.#tabs_block)
                this.#help_auth_dialog.open()
            }
        })
    }
    #phoneBlock() {
        let main = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        main.setWidth(Styles.WIDTH.WEBKIT_FILL)
        ipcRenderer.send("loginInPhone")
        let block_phone = this.#addBlockTest("Телефон", "Отправить", "channel_phone", () => {
            main.clear()
            main.add(block_code)
        });
        let block_code = this.#addBlockTest("Проверочный код", "Отправить", "channel_code", () => {
            main.clear()
            main.add(block_pass)
        });
        let block_pass = this.#addBlockTest("Пароль", "Авторизоваться", "channel_pass");
        main.add(block_phone)
        return main;
    }
    #addBlockTest(inoutTitle, buttonTitle, channel, listener = () => {}) {
        let block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        block.setWidth(Styles.WIDTH.WEBKIT_FILL)
        let input = undefined;
        if (inoutTitle.includes("Пароль")) {
            input = new PasswordInput({ title: inoutTitle, width: "225px" })
        } else {
            input = new TextInput({ title: inoutTitle, width: "225px" })
        }
        let button = new Button(buttonTitle, () => {
            ipcRenderer.send(channel, input.getValue())
            listener()
        })
        block.add(input, button)
        return block
    }
    #qrCodeBlock() {
        let main = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        main.setWidth(Styles.WIDTH.WEBKIT_FILL)
        let QRCode_block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        QRCode_block.setWidth("-webkit-fill-available")
        main.add(QRCode_block)
        //Проверка авторизации
        ipcRenderer.send("getAuth")
        ipcRenderer.on("checkAuthorization", (e, auth) => {
            if (auth) {
                ipcRenderer.send('getTokenForQRCode', "")
            } else {
                let input_pass = new PasswordInput({
                    title: "Пароль",
                    width: "225px"
                })
                let generate = new Button("Сгенерировать QR-код", () => {
                    ipcRenderer.send('getTokenForQRCode', input_pass.getValue())
                    ipcRenderer.on('generatedTokenForQRCode', (e, text) => {
                        QRCode.toDataURL(text).then(src => {
                            QRCode_block.clear()
                            QRCode_block.add(new Image({
                                base64: src,
                                width: "280px",
                                height: "280px"
                            }))
                            new Notification({
                                title: "Авторизация", text: "QR-код изменен",
                                style: NotificationStyle.WARNING,
                                showTime: 3000
                            }).show()
                        })
                    })
                })
                QRCode_block.add(input_pass, generate)
            }
        })
        return main;
    }
    #mainBlock() {
        let block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.WRAP, Styles.ALIGN.BASELINE, Styles.JUSTIFY.START);
        block.setWidth("-webkit-fill-available")
        //
        let block_radios = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        block_radios.setWidth(Styles.WIDTH.WEBKIT_FILL);
        //
        let progressBlock = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        progressBlock.setWidth("-webkit-fill-available")
        //
        let modal = new Dialog({
            width: "80%",
            height: "max-content",
        })
        //
        let progressBar = new ProgressBar(100);
        progressBar.setWidth("-webkit-fill-available")
        progressBar.setValue(0)
        //
        let spinner = new Spinner(SpinnerSize.STANDART, '8px auto');
        //
        let radioGroup = new RadioGroup({
            styles: {
                direction: Styles.DIRECTION.ROW,
                wrap: Styles.WRAP.WRAP,
                align: Styles.ALIGN.CENTER,
                justify: Styles.JUSTIFY.CENTER,
                width: Styles.WIDTH.WEBKIT_FILL
            }
        });
        let radio_groups = [];
        // Номер инцидента
        let inc_num = new TextInput({
            title: 'Номер инцидента',
            placeholder: 'Номер инцидента',
            width: '-webkit-fill-available',
            required: false
        });
        inc_num.setValue('IM')
        // Описение инцидента
        let desc = new TextInput({
            title: 'Описание инцидента',
            placeholder: 'Описание инцидента',
            width: '-webkit-fill-available',
            required: false
        });
        // Закрепленное сообщение
        let pin_message = new TextEditor(Styles.WIDTH.WEBKIT_FILL, {
            title: "Закрепленное сообщение",
            controls: {
                UNDO_REDO: true,
                BLOCK_FORMAT: false,
                FONT_SIZE: false,
                REMOVE_FORMAT: false,
                BOLD: true,
                ITALIC: true,
                STRIKE_THROUGH: true,
                UNDERLINE: true,
                SUBSCRIPT: false,
                SUPERSCRIPT: false,
                JUSTIFY_LEFT: false,
                JUSTIFY_CENTER: false,
                JUSTIFY_RIGHT: false,
                JUSTIFY_FULL: false,
                LISTS: false,
                INSERT_LINK: false,
                INSERT_TABLE: false,
                INSERT_IMAGE: false,
                LINE_BREAK: false,
                CONTENT_CONTROLS: false
            }
        })
        pin_message.setValueAsHTML("<p><b>Описание инцидента:</b></p>\n" +
            "<p>--- Данная строка будет автоматически изменена ---</p>\n" +
            "<p><b>Отвественный:</b></p>\n" +
            "<p><b><br></b></p>\n" +
            "<p><b>Время начала:</b></p>\n" +
            "<p><b>Время окончания:</b></p>\n" +
            "<p><b>Статус:</b></p>")
        // Кнопка закрытия модала
        let button_close = new Button('Закрыть', () => {
            modal.close()
            progressBar.setProgressText("")
            progressBar.setValue(0)
        })
        // Кнопка создания чата
        let button_c_chat = new Button('Создать чат', async () => {
            if (lists.length !== 0) {
                modal.open()
                progressBar.setProgressText('Клонирование документа с отчетом...')
                let date_STRING = CreateChatTG.#format(new Date());
                try {
                    await googleDrive.copyDocument({
                        title: `${date_STRING} - ${inc_num.getValue()}`,
                        parentFolderId: report.folder_id,
                        fileId: report.file_id
                    }).then(id => {
                        if (id !== undefined) {
                            progressBar.setValue(10)
                            let link = `https://docs.google.com/document/d/${id}/edit`;
                            progressBar.setProgressText('Создание чата...')
                            ipcRenderer.on('setProgressValue', (e, value) => {
                                progressBar.setValue(value)
                            })
                            ipcRenderer.on('setProgressText', (e, text) => {
                                progressBar.setProgressText(text)
                            })
                            ipcRenderer.on('setProgressLogText', (e, text) => {
                                progressBlock.add(new Label(text))
                            })
                            ipcRenderer.send('tg_crt_chat', lists, pin_message.getValueAsHTML(), inc_num.getValue(), desc.getValue(), link)
                        }
                    })
                } catch (e) {
                    progressBlock.add(new Label(e))
                }
            } else {
                new Notification({
                    title: 'Создание чата', text: 'Выберите список пользователей',
                    style: NotificationStyle.ERROR,
                    showTime: 3000
                }).show()
            }
        });
        //
        progressBlock.add(progressBar)
        modal.addToBody(progressBlock)
        block.add(modal)
        block_radios.add(spinner)
        googleSheets.getLists().then(async values => {
            ipcRenderer.on('user_data', (e, TAG_TG, ROLE, GROUP) => {
                for (let list of values.data.sheets) {
                    if (list.properties.title.includes("Тестер") || list.properties.title.includes("Общая проблема")) {
                        radio_groups.push(list.properties.title);
                    } else {
                        if (list.properties.title.includes(GROUP)) {
                            radio_groups.push(list.properties.title)
                        } else if (GROUP.includes("*")) {
                            radio_groups.push(list.properties.title)
                        }
                    }
                }
                radioGroup.addOptions(radio_groups)
                radioGroup.addChangeListener(async (e) => {
                    await googleSheets.read(`${e.target.value}!A1:A`).then(values => {
                        lists = []
                        values.forEach(val => {
                            if (val.length !== 0) {
                                lists.push(val[0])
                            }
                        })
                    }).then(async () => {
                        await googleSheets_DB.read(`REPORTS!A1:D`).then(res => {
                            res.filter(val => {
                                if (e.target.value.includes(val[1])) {
                                    report.folder_id = val[2]
                                    report.file_id = val[3]
                                }
                            })
                        })
                        new Notification({
                            title: 'Список пользователей', text: "Обновлен",
                            style: NotificationStyle.SUCCESS,
                            showTime: 3000
                        }).show()
                    })
                })
                block_radios.clear()
                block_radios.add(radioGroup)
            })
        })
        modal.addToFooter(button_close)
        //Добавление компонентов на форму
        block.add(block_radios, inc_num, desc, pin_message, button_c_chat)
        return block;
    }
    #enableLogsNotification() {
        ipcRenderer.on('sendLog', (e, type, title, message) => {
            if (type === "success") {
                new Notification({
                    title: title, text: message, style: NotificationStyle.SUCCESS, showTime: 3000
                }).show()
            } else if (type === 'error') {
                new Notification({
                    title: title, text: message, style: NotificationStyle.ERROR, showTime: 3000
                }).show()
            } else if (type === undefined) {
                new Notification({
                    title: title, text: message, showTime: 3000
                }).show()
            }
        })
    }
    static #format(date) {
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        //Определение дня и месяца
        if (day < 10) { day = "0" + day }
        if (month < 10) { month = "0" + month }
        return String(day + "-" + month + "-" + year)
    }
}

exports.CreateChatTG = CreateChatTG
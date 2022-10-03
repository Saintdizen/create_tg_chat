'use strict';
const {Page, Button, TextInput, ContentBlock, Styles, Notification, ipcRenderer, Dialog, ProgressBar, Label, RadioGroup, Spinner, SpinnerSize, TextEditor} = require('chuijs');
const {GoogleSheets, GoogleDrive} = require('../google_sheets/google_sheets')
const {AuthHelpDialog, CreateHelpDialog} = require("../dialogs/dialogs");
let googleSheets = new GoogleSheets('1zlmN2pioRFLfVqcNdvcCjZ4gw3AzkkhMLE83cwgIKv8');
let googleSheets_DB = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
let googleDrive = new GoogleDrive();
let lists = [];
let report = { folder_id: String(undefined), file_id: String(undefined) }
//
const {AuthMain} = require("../auth/auth");
const fs = require("fs");
//
class CreateChatTG extends Page {
    #help_auth_dialog = new AuthHelpDialog();
    #help_create_dialog = new CreateHelpDialog();
    #tabs_block = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER });
    constructor() {
        super();
        // Настройки страницы
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        this.setFullWidth();
        this.setFullHeight();
        // ===
        this.#enableLogsNotification();
        this.add(this.#help_auth_dialog)
        this.add(this.#help_create_dialog)
        //
        this.#tabs_block.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#tabs_block.setHeight(Styles.SIZE.WEBKIT_FILL)
        this.#tabs_block.add(new AuthMain(this.#tabs_block));
        //
        ipcRenderer.send("getUser")
        ipcRenderer.on('sendAuthStatus', async (e, status) => {
            if (status) {
                let main = await this.#mainBlock();
                this.remove(this.#tabs_block)
                this.add(main)
                //this.#help_create_dialog.open()
            } else {
                this.add(this.#tabs_block)
                this.#help_auth_dialog.open()
            }
        })
    }
    async #mainBlock() {
        let block = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN,
            wrap: Styles.WRAP.WRAP,
            align: Styles.ALIGN.BASELINE,
            justify: Styles.JUSTIFY.START
        });
        block.setWidth("-webkit-fill-available")
        //
        let block_radios = new ContentBlock({
            direction: Styles.DIRECTION.ROW,
            wrap: Styles.WRAP.WRAP,
            align: Styles.ALIGN.CENTER,
            justify: Styles.JUSTIFY.CENTER
        });
        block_radios.setWidth(Styles.SIZE.WEBKIT_FILL);
        //
        let progressBlock = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN,
            wrap: Styles.WRAP.WRAP,
            align: Styles.ALIGN.CENTER,
            justify: Styles.JUSTIFY.CENTER
        });
        progressBlock.setWidth("-webkit-fill-available")
        progressBlock.disableMarginChild();
        //
        let modal = new Dialog({
            width: "80%",
            height: "max-content",
        })
        //
        let progressBar = new ProgressBar({max: 100});
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
                width: Styles.SIZE.WEBKIT_FILL
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
        let pin_message = new TextEditor(Styles.SIZE.WEBKIT_FILL, {
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
        let button_close = new Button({
            title: "Закрыть",
            clickEvent: () => {
                modal.close()
                progressBar.setProgressText("")
                progressBar.setValue(0)
            }
        })
        // Кнопка создания чата
        let button_c_chat = new Button({
            title: "Создать чат",
            clickEvent: async () => {
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
                                ipcRenderer.on('setProgressValue', (e, value) => progressBar.setValue(value))
                                ipcRenderer.on('setProgressText', (e, text) => progressBar.setProgressText(text))
                                ipcRenderer.on('setProgressLogText', (e, text) => progressBlock.add(new Label(text)))
                                ipcRenderer.send('tg_crt_chat', lists, pin_message.getValueAsHTML(), inc_num.getValue(), desc.getValue(), link)
                            }
                        })
                    } catch (e) {
                        progressBlock.add(new Label(e))
                        new Notification({
                            title: 'Создание чата', text: e,
                            style: Notification.STYLE.ERROR, showTime: 3000
                        }).show()
                    }
                } else {
                    new Notification({
                        title: 'Создание чата', text: 'Выберите список пользователей',
                        style: Notification.STYLE.ERROR, showTime: 3000
                    }).show()
                }
            }
        })
        button_c_chat.setDisabled(true);
        //
        progressBlock.add(progressBar)
        modal.addToBody(progressBlock)
        block.add(modal)
        block_radios.add(spinner)

        let rp_names = undefined;
        if (fs.existsSync(this.#getPathFile("rp_names"))) {
            console.log("Читаю файл")
            rp_names = require(this.#getPathFile("rp_names"))
        } else {
            console.log("Читаю таблицу")
            let backup = await googleSheets.getLists().catch(err => console.log(err));
            rp_names = backup.data.sheets
            console.log("Создаю файл")
            this.#createFile("rp_names", JSON.stringify(rp_names))
        }

        ipcRenderer.on('user_data', async (e, TAG_TG, ROLE, GROUP) => {
            for (let list of rp_names) {
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
                try {
                    button_c_chat.setDisabled(true);
                    // Чтение таблиц
                    let report_list = await googleSheets_DB.read(`REPORTS!A1:D`);
                    //this.#createFile("report_list", JSON.stringify(report_list));


                    let users_list = await googleSheets.read(`${e.target.value}!A1:A`).catch(err => console.log(err));
                    //this.#createFile(e.target.value.replace(" ", ""), JSON.stringify(users_list))


                    //
                    lists = []
                    users_list.forEach(val => {
                        if (val.length !== 0) lists.push(val[0]);
                    })
                    report_list.filter(val => {
                        if (e.target.value.includes(val[1])) {
                            report.folder_id = val[2]
                            report.file_id = val[3]
                        }
                    })

                    //console.log(users_list)
                    //console.log(report_list)
                    new Notification({
                        title: 'Список пользователей', text: "Обновлен",
                        style: Notification.STYLE.SUCCESS, showTime: 3000
                    }).show()
                    button_c_chat.setDisabled(false);
                } catch (e) {
                    new Notification({
                        title: 'Список пользователей', text: e,
                        style: Notification.STYLE.ERROR, showTime: 3000
                    }).show()
                }
            })
            block_radios.clear()
            block_radios.add(radioGroup)
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
                    title: title, text: message, style: Notification.STYLE.SUCCESS, showTime: 3000
                }).show()
            } else if (type === 'error') {
                new Notification({
                    title: title, text: message, style: Notification.STYLE.ERROR, showTime: 3000
                }).show()
            } else if (type === undefined) {
                new Notification({
                    title: title, text: message, showTime: 3000
                }).show()
            }
        })
    }
    #getPathFile(name) {
        let filePath = require('path').join(require('os').homedir(), 'sessions_create_tg_chat');
        let fileName = `${name}.json`;
        return require("path").join(filePath, fileName);
    }
    #createFile(name, data) {
        let filePath = require('path').join(require('os').homedir(), 'sessions_create_tg_chat');
        let fileName = `${name}.json`;
        let fullSessionPath = require("path").join(filePath, fileName);
        // if (fs.existsSync(fullSessionPath)) stringSession = new StringSession(require(fullSessionPath).session);
        fs.access(filePath, (error) => {
            // Создание папки сессии
            if (error) {
                fs.mkdir(filePath, { recursive: true }, async (err) => {
                    if (err) {
                        new Notification({
                            title: title, text: "message", style: Notification.STYLE.ERROR, showTime: 3000
                        }).show()
                    }
                });
            }
            // Создание файла сессии
            fs.writeFile(fullSessionPath, data, async (err) => {
                if (err) {
                    new Notification({
                        title: title, text: "message", style: Notification.STYLE.ERROR, showTime: 3000
                    }).show()
                }
            })
        });
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
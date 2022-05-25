'use strict';
const { Page, Button, TextInput, ContentBlock, Styles, CheckBox, Badge, TextArea, Notification, BadgeStyle, ipcRenderer,
    NotificationStyle, Image, Dialog, ProgressBar, Label, RadioGroup
} = require('chui-electron');
const { GoogleSheets, GoogleDrive } = require('./google_sheets/google_sheets')
const QRCode = require("qrcode");
let googleSheets = new GoogleSheets('1zlmN2pioRFLfVqcNdvcCjZ4gw3AzkkhMLE83cwgIKv8');
let googleSheets_DB = new GoogleSheets('1o9v96kdyFrWwgrAwXA5SKXz8o5XDRBcjSpvTnYZM_EQ');
let googleDrive = new GoogleDrive();
let lists = [];
const report = {
    folder_id: String(undefined),
    file_id: String(undefined)
}
let QRCode_block = undefined;

 class CreateChatTG extends Page {
    constructor() {
        super();
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        enableLogsNotification();
        QRCode_block = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        let block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.WRAP, Styles.ALIGN.BASELINE, Styles.JUSTIFY.START);
        block.setWidth("-webkit-fill-available")
        //QR_CODE
        generateQRCode(this);
        //Статус выполнения
        let progressBlock = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
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

        //ФОРМЫ
        let block_radios = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
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
                        console.log(lists)
                        console.log(report)
                        new Notification('Список пользователей обновлен', NotificationStyle.SUCCESS).show()
                    })
                })
            })
        })
        block_radios.add(radioGroup)
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
            height: '182px',
            required: false
        });
        pin_message.setValue(`<b>Описание инцидента:</b>
--- Данная строка будет автоматически изменена ---
<b>Отвественный:</b>
        
<b>Время начала:</b>
<b>Время окончания:</b>
<b>Статус:</b>`)

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
                            ipcRenderer.on('closeDialog', () => {
                                modal.addToFooter(new Button('Закрыть', () => {
                                    modal.close()
                                    progressBar.setProgressText("")
                                    progressBar.setValue(0)
                                }))
                            })
                            ipcRenderer.send('tg_crt_chat', lists, pin_message.getValue(), inc_num.getValue(), desc.getValue(), link)
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
        //
        ipcRenderer.on('sendAuthStatus', (e, status) => {
            if (status) {
                this.remove(QRCode_block)
                this.add(block)
            }
        })
    }
}

function generateQRCode(page) {
    page.add(QRCode_block)
    QRCode_block.setWidth("-webkit-fill-available")
    ipcRenderer.send('getTokenForQRCode')
    ipcRenderer.on('generatedTokenForQRCode', (e, text) => {
        QRCode.toDataURL(text).then(src => {
            QRCode_block.clear()
            QRCode_block.add(new Image(src, "280px", "280px"))
            new Notification('QR-код изменен', NotificationStyle.WARNING).show()
        })
    })
}

function enableLogsNotification() {
    ipcRenderer.on('sendLog', (e, type, message) => {
        if (type === "success") {
            new Notification(message, NotificationStyle.SUCCESS).show()
        } else if (type === 'error') {
            new Notification(message, NotificationStyle.ERROR).show()
        } else if (type === undefined) {
            new Notification(message).show()
        }
    })
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
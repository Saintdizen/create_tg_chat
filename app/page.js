const { Page, Button, TextInput, ContentBlock, Styles, CheckBox, Badge, TextArea, Notification, BadgeStyle, ipcRenderer,
    NotificationStyle, Image
} = require('chui-electron');
const { GoogleSheets, GoogleDrive } = require('./google_sheets/google_sheets')
const QRCode = require("qrcode");
let googleSheets = new GoogleSheets('1zlmN2pioRFLfVqcNdvcCjZ4gw3AzkkhMLE83cwgIKv8');
let googleDrive = new GoogleDrive();
const lists = [];

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

        //ФОРМЫ
        let block_radios = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.WRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        googleSheets.getLists().then(values => {
            for (let list of values.data.sheets) {
                const check = new CheckBox({
                    title: list.properties.title,
                    changeListener: (e) => {
                        if (e.target.checked) {
                            googleSheets.read(`${check.getTitle()}!A1:A`).then(values => {
                                lists.push(values.filter(data => data.length !== 0))
                            }).finally(() => {
                                new Notification('Список пользователей обновлен', NotificationStyle.SUCCESS).show()
                            })
                        } else {
                            googleSheets.read(`${check.getTitle()}!A1:A`).then(values => {
                                lists.splice(lists.indexOf(values), 1)
                            }).finally(() => {
                                new Notification('Список пользователей обновлен', NotificationStyle.SUCCESS).show()
                            })
                        }
                    }
                });
                block_radios.add(check);
            }
        })
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
            height: '300px',
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

        let button_c_chat = new Button('Создать чат', () => {
            if (lists.length !== 0) {
                const finish_list = [];
                for (let list of lists) {
                    for (let userName of list) {
                        finish_list.push(userName[0])
                    }
                }
                new Notification('Клонирование документа с отчетом...').show()
                let date_STRING = format(new Date());
                googleDrive.copyDocument({
                    title: `${date_STRING} - ${inc_num.getValue()}`,
                    parentFolderId: '1DXi665zgxm-pFMPs1kg3uhw4QuVfuugJ',
                    fileId: '1lQBfpUqDw8S6jv3nk0gNjLMQqrqIyPjC'
                }).then(id => {
                    let link = `https://docs.google.com/document/d/${id}/edit`;
                    new Notification('Создание чата...').show()
                    ipcRenderer.send('tg_crt_chat', finish_list, pin_message.getValue(), inc_num.getValue(), desc.getValue(), link)
                })
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
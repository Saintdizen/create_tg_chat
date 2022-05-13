const { Page, Button, TextInput, ContentBlock, Styles, CheckBox, Badge, TextArea, Notification, BadgeStyle, ipcRenderer,
    NotificationStyle
} = require('chui-electron');
const appData = require('electron').remote.app.getPath('userData');
const fs = require('fs');
const { GoogleSheets, GoogleDrive } = require('./google_sheets/google_sheets')
let googleSheets = new GoogleSheets('1zlmN2pioRFLfVqcNdvcCjZ4gw3AzkkhMLE83cwgIKv8');
let googleDrive = new GoogleDrive();
const lists = [];

class CreateChatTG extends Page {
    constructor() {
        super();
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        let block = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.BASELINE, Styles.JUSTIFY.START);
        block.setWidth("-webkit-fill-available")
        let button_auth = new Button('Авторизоваться', () => {
            ipcRenderer.send('tg_auth', phone.getValue(), code.getValue(), appData)
            this.remove(code, button_auth)
            this.add(block)
        });

        //ФОРМЫ
        let block_radios = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.BASELINE, Styles.JUSTIFY.START);
        googleSheets.getLists().then(values => {
            for (let list of values.data.sheets) {
                const check = new CheckBox({
                    title: list.properties.title,
                    changeListener: (e) => {
                        if (e.target.checked) {
                            googleSheets.read(`${check.getTitle()}!A1:A`).then(values => {
                                lists.push(values)
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
        let phone = new TextInput({
            title: 'Номер телефона',
            placeholder: '+79998887766',
            width: '200px',
            height: '300px',
            required: false
        });
        let code = new TextInput({
            title: 'Код подтверждения',
            placeholder: 'XXXXX',
            width: '200px',
            height: '300px',
            required: false
        });
        //КОД
        let button_send_code = new Button('Выслать код', () => {
            this.remove(phone, button_send_code)
            ipcRenderer.send('tg_send_code', phone.getValue())
            this.add(code, button_auth)
        });
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
                console.log(date_STRING)
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
        let session_key = require('path').join(appData, "tg_session_string.txt");
        try {
            if (fs.existsSync(session_key)) {
                this.add(block)
                ipcRenderer.on('log_tg', (e, text) => {
                    new Notification(text).show()
                })
            } else {
                this.add(phone, button_send_code)
            }
        } catch(err) {
            console.error(err)
        }
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
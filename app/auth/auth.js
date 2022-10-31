const {ContentBlock, Styles, ipcRenderer, PasswordInput, TextInput, Button, Image, Notification, Icons, Label} = require("chuijs");
const QRCode = require("qrcode");

class AuthMain {
    #block_main = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER });
    constructor(tabs_block) {
        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.add(
            new Label({
                markdownText: "**Авторизация**",
                wordBreak: Styles.WORD_BREAK.BREAK_ALL
            }),
            new Button({
                title: "По QR-коду",
                icon: Icons.COMMUNICATION.QR_CODE,
                clickEvent: () => {
                    tabs_block.clear();
                    tabs_block.add(new AuthQRCode(tabs_block))
                }
            }),
            new Button({
                title: "По номеру",
                icon: Icons.COMMUNICATION.PHONE,
                clickEvent: () => {
                    tabs_block.clear();
                    tabs_block.add(new AuthPhone(tabs_block))
                }
            })
        );
        return this.#block_main;
    }
}

class AuthPhone {
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #block_phone = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #block_code = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #block_password = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    // Поля ввода
    #input_phone = new TextInput({title: "Номер телефона", placeholder: "+7XXXXXXXXXX", width: "225px"});
    #input_code = new TextInput({title: "Проверочный код", placeholder: "XXXXX", width: "225px"});
    #input_password = new PasswordInput({title: "Пароль", width: "225px"});
    // Кнопки
    #code_get = new Button({title: "Запросить код"});
    #code_send = new Button({title: "Отправить код"});
    #password_send = new Button({title: "Авторизоваться"});
    //
    #back = new Button({title: "Назад", icon: Icons.NAVIGATION.ARROW_BACK, reverse: true});

    constructor(tabs_block) {
        // Определение метода авторизации
        ipcRenderer.send("loginInPhone");
        // ===
        // Настройки главного блока и полей ввода
        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);
        this.#input_code.setDisabled(true);
        this.#input_password.setDisabled(true);
        this.#code_send.setDisabled(true);
        this.#password_send.setDisabled(true);
        this.#back.addClickListener(() => {
            tabs_block.clear();
            tabs_block.add(new AuthMain(tabs_block))
        })
        // ===
        //
        this.#code_get.addClickListener(async () => {
            ipcRenderer.send(AuthPhone.CHANNELS.PHONE, this.#input_phone.getValue());
            await this.#getAuthPhone([this.#input_phone, this.#code_get], [this.#input_code, this.#code_send]);
        });
        this.#code_send.addClickListener(async () => {
            ipcRenderer.send(AuthPhone.CHANNELS.CODE, this.#input_code.getValue())
            await this.#getAuthPhone([this.#input_code, this.#code_send], [this.#input_password, this.#password_send]);
        })
        this.#password_send.addClickListener(async () => {
            ipcRenderer.send(AuthPhone.CHANNELS.PASSWORD, this.#input_password.getValue())
            await this.#getAuthPhone([this.#input_password, this.#password_send], []);
        })

        // Добавление элементов
        this.#block_phone.add(this.#input_phone, this.#code_get);
        this.#block_code.add(this.#input_code, this.#code_send);
        this.#block_password.add(this.#input_password, this.#password_send);
        this.#block_main.add(this.#back, this.#block_phone, this.#block_code, this.#block_password);
        return this.#block_main;
    }
    async #getAuthPhone(disabled = [], enabled = []) {
        this.#back.setDisabled(true);
        for (let element of disabled) element.setDisabled(true);
        for (let element of enabled) element.setDisabled(false);
        ipcRenderer.on('sendAuthPhoneError', (e, title, message) => {
            new Notification({title: title, text: message, style: Notification.STYLE.ERROR, showTime: 3000}).show();
            this.#back.setDisabled(false);
            for (let element of disabled) element.setDisabled(false);
            for (let element of enabled) element.setDisabled(true);
        });
    }
    static CHANNELS = {PHONE: "channel_phone", CODE: "channel_code", PASSWORD: "channel_pass"}
}

class AuthQRCode {
    #main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #QRCode_block = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #back = new Button({title: "Назад", icon: Icons.NAVIGATION.ARROW_BACK, reverse: true});
    #input_pass = new PasswordInput({ title: "Пароль", width: "225px" });
    #generate = new Button({ title: "Сгенерировать", icon: Icons.COMMUNICATION.QR_CODE })

    constructor(tabs_block) {
        this.#main.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#QRCode_block.setWidth("-webkit-fill-available")
        this.#main.add(this.#back)
        this.#main.add(this.#input_pass, this.#generate)
        this.#main.add(this.#QRCode_block)
        this.#back.addClickListener(() => {
            tabs_block.clear();
            tabs_block.add(new AuthMain(tabs_block))
        })
        this.#generate.addClickListener(() => {
            this.#back.setDisabled(true);
            this.#input_pass.setDisabled(true);
            this.#generate.setDisabled(true);
            ipcRenderer.send('getTokenForQRCode', this.#input_pass.getValue())
            ipcRenderer.on('generatedTokenForQRCode', (e, text) => {
                QRCode.toDataURL(text).then(src => {
                    console.log(src)
                    this.#QRCode_block.clear()
                    this.#QRCode_block.add(new Image({
                        base64: src.replace("data:image/png;base64,", ""),
                        width: "280px",
                        height: "280px"
                    }))
                    new Notification({
                        title: "Авторизация", text: "QR-код изменен",
                        style: Notification.STYLE.WARNING,
                        showTime: 3000
                    }).show()
                })
            })
        })
        return this.#main;
    }
}

exports.AuthMain = AuthMain
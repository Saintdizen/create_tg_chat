const {
    ContentBlock,
    Styles,
    ipcRenderer,
    PasswordInput,
    TextInput,
    Button,
    Notification,
    Icons,
    Page,
    Route
} = require("chuijs");

class AuthPhone extends Page {
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

    constructor(back, mainPage) {
        super();
        this.setTitle('Авторизация по номеру телефона');
        this.setMain(false);
        this.setFullHeight()
        this.setFullWidth()
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
        this.#back.addClickListener(() => new Route().go(back))
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
            setTimeout(() => new Route().go(mainPage), 200)
        })

        // Добавление элементов
        this.#block_phone.add(this.#input_phone, this.#code_get);
        this.#block_code.add(this.#input_code, this.#code_send);
        this.#block_password.add(this.#input_password, this.#password_send);
        this.#block_main.add(this.#back, this.#block_phone, this.#block_code, this.#block_password);
        this.add(this.#block_main);

        ipcRenderer.on('sendAuthPhoneError', (e, title, message) => {
            new Notification({title: title, text: message, style: Notification.STYLE.ERROR, showTime: 3000}).show();
        });
    }

    async #getAuthPhone(disabled = [], enabled = []) {
        this.#back.setDisabled(true);
        for (let element of disabled) element.setDisabled(true);
        for (let element of enabled) element.setDisabled(false);
    }

    static CHANNELS = {PHONE: "channel_phone", CODE: "channel_code", PASSWORD: "channel_pass"}
}

exports.AuthPhone = AuthPhone
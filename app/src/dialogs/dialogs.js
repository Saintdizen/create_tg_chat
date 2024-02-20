const {Image, Styles, Dialog, ContentBlock, Label, Button, TreeView, Icons} = require("chuijs");

class AuthHelpDialog {
    #dialog = new Dialog({width: Styles.SIZE.WEBKIT_FILL, height: Styles.SIZE.WEBKIT_FILL, closeOutSideClick: false})
    #header_dialog = new ContentBlock({
        direction: Styles.DIRECTION.ROW,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.SPACE_BEETWEEN
    });
    #content = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.START,
        justify: Styles.JUSTIFY.CENTER
    });

    constructor() {
        this.#content.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#content.setHeight(Styles.SIZE.MAX_CONTENT)
        this.#content.add(AuthHelpDialog.#tree())
        this.#content.disableMarginChild()
        //
        this.#header_dialog.add(new Label({markdownText: "**Авторизация**"}), new Button({
            icon: Icons.NAVIGATION.CLOSE,
            clickEvent: () => this.#dialog.close()
        }))
        this.#header_dialog.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#header_dialog.disableMarginChild()
        this.#header_dialog.setPadding("0px 0px 0px 10px");
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(this.#content)
        return this.#dialog;
    }

    open() {
        this.#dialog.open()
    }

    static #tree() {
        return new TreeView({
            width: Styles.SIZE.WEBKIT_FILL,
            components: [
                TreeView.ExpandButton({title: "По QR-коду", components: new Data(data.qr_code_content).parse()}),
                TreeView.ExpandButton({title: "По номеру телефона", components: new Data(data.phone_content).parse()}),
            ]
        });
    }
}

exports.AuthHelpDialog = AuthHelpDialog

class CreateHelpDialog {
    #dialog = new Dialog({width: Styles.SIZE.WEBKIT_FILL, height: Styles.SIZE.WEBKIT_FILL, closeOutSideClick: false})
    #header_dialog = new ContentBlock({
        direction: Styles.DIRECTION.ROW,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.SPACE_BEETWEEN
    });
    #content = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.START,
        justify: Styles.JUSTIFY.CENTER
    });

    constructor() {
        this.#content.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#content.setHeight(Styles.SIZE.MAX_CONTENT)
        this.#content.add(...new Data(data.create_chat_content).parse())
        this.#header_dialog.add(new Label({markdownText: "**Создание чата**"}), new Button({
            icon: Icons.NAVIGATION.CLOSE,
            clickEvent: () => this.#dialog.close()
        }))
        this.#header_dialog.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#header_dialog.disableMarginChild();
        this.#header_dialog.setPadding("0px 0px 0px 10px");
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(this.#content)
        return this.#dialog;
    }

    open() {
        this.#dialog.open()
    }
}

exports.CreateHelpDialog = CreateHelpDialog

let data = {
    qr_code_content: [
        {
            text: "1) Нажать кнопку: **По QR-коду**",
            image: {
                width: "378px",
                path: `${__dirname}/../../../resources/images/auth/auth_qr/1_auth.png`
            }
        },
        {
            text: "2) Ввести пороль **двуэтапной вторизации**",
        },
        {
            text: "3) Нажать кнопку: **Сгенерировать**",
            image: {
                width: "410px",
                path: `${__dirname}/../../../resources/images/auth/auth_qr/auth_1_2.png`
            }
        },
        {
            text: "4) Отсканировать **QR-код** приложением **Telegram**",
            image: {
                width: "454px",
                path: `${__dirname}/../../../resources/images/auth/auth_qr/auth_1_3.png`
            }
        }
    ],
    phone_content: [
        {
            text: "1) Нажать кнопку: **По номеру**",
            image: {
                width: "404px",
                path: `${__dirname}/../../../resources/images/auth/auth_phone/auth_2.png`
            }
        },
        {
            text: "2) Ввести в поле: **Номер телефона** номер от учетной записи",
        },
        {
            text: "3) Нажать кнопку: **Запросить код**",
            image: {
                width: "401px",
                path: `${__dirname}/../../../resources/images/auth/auth_phone/auth_2_1.png`
            }
        },
        {
            text: "4) Ввести в поле: **Проверочный код** 5-ти значный код, который должен прийти в **Telegram**",
        },
        {
            text: "5) Нажать кнопку: **Отправить код**",
            image: {
                width: "443px",
                path: `${__dirname}/../../../resources/images/auth/auth_phone/auth_2_2.png`
            }
        },
        {
            text: "6) Ввести пороль **двуэтапной вторизации** в поле: **Пароль**",
        },
        {
            text: "7) Нажать кнопку: **Авторизоваться**",
            image: {
                width: "433px",
                path: `${__dirname}/../../../resources/images/auth/auth_phone/auth_2_3.png`
            }
        }
    ],
    create_chat_content: [
        {
            text: "1) Выбрать **список пользователей**",
            image: {
                width: "-webkit-fill-available",
                path: `${__dirname}/../../../resources/images/create_chat/1.png`
            }
        },
        {
            text: "**Дождаться появления уведомления**",
            image: {
                width: "292px",
                path: `${__dirname}/../../../resources/images/create_chat/1_2.png`
            }
        },
        {
            text: "2) Заполнить поле: **Номер инцидента**",
            image: {
                width: "-webkit-fill-available",
                path: `${__dirname}/../../../resources/images/create_chat/2.png`
            }
        },
        {
            text: "3) Заполнить поле: **Описание инцидента**",
            image: {
                width: "-webkit-fill-available",
                path: `${__dirname}/../../../resources/images/create_chat/3.png`
            }
        },
        {
            text: "4) Заполнить поле: **Закрепленное сообщение** при необходимости",
            image: {
                width: "-webkit-fill-available",
                path: `${__dirname}/../../../resources/images/create_chat/4.png`
            }
        },
        {
            text: "5) Нажать кнопку: **Создать чат**",
            image: {
                width: "137px",
                path: `${__dirname}/../../../resources/images/create_chat/5.png`
            }
        },
        {
            text: "6) Дождаться заполнения **прогресс бара** и появления сообщения: **Чат успешно создан!**",
            image: {
                width: "-webkit-fill-available",
                path: `${__dirname}/../../../resources/images/create_chat/6.png`
            }
        },
        {
            text: "7) Нажать кнопку: **Закрыть** и проверить создание чата в **Telegram**",
        }
    ]
}

class Data {
    #data = []

    constructor(data = []) {
        this.#data = data
    }

    parse() {
        let contents = []
        for (let block of this.#data) {
            let text = block.text;
            let image = block.image;
            if (text !== undefined) contents.push(new Label({
                markdownText: text,
                wordBreak: "break-word",
                width: "-webkit-fill-available"
            }))
            if (image !== undefined) contents.push(new Image({path: block.image.path, width: block.image.width}))
        }
        return contents;
    }
}
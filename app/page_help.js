const {Image, Styles, Dialog, ContentBlock, Label, Button, TreeView} = require("chuijs");

class AuthHelpDialog {
    #dialog = new Dialog({ width: "95%", height: "95%", closeOutSideClick: false })
    #header_dialog = new ContentBlock({ direction: Styles.DIRECTION.ROW, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.SPACE_BEETWEEN });
    #content = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER });
    constructor() {
        this.#content.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#content.setHeight(Styles.WIDTH.MAX_CONTENT)
        this.#content.add(AuthHelpDialog.#tree())
        this.#content.disableMarginChild()
        //
        this.#header_dialog.add(new Label("Авторизация"), new Button("Закрыть", () => this.#dialog.close()))
        this.#header_dialog.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#header_dialog.disableMarginChild()
        this.#header_dialog.setPadding("0px 0px 0px 10px");
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(this.#content)
        return this.#dialog;
    }
    open() { this.#dialog.open() }
    static #tree() {
        return new TreeView({
            width: Styles.WIDTH.WEBKIT_FILL,
            components: [
                TreeView.ExpandButton({
                    title: "Авторизация по QR-коду",
                    components: [
                        new Label("1) Нажать кнопку: **Авторизоваться по QR-коду**"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_qr/1_auth.png`, width: "-webkit-fill-available" }),
                        new Label("2) Ввести пороль **двуэтапной вторизации** (1)"),
                        new Label("3) Нажать кнопку: **Сгенерировать QR-код** (2)"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_qr/auth_1_2.png`, width: "-webkit-fill-available" }),
                        new Label("3) Отсканировать **QR-код** приложением **Telegram** (3)"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_qr/auth_1_3.png`, width: "-webkit-fill-available" }),
                    ]
                }),
                TreeView.ExpandButton({
                    title: "Авторизация по телефону",
                    components: [
                        new Label("1) Нажать кнопку: **Авторизация по телефону**"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_phone/auth_2.png`, width: "-webkit-fill-available" }),
                        new Label("2) Ввести в поле: **Телефон** номер телефона от учетной записи (1)"),
                        new Label("3) Нажать кнопку: **Отправить** (2)"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_phone/auth_2_1.png`, width: "-webkit-fill-available" }),
                        new Label("4) Ввести в поле: **Проверочный код** 5-ти значный код, который должен прийти в **Telegram** (3)", { wordBreak: "break-all", width: Styles.WIDTH.WEBKIT_FILL }),
                        new Label("5) Нажать кнопку: **Отправить** (4)"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_phone/auth_2_2.png`, width: "-webkit-fill-available" }),
                        new Label("6) Ввести пороль **двуэтапной вторизации** (5)"),
                        new Label("7) Нажать кнопку: **Авторизоваться** (6)"),
                        new Image({ path: `${__dirname}/../resources/images/auth/auth_phone/auth_2_3.png`, width: "-webkit-fill-available" }),
                    ]
                }),
            ]
        });
    }
}
exports.AuthHelpDialog = AuthHelpDialog

class CreateHelpDialog {
    #dialog = new Dialog({ width: "95%", height: "95%", closeOutSideClick: false })
    #header_dialog = new ContentBlock({ direction: Styles.DIRECTION.ROW, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.SPACE_BEETWEEN });
    #content = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER });
    constructor() {
        this.#content.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#content.setHeight(Styles.WIDTH.MAX_CONTENT)
        this.#content.add(
            new Label("1) Выбрать **список пользователей**"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/1.png`, width: "-webkit-fill-available" }),
            new Label("**Дождаться появления уведомления**"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/1_2.png`, }),
            new Label("2) Заполнить поле: **Номер инцидента**"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/2.png`, width: "-webkit-fill-available" }),
            new Label("3) Заполнить поле: **Описание инцидента**"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/3.png`, width: "-webkit-fill-available" }),
            new Label("4) Заполнить поле: **Закрепленное сообщение** при необходимости"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/4.png`, width: "-webkit-fill-available" }),
            new Label("5) Нажать кнопку: **Создать чат**"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/5.png`, }),
            new Label("6) Дождаться заполнения **прогресс бара** и появления сообщения: **Чат успешно создан!**"),
            new Image({ path: `${__dirname}/../resources/images/create_chat/6.png`, width: "-webkit-fill-available" }),
            new Label("7) Нажать кнопку: **Закрыть** и проверить создание чата в **Telegram**"),
        )
        this.#header_dialog.add(new Label("Создание чата"), new Button("Закрыть", () => this.#dialog.close()))
        this.#header_dialog.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#header_dialog.disableMarginChild();
        this.#header_dialog.setPadding("0px 0px 0px 10px");
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(this.#content)
        return this.#dialog;
    }
    open() { this.#dialog.open() }
}
exports.CreateHelpDialog = CreateHelpDialog
const {Image, Styles, Dialog, ContentBlock, Label, Button, H} = require("chuijs");

class AuthHelpDialog {
    #dialog = new Dialog({ width: "95.25%", height: "92.5%", closeOutSideClick: false })
    #header_dialog = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.SPACE_BEETWEEN)
    constructor() {
        let content = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.START, Styles.JUSTIFY.CENTER)
        content.setWidth(Styles.WIDTH.WEBKIT_FILL)
        content.setHeight(Styles.WIDTH.MAX_CONTENT)
        //
        this.#header_dialog.add(new Label("Авторизация"), new Button("Закрыть", () => this.#dialog.close()))
        this.#header_dialog.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(content)
        return this.#dialog;
    }
}
exports.AuthHelpDialog = AuthHelpDialog

class CreateHelpDialog {
    #dialog = new Dialog({ width: "95.25%", height: "92.5%", closeOutSideClick: false })
    #header_dialog = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.SPACE_BEETWEEN)
    constructor() {
        let content = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.START, Styles.JUSTIFY.CENTER)
        content.setWidth(Styles.WIDTH.WEBKIT_FILL)
        content.setHeight(Styles.WIDTH.MAX_CONTENT)
        content.add(
            new H(4, "1) Выбрать список пользователей"),
            new Image({ path: `${__dirname}/../resources/images/1.png`, width: "95%" }),
            new H(4, "Дождаться появления уведомления"),
            new Image({ path: `${__dirname}/../resources/images/1_2.png`, }),
            new H(4, "2) Заполнить поле 'Номер инцидента'"),
            new Image({ path: `${__dirname}/../resources/images/2.png`, width: "95%" }),
            new H(4, "3) Заполнить поле 'Описание инцидента'"),
            new Image({ path: `${__dirname}/../resources/images/3.png`, width: "95%" }),
            new H(4, "4) Заполнить поле 'Закрепленное сообщение' при необходимости"),
            new Image({ path: `${__dirname}/../resources/images/4.png`, width: "95%" }),
            new H(4, "5) Нажать кнопку 'Создать чат'"),
            new Image({ path: `${__dirname}/../resources/images/5.png`, })
        )
        this.#header_dialog.add(new Label("Создание чата"), new Button("Закрыть", () => this.#dialog.close()))
        this.#header_dialog.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(content)
        return this.#dialog;
    }
    open() { this.#dialog.open() }
}
exports.CreateHelpDialog = CreateHelpDialog
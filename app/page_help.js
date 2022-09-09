const {Paragraph, Image, Styles, Dialog, ContentBlock, SlideShow, Slide, Label, Button} = require("chuijs");

class AuthHelpDialog {
    #dialog = new Dialog({ width: "80%", height: "80%", closeOutSideClick: true })
    constructor() { return this.#dialog }
    open() { this.#dialog.open() }
}
exports.AuthHelpDialog = AuthHelpDialog

class CreateHelpDialog {
    #dialog = new Dialog({ width: "80%", height: "80%", closeOutSideClick: true })
    #header_dialog = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER)
    #footer_dialog = new ContentBlock(Styles.DIRECTION.ROW, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER)
    constructor() {
        let slideshow = new SlideShow({
            // Опции
            width: Styles.WIDTH.WEBKIT_FILL,
            height: Styles.WIDTH.WEBKIT_FILL,
            autoplay: false,
            interval: 5,
            slides: [
                new SlidePage(
                    new Paragraph("1) Выбрать список пользователей"),
                    new Image({
                        path: `${__dirname}/../resources/images/1.png`,
                        width: "95%"
                    }),
                    new Paragraph("Дождаться появления уведомления"),
                    new Image({
                        path: `${__dirname}/../resources/images/1_2.png`,
                    }),
                ),
                new SlidePage(
                    new Paragraph("2) Заполнить поле 'Номер инцидента'"),
                    new Image({
                        path: `${__dirname}/../resources/images/2.png`,
                        width: "95%"
                    }),
                ),
                new SlidePage(
                    new Paragraph("3) Заполнить поле 'Описание инцидента'"),
                    new Image({
                        path: `${__dirname}/../resources/images/3.png`,
                        width: "95%"
                    }),
                ),
                new SlidePage(
                    new Paragraph("4) Заполнить поле 'Закрепленное сообщение' при необходимости"),
                    new Image({
                        path: `${__dirname}/../resources/images/4.png`,
                        width: "95%"
                    }),
                ),
                new SlidePage(
                    new Paragraph("5) Нажать кнопку 'Создать чат'"),
                    new Image({
                        path: `${__dirname}/../resources/images/5.png`,
                    })
                ),
            ]
        });
        this.#header_dialog.add(new Label("Создание чата"))
        this.#header_dialog.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#dialog.addToHeader(this.#header_dialog)
        this.#dialog.addToBody(slideshow)
        this.#footer_dialog.add(new Button("Закрыть", () => {
            this.#dialog.close()
        }))
        this.#footer_dialog.setWidth(Styles.WIDTH.WEBKIT_FILL)
        this.#dialog.addToFooter(this.#footer_dialog)
        return this.#dialog;
    }
    open() { this.#dialog.open() }
}
exports.CreateHelpDialog = CreateHelpDialog

class SlidePage {
    constructor(...components) {
        let content = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER)
        content.setWidth(Styles.WIDTH.WEBKIT_FILL)
        content.setHeight(Styles.WIDTH.WEBKIT_FILL)
        content.add(...components)
        let slide = new Slide({ width: Styles.WIDTH.WEBKIT_FILL, height: Styles.WIDTH.WEBKIT_FILL })
        slide.add(content)
        return slide
    }
}
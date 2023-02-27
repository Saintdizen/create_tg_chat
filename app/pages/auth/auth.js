const {ContentBlock, Styles, Button, Icons, Label, Page, Route} = require("chuijs");
const {AuthPhone} = require("./auth_phone");
const {AuthQRCode} = require("./auth_qr_code");
const {AuthHelpDialog} = require("../../src/dialogs/dialogs");

class AuthMain extends Page {
    #help_auth_dialog = new AuthHelpDialog();
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });

    constructor(mainPage) {
        super();
        this.setTitle('Авторизация');
        this.setMain(true);
        this.setFullHeight()
        this.setFullWidth()
        this.add(this.#help_auth_dialog)
        this.add(this.#block_main)
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
                clickEvent: () => new Route().go(new AuthQRCode(this, mainPage))
            }),
            new Button({
                title: "По номеру",
                icon: Icons.COMMUNICATION.PHONE,
                clickEvent: () => new Route().go(new AuthPhone(this, mainPage))
            }),
            new Button({
                title: "Помощь",
                icon: Icons.COMMUNICATION.LIVE_HELP,
                clickEvent: () => this.#help_auth_dialog.open()
            })
        );
    }
}

exports.AuthMain = AuthMain
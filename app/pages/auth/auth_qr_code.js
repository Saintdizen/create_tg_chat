const {
    ContentBlock,
    Styles,
    ipcRenderer,
    PasswordInput,
    Button,
    Image,
    Notification,
    Icons,
    Page,
    Route
} = require("chuijs");
const QRCode = require("qrcode");

class AuthQRCode extends Page {
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
    #input_pass = new PasswordInput({title: "Пароль", width: "225px"});
    #generate = new Button({title: "Сгенерировать", icon: Icons.COMMUNICATION.QR_CODE})

    constructor(back, mainPage) {
        super();
        this.setTitle('Авторизация по QR коду');
        this.setMain(false);
        this.setFullHeight();
        this.setFullWidth();
        this.#main.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#main.setHeight(Styles.SIZE.WEBKIT_FILL)
        this.#QRCode_block.setWidth("-webkit-fill-available")
        this.#main.add(this.#back)
        this.#main.add(this.#input_pass, this.#generate)
        this.#main.add(this.#QRCode_block)
        this.#back.addClickListener(() => new Route().go(back))
        this.#generate.addClickListener(() => {
            this.#back.setDisabled(true);
            this.#input_pass.setDisabled(true);
            this.#generate.setDisabled(true);
            ipcRenderer.send('getTokenForQRCode', this.#input_pass.getValue())
            ipcRenderer.on('generatedTokenForQRCode', (e, text) => {
                QRCode.toDataURL(text).then(src => {
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
        this.add(this.#main);
        ipcRenderer.on("loginInQRCode", () => {
            new Route().go(mainPage)
        })
    }
}

exports.AuthQRCode = AuthQRCode
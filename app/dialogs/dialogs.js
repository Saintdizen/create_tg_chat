const {Image, Styles, Dialog, ContentBlock, Label, Button, TreeView, ProgressBar, shell, ipcRenderer, Icons} = require("chuijs");

class AuthHelpDialog {
    #dialog = new Dialog({ width: "85%", height: "85%", closeOutSideClick: false })
    #header_dialog = new ContentBlock({ direction: Styles.DIRECTION.ROW, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.SPACE_BEETWEEN });
    #content = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER });
    constructor() {
        this.#content.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#content.setHeight(Styles.SIZE.MAX_CONTENT)
        this.#content.add(AuthHelpDialog.#tree())
        this.#content.disableMarginChild()
        //
        this.#header_dialog.add(new Label({ markdownText: "**Авторизация**" }), new Button({
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
    open() { this.#dialog.open() }
    static #tree() {
        return new TreeView({
            width: Styles.SIZE.WEBKIT_FILL,
            components: [
                TreeView.ExpandButton({
                    title: "По QR-коду",
                    components: [
                        new Label({ markdownText: "1) Нажать кнопку: **По QR-коду**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_qr/1_auth.png`, width: "333px" }),
                        new Label({ markdownText: "2) Ввести пороль **двуэтапной вторизации**" }),
                        new Label({ markdownText: "3) Нажать кнопку: **Сгенерировать**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_qr/auth_1_2.png`, width: "333px" }),
                        new Label({ markdownText: "3) Отсканировать **QR-код** приложением **Telegram**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_qr/auth_1_3.png`, width: "333px" }),
                    ]
                }),
                TreeView.ExpandButton({
                    title: "По номеру телефона",
                    components: [
                        new Label({ markdownText: "1) Нажать кнопку: **По номеру**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_phone/auth_2.png`, width: "333px" }),
                        new Label({ markdownText: "2) Ввести в поле: **Номер телефона** номер от учетной записи" }),
                        new Label({ markdownText: "3) Нажать кнопку: **Запросить код**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_phone/auth_2_1.png`, width: "333px" }),
                        new Label({ markdownText: "4) Ввести в поле: **Проверочный код** 5-ти значный код, который должен прийти в **Telegram**", wordBreak: "break-all", width: Styles.SIZE.WEBKIT_FILL }),
                        new Label({ markdownText: "5) Нажать кнопку: **Отправить код**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_phone/auth_2_2.png`, width: "333px" }),
                        new Label({ markdownText: "6) Ввести пороль **двуэтапной вторизации** в поле: **Пароль**" }),
                        new Label({ markdownText: "7) Нажать кнопку: **Авторизоваться**" }),
                        new Image({ path: `${__dirname}/../../resources/images/auth/auth_phone/auth_2_3.png`, width: "333px" }),
                    ]
                }),
            ]
        });
    }
}
exports.AuthHelpDialog = AuthHelpDialog

class CreateHelpDialog {
    #dialog = new Dialog({ width: "85%", height: "85%", closeOutSideClick: false })
    #header_dialog = new ContentBlock({ direction: Styles.DIRECTION.ROW, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.SPACE_BEETWEEN });
    #content = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER });
    constructor() {
        this.#content.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#content.setHeight(Styles.SIZE.MAX_CONTENT)
        this.#content.add(
            new Label({ markdownText: "1) Выбрать **список пользователей**" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/1.png`, width: "-webkit-fill-available" }),
            new Label({ markdownText: "**Дождаться появления уведомления**" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/1_2.png`, }),
            new Label({ markdownText: "2) Заполнить поле: **Номер инцидента**" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/2.png`, width: "-webkit-fill-available" }),
            new Label({ markdownText: "3) Заполнить поле: **Описание инцидента**" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/3.png`, width: "-webkit-fill-available" }),
            new Label({ markdownText: "4) Заполнить поле: **Закрепленное сообщение** при необходимости" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/4.png`, width: "-webkit-fill-available" }),
            new Label({ markdownText: "5) Нажать кнопку: **Создать чат**" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/5.png`, }),
            new Label({ markdownText: "6) Дождаться заполнения **прогресс бара** и появления сообщения: **Чат успешно создан!**" }),
            new Image({ path: `${__dirname}/../../resources/images/create_chat/6.png`, width: "-webkit-fill-available" }),
            new Label({ markdownText: "7) Нажать кнопку: **Закрыть** и проверить создание чата в **Telegram**" }),
        )
        this.#header_dialog.add(new Label({ markdownText: "**Создание чата**" }), new Button({
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
    open() { this.#dialog.open() }
}
exports.CreateHelpDialog = CreateHelpDialog

class UpdateApp {
    #content = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER });
    #desc = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER });
    #control = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER });
    constructor(options = {
        title: String(undefined),
        name: String(undefined),
        link: String(undefined),
        version: String(undefined),
        platform: String(undefined)
    }) {
        //
        let updates_path = require('path').join(require('os').homedir(), "updates_create_tg_chat");
        //
        this.#content.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#content.setHeight(Styles.SIZE.MAX_CONTENT);
        this.#desc.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#control.setWidth(Styles.SIZE.WEBKIT_FILL);
        //
        let progress = new ProgressBar({
            max: 100
        });
        progress.setWidth(Styles.SIZE.WEBKIT_FILL);
        progress.setProgressText(`Загрузка: ${options.name}`)
        progress.setProgressCountText(`0%`)
        //
        let button = new Button('Начать загрузку', async () => {
            this.#control.remove(button);
            progress.setProgressText(`Загрузка ${options.name}`)
            const Downloader = require("nodejs-file-downloader");
            const downloader = new Downloader({
                url: options.link,
                fileName: options.name,
                directory: updates_path,
                onProgress: (percentage, chunk, remainingSize) => {
                    //let test = `(${remainingSize.toString()})`;
                    progress.setProgressCountText(`${percentage}%`)
                    progress.setValue(Number(percentage))
                },
            });
            try {
                await downloader.download();
                await shell.openExternal(`file://${updates_path}`, {
                    workingDirectory: updates_path
                })
                let button = new Button({
                    title: "Закрыть приложение",
                    clickEvent: () => ipcRenderer.send("closeForUpdate")
                })
                this.#control.add(button)
            } catch (error) {
                console.log(error);
            }
        })
        //
        this.#desc.add(
            new Label({ text: `Версия: ${options.version}_${options.platform}` }),
            new Label({ text: `Директория: ${require('path').join(updates_path)}`, wordBreak: "break-all" })
        )
        this.#control.add(progress, button);
        this.#content.add(this.#desc, this.#control);
        return this.#content;
    }
}
exports.UpdateApp = UpdateApp
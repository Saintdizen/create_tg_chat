const {
    Page,
    ContentBlock,
    Styles,
    Label,
    TextInput,
    Icons,
    Button,
    CheckBox,
    Dialog,
    ProgressBar,
    Spinner, Notification
} = require('chuijs');
const {GoogleSheets, GoogleDrive} = require("../../src/google_sheets/google_sheets");
let googleSheets_DB = new GoogleSheets('1b8MDk9NSk_DAor58VDLClwYzFXfLrwB5koCb2Krr5V8', "Настройки авторизации");
let google_api = new GoogleDrive()

class TestPage extends Page {
    #folders = []
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #block_lists = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.START,
        justify: Styles.JUSTIFY.CENTER
    });

    #block_add = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.START
    });
    #block_del = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.START
    });

    //
    #email_person = new TextInput({
        name: 'email_person',
        title: "Электронная почта",
        placeholder: "email@example.com",
        width: "400px"
    });

    // Добавление
    #add_person = new Label({
        id: "add_person",
        markdownText: "**Добавление пользователя**",
        textAlign: "center",
        wordBreak: "break-word",
        width: "-webkit-fill-available"
    })
    #button_add_person = new Button({
        title: "Добавить",
        icon: Icons.CONTENT.ADD,
        reverse: true
    });

    // Удаление
    #del_person = new Label({
        id: "del_person",
        markdownText: "**Удаление пользователя**",
        textAlign: "center",
        wordBreak: "break-word",
        width: "-webkit-fill-available"
    })
    #button_del_person = new Button({
        title: "Удалить",
        icon: Icons.CONTENT.REMOVE,
        reverse: true
    });

    constructor() {
        super();
        this.setTitle('Права доступа к документам');
        this.setMain(false);
        this.setFullWidth();
        this.setFullHeight();

        this.#block_add.setWidth(Styles.SIZE.MAX_CONTENT);
        this.#block_add.setHeight(Styles.SIZE.MAX_CONTENT);
        this.#block_add.add(this.#add_person, this.#block_lists, this.#button_add_person)

        this.#block_del.setWidth(Styles.SIZE.MAX_CONTENT);
        this.#block_del.setHeight(Styles.SIZE.MAX_CONTENT);
        this.#block_del.add(this.#del_person, this.#button_del_person)

        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.add(this.#email_person, this.#block_add, this.#block_del);

        this.add(this.#block_main)

        // Эвент добавления
        this.#button_add_person.addClickListener(async () => {
            if (this.#email_person.getValue() === "") {
                new Notification({
                    title: "Добавление пользователя",
                    text: "Поле 'Электронная почта' не заполнено",
                    style: Notification.STYLE.ERROR,
                    showTime: 3000
                }).show()
            } else {
                let dialog_progress = new Dialog({
                    width: "500px",
                    height: Styles.SIZE.MAX_CONTENT,
                    closeOutSideClick: false
                });

                let progress = new ProgressBar({max: this.#folders.length})
                progress.setWidth(Styles.SIZE.WEBKIT_FILL)
                progress.setProgressCountText(`Добавление пользователя: ${this.#email_person.getValue()}`)
                progress.setProgressText("ID: ")

                dialog_progress.addToBody(progress)
                this.add(dialog_progress)

                dialog_progress.open()
                for (let folder of this.#folders) {
                    progress.setProgressText(`ID: ${folder}`)
                    progress.setValue(this.#folders.indexOf(folder) + 1)

                    try {
                        await google_api.setPermissionsToFile(folder, this.#email_person.getValue())
                    } catch (e) {
                        console.log(e)
                    }

                    if (this.#folders.length - 1 === this.#folders.indexOf(folder)) {
                        await this.sleep(1000)
                        dialog_progress.close()
                    }
                }
            }
        })

        // Эвент удаления
        this.#button_del_person.addClickListener(async () => {
            let files = await this.getFoldersList()
            if (this.#email_person.getValue() === "") {
                new Notification({
                    title: "Удаление пользователя",
                    text: "Поле 'Электронная почта' не заполнено",
                    style: Notification.STYLE.ERROR,
                    showTime: 3000
                }).show()
            } else {
                let dialog_progress = new Dialog({
                    width: "500px",
                    height: Styles.SIZE.MAX_CONTENT,
                    closeOutSideClick: false
                });

                let progress = new ProgressBar({max: files.length})
                progress.setWidth(Styles.SIZE.WEBKIT_FILL)
                progress.setProgressCountText(`Удаление пользователя: ${this.#email_person.getValue()}`)
                progress.setProgressText("ID: ")

                dialog_progress.addToBody(progress)
                this.add(dialog_progress)

                dialog_progress.open()
                for (let folder of files) {
                    progress.setProgressText(`ID: ${folder}`)
                    progress.setValue(files.indexOf(folder) + 1)

                    let data = await google_api.getPermissionsList(folder)
                    for (let test of data) {
                        if (test.emailAddress.toLowerCase() === this.#email_person.getValue().toLowerCase()) {
                            try {
                                let test_data = await google_api.getDeleteShare(folder, test.id)
                                console.log(test_data)
                            } catch (e) {
                                console.log(e)
                            }
                        }
                    }

                    if (files.length - 1 === files.indexOf(folder)) {
                        await this.sleep(1000)
                        dialog_progress.close()
                    }
                }
            }
        })

        setTimeout(async () => {
            await this.renderBlockList(await this.getFoldersList())
        }, 1000)

    }

    async getFoldersList() {
        let folders = []
        let report_list = await googleSheets_DB.read(`REPORTS!A1:D`);
        for (let report of report_list) if (report_list.indexOf(report) !== 0) folders.push(report[2])
        return Array.from(new Set(folders))
    }

    async renderBlockList(foldersList = []) {
        let spinner = new Spinner(Spinner.SIZE.V_SMALL, 'auto');
        let main_block = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN,
            wrap: Styles.WRAP.NOWRAP,
            align: Styles.ALIGN.START,
            justify: Styles.JUSTIFY.CENTER
        });

        for (let folder of foldersList) {
            let info = await google_api.getFileInfo(folder)
            let checkBox = new CheckBox({
                name: info.id,
                title: info.name,
            });
            main_block.add(checkBox)
            this.#block_lists.add(main_block, spinner)

            checkBox.addChangeListener((e) => {
                if (e.target.checked) {
                    this.#folders.push(checkBox.getName())
                } else {
                    let index = this.#folders.indexOf(checkBox.getName())
                    if (index > -1) {
                        this.#folders.splice(index, 1)
                    }
                }
            })

            if (foldersList.length - 1 === foldersList.indexOf(folder)) {
                this.#block_lists.remove(spinner)
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

exports.TestPage = TestPage
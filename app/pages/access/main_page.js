const {Page, ContentBlock, Styles, Label, TextInput, Icons, Button} = require('chuijs');
const {GoogleSheets} = require("../../src/google_sheets/google_sheets");
let googleSheets_DB = new GoogleSheets('19DiXisY4-5eZeK_TinD9HbJAgQgM3jtV0xGRcxPhTo8', "Настройки авторизации");

class TestPage extends Page {
    #folders = []
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });

    // Добавление
    #add_person = new Label({
        id: "add_person",
        markdownText: "**Добавление пользователя**",
        textAlign: "center",
        wordBreak: "break-word",
        width: "-webkit-fill-available"
    })
    #email_add_person = new TextInput({
        name: 'email_add_person',
        title: "Электронная почта",
        placeholder: "email@example.com",
        width: "400px"
    });
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
    #email_del_person = new TextInput({
        name: 'email_del_person',
        title: "Электронная почта",
        placeholder: "email@example.com",
        width: "400px"
    });
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

        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.add(
            this.#add_person,
            this.#email_add_person,
            this.#button_add_person,
            this.#del_person,
            this.#email_del_person,
            this.#button_del_person
        );
        this.add(this.#block_main)

        // Эвент добавления
        this.#button_add_person.setDisabled(true)
        this.#button_add_person.addClickListener(async () => {
            let list = await this.getFoldersList();
            console.log(list)
        })

        // Эвент добавления
        this.#button_del_person.addClickListener(async () => {
            let list = await this.getFoldersList();
            console.log(list)
        })

    }
    async getFoldersList() {
        let folders = []
        let report_list = await googleSheets_DB.read(`REPORTS!A1:D`);

        for (let report of report_list) {
            if (report_list.indexOf(report) !== 0) {
                folders.push(report[2])
            }
        }

        return Array.from(new Set(folders))
    }
    async loadFoldersList() {

    }
}

exports.TestPage = TestPage
const {
    Page, Button, Label, fs, store,
    shell, App, path, TextInput, Route, ipcRenderer, Badge, Log, ContentBlock, Styles
} = require('chuijs');
const {SettingsStoreMarks} = require("../settings/settings_store_marks");
const {AuthMain} = require("./auth/auth");
//
const {Tables} = require('../src/google_sheets/tables');

class SettingsGoogleCheckPage extends Page {
    #b_open_path = new Button({title: "Открыть папку"})
    #i1 = new TextInput({title: 'Идентификатор таблицы: "Группы пользователей"', placeholder: 'Номер инцидента', width: '400px'});
    #i2 = new TextInput({title: 'Идентификатор таблицы: "Настройки авторизации"', placeholder: 'Номер инцидента', width: '400px'});
    #b_save = new Button({title: "Сохранить"})
    #path_folder = path.join(App.userDataPath(), "google")
    #path_key = path.join(this.#path_folder, "credentials.json")
    //
    #p1 = undefined;
    constructor(MainPage) {
        super();
        //
        this.#p1 = MainPage;
        // Настройки страницы
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        this.setFullWidth();
        this.setFullHeight();
        // ===
        //  СОЗДАНИЕ ПАПОК
        if (!fs.existsSync(this.#path_folder)) fs.mkdirSync(this.#path_folder);
        // ===
        let key = store.get(SettingsStoreMarks.SETTINGS.google.json_key_path) === undefined
        let t1 = store.get(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id) === undefined
        let t2 = store.get(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id) === undefined

        if (key && t1 && t2) {
            let label = new Label({markdownText: "НЕТ КЛЮЧА И ТАБЛИЦ"})
            this.add(label)
            this.add(this.#b_open_path, this.#i1, this.#i2, this.#b_save)
        } else {
            setTimeout(async () => {
                let status_1 = await this.checkTable(new Tables().tableUsersGroups());
                let status_2 = await this.checkTable(new Tables().tableAuthSettings());
                if (status_1.status && status_2.status) {
                    await this.checkAuth();
                }
            }, 200)
        }

        this.#b_open_path.addClickListener(async () => await shell.openPath(this.#path_folder))
        this.#b_save.addClickListener(async () => {
            store.set(SettingsStoreMarks.SETTINGS.google.json_key_path, this.#path_key)
            store.set(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id, this.#i1.getValue())
            store.set(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id, this.#i2.getValue())
        })
    }

    addBlock(text) {
        let block = new ContentBlock({
            direction: Styles.DIRECTION.ROW, wrap: Styles.WRAP.WRAP,
            align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER
        });
        block.setWidth(Styles.SIZE.WEBKIT_FILL);
        block.add(new Label({
            markdownText: text, wordBreak: Styles.WORD_BREAK.BREAK_ALL
        }))
        return block;
    }

    async checkTable(table) {
        let block = this.addBlock(`Проверка таблицы **${table.getName()}**`);
        this.add(block)
        //
        let status = await table.getStatus()
        if (status.status) {
            block.add(new Badge({text: "Успешно", style: Badge.STYLE.SUCCESS}))
        } else {
            block.add(new Badge({text: "Ошибка", style: Badge.STYLE.ERROR}))
            Log.error(status)
        }
        return status;
    }

    checkAuth() {
        ipcRenderer.send("getUser")
        ipcRenderer.on('sendAuthStatus', async (e, status) => {
            if (status) {
                setTimeout(() => new Route().go(this.#p1), 200)
            } else {
                setTimeout(() => new Route().go(new AuthMain(this.#p1)), 200)
            }
        })
    }
}

exports.SettingsGoogleCheckPage = SettingsGoogleCheckPage
const {
    Page, Button, Styles, Label, fs, store,
    shell, App, path, TextInput, Route
} = require('chuijs');
const {SettingsStoreMarks} = require("../settings/settings_store_marks");
const {CreateChatTG} = require("./2_page");

class SettingsGoogleCheckPage extends Page {
    #b_open_path = new Button({title: "Открыть папку"})
    #i1 = new TextInput({title: 'Идентификатор таблицы: "Группы пользователей"', placeholder: 'Номер инцидента', width: '400px'});
    #i2 = new TextInput({title: 'Идентификатор таблицы: "Настройки авторизации"', placeholder: 'Номер инцидента', width: '400px'});
    #b_save = new Button({title: "Сохранить"})
    #path_folder = path.join(App.userDataPath(), "google")
    #path_key = path.join(this.#path_folder, "credentials.json")
    constructor() {
        super();
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
            new Route().go(new CreateChatTG())
        }

        this.#b_open_path.addClickListener(async () => await shell.openPath(this.#path_folder))
        this.#b_save.addClickListener(async () => {
            store.set(SettingsStoreMarks.SETTINGS.google.json_key_path, this.#path_key)
            store.set(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id, this.#i1.getValue())
            store.set(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id, this.#i2.getValue())
        })
    }
}

exports.SettingsGoogleCheckPage = SettingsGoogleCheckPage
const {
    Page, Button, Label, fs, store, shell, App, path, TextInput,
    Route, ipcRenderer, Badge, Log, ContentBlock, Styles
} = require('chuijs');
const {SettingsStoreMarks} = require("../settings/settings_store_marks");
const {AuthMain} = require("./auth/auth");
const {Tables} = require('../src/google_sheets/tables');

class SettingsGoogleCheckPage extends Page {
    #path_folder = path.join(App.userDataPath(), "google");
    #path_key = path.join(this.#path_folder, "credentials.json");
    #p1 = undefined;
    #main_block = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER
    });
    #b1 = undefined;
    #b2 = undefined;
    constructor(MainPage) {
        super();
        this.#p1 = MainPage;
        this.#main_block.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#main_block.setHeight(Styles.SIZE.WEBKIT_FILL);
        this.setTitle('Создание чата в Telegram');
        this.setMain(true);
        this.setFullWidth();
        this.setFullHeight();
        this.add(this.#main_block);
        if (!fs.existsSync(this.#path_folder)) fs.mkdirSync(this.#path_folder);
        let key = store.get(SettingsStoreMarks.SETTINGS.google.json_key_path) === undefined;
        let t1 = store.get(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id) === undefined;
        let t2 = store.get(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id) === undefined;
        this.#b1 = this.step1Block();
        this.#b2 = this.step2Block();
        if (key && t1 && t2) {
            this.#main_block.add(this.#b1);
        } else {
            setTimeout(async () => {
                let status_1 = await this.checkTable(new Tables().tableUsersGroups());
                let status_2 = await this.checkTable(new Tables().tableAuthSettings());
                if (status_1.status && status_2.status) await this.checkAuth();
            }, 200);
        }
    }

    step1Block() {
        let block1 = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
            align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER
        });
        let label1 = new Label({markdownText: "Не установлен ключ доступа к Google"});
        let label2 = new Label({markdownText: "Нажмите кнопку 'Открыть папку' и скопируйте ключ **credentials.json**"});
        block1.add(label1, label2);
        let b_open_path = new Button({title: "Открыть папку"});
        b_open_path.addClickListener(() => shell.openPath(this.#path_folder).then(r => Log.info(r)));
        block1.add(b_open_path);
        let int1 = setInterval(() => {
            if (fs.existsSync(this.#path_key)) {
                block1.remove(b_open_path);
                let b_next = new Button({title: "Далее"});
                block1.add(b_next);
                b_next.addClickListener(() => {
                    this.#main_block.remove(this.#b1);
                    this.#main_block.add(this.#b2);
                })
                clearInterval(int1);
            }
        }, 1);
        return block1;
    }

    step2Block() {
        let block2 = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
            align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER
        });
        let label1 = new Label({markdownText: "Установите ключи для доступа к таблицам"});
        block2.add(label1);
        let i1 = new TextInput({title: 'Идентификатор таблицы: "Группы пользователей"', placeholder: 'Номер инцидента', width: '400px'});
        let i2 = new TextInput({title: 'Идентификатор таблицы: "Настройки авторизации"', placeholder: 'Номер инцидента', width: '400px'});
        block2.add(i1, i2);
        let b_save = new Button({title: "Сохранить"});
        b_save.addClickListener(async () => {
            if (fs.existsSync(this.#path_key) && i1.getValue() !== "" && i2.getValue() !== "") {
                store.set(SettingsStoreMarks.SETTINGS.google.json_key_path, this.#path_key);
                store.set(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id, i1.getValue());
                store.set(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id, i2.getValue());
                let apps = App.get();
                apps.relaunch()
                apps.exit(0)
            }
            if (i1.getValue() === "") i1.setErrorMessage("Устанвите идентификатор таблицы");
            if (i2.getValue() === "") i2.setErrorMessage("Устанвите идентификатор таблицы");
        })
        block2.add(b_save);
        return block2;
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
        this.#main_block.add(block)
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
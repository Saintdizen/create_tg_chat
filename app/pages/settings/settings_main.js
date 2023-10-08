const {
    Page,
    ContentBlock,
    Styles,
    TextInput,
    PasswordInput,
    Button,
    Notification,
    CheckBox,
    TextArea,
    FieldSet,
    Icons,
    MenuBar,
    Route,
    store
} = require('chuijs');

//
const {SettingsStoreMarks} = require("../../settings/settings_store_marks");
//

class SettingsMain extends Page {
    #back_page = undefined;
    #menuBar = new MenuBar({test: true});
    constructor(page) {
        super();
        this.setTitle('Настройки');
        this.setMain(false);
        this.setMenuBar(this.#menuBar)
        this.#back_page = page;

        let back = new Button({
            title: "Назад",
            icon: Icons.NAVIGATION.ARROW_BACK,
            reverse: true,
            clickEvent: () => new Route().go(this.#back_page)
        })
        this.#menuBar.addMenuItems(back)

        this.setFullWidth();
        let mainBlock = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
            align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER
        })
        mainBlock.setWidth(Styles.SIZE.WEBKIT_FILL)
        mainBlock.add(this.settingAtlassianBlock())
        this.add(mainBlock)
    }

    settingAtlassianBlock() {
        return new FieldSet({
            title: "Настройки ATLASSIAN",
            style: {
                direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
                align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER,
                width: Styles.SIZE.WEBKIT_FILL
            },
            components: this.atlassianSettings()
        })
    }

    atlassianSettings() {
        // Настройки имени пользователя
        let atlassian_status_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.status);
        let atlassian_user_name_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.username);
        let atlassian_user_password_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.password);
        let activateAtlassian_check = new CheckBox({title: "Включить"})
        let atlassian_user_name = new TextInput({
            name: 'atlassian_user_name', title: "Имя пользователя", placeholder: "Имя пользователя",
            width: Styles.SIZE.WEBKIT_FILL, required: true
        });
        let atlassian_user_password = new PasswordInput({
            name: 'atlassian_user_password', title: "Пароль", placeholder: "Пароль",
            width: Styles.SIZE.WEBKIT_FILL, required: true
        });
        activateAtlassian_check.setValue(atlassian_status_store)
        if (atlassian_user_name_store !== undefined) atlassian_user_name.setValue(new Buffer(atlassian_user_name_store, "base64").toString("utf-8"));
        if (atlassian_user_password_store !== undefined) atlassian_user_password.setValue(new Buffer(atlassian_user_password_store, "base64").toString("utf-8"));
        let account = new FieldSet({
            title: "Аккаунт Atlassian",
            style: {
                direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
                align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER,
                width: Styles.SIZE.WEBKIT_FILL
            },
            components: [ atlassian_user_name, atlassian_user_password ]
        })
        // Настройка доменных имен
        let atlassian_jira_domain_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.jira.domain);
        let atlassian_wiki_domain_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.wiki.domain);
        let atlassian_jira_domain = new TextInput({
            name: 'atlassian_jira_domain_input', title: "Основной URL JIRA", placeholder: "https://example.ru",
            width: Styles.SIZE.WEBKIT_FILL, required: true
        });
        let atlassian_wiki_domain = new TextInput({
            name: 'atlassian_wiki_domain_input', title: "Основной URL WIKI", placeholder: "https://example.ru",
            width: Styles.SIZE.WEBKIT_FILL, required: true
        });
        if (atlassian_jira_domain_store !== undefined) atlassian_jira_domain.setValue(new Buffer(atlassian_jira_domain_store, "base64").toString("utf-8"));
        if (atlassian_wiki_domain_store !== undefined) atlassian_wiki_domain.setValue(new Buffer(atlassian_wiki_domain_store, "base64").toString("utf-8"));
        let domains = new FieldSet({
            title: "Общие настройки",
            style: {
                direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
                align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER,
                width: Styles.SIZE.WEBKIT_FILL
            },
            components: [ atlassian_jira_domain, atlassian_wiki_domain ]
        })
        // createTask
        let atlassian_jira_create_task_status_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.jira.create_task.status);
        let atlassian_jira_create_task_labels_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.jira.create_task.labels);
        let createTask_check = new CheckBox({title: "Включить"})
        let textArea = new TextArea({
            title: "Метки",
            placeholder: "Метки",
            width: Styles.SIZE.WEBKIT_FILL, height: "200px",
        })
        let createTask = new FieldSet({
            title: "Создание задачи",
            style: {
                direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
                align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER,
                width: Styles.SIZE.WEBKIT_FILL
            },
            components: [ createTask_check, textArea ]
        })
        createTask_check.setValue(atlassian_jira_create_task_status_store);
        if (atlassian_jira_create_task_labels_store !== undefined) textArea.setValue(atlassian_jira_create_task_labels_store.join("\n"));
        // createReport
        let atlassian_wiki_create_report_status_store = store.get(SettingsStoreMarks.SETTINGS.atlassian.wiki.create_report.status);
        let createReport_check = new CheckBox({title: "Включить"})
        let createReport = new FieldSet({
            title: "Создание отчета",
            style: {
                direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP,
                align: Styles.ALIGN.START, justify: Styles.JUSTIFY.CENTER,
                width: Styles.SIZE.WEBKIT_FILL
            },
            components: [ createReport_check ]
        })
        createReport_check.setValue(atlassian_wiki_create_report_status_store);
        //
        if (atlassian_status_store) {
            atlassian_user_name.setDisabled(false);
            atlassian_user_password.setDisabled(false);
            atlassian_jira_domain.setDisabled(false);
            atlassian_wiki_domain.setDisabled(false);
            createTask_check.setDisabled(false);
            textArea.setDisabled(false);
            createReport_check.setDisabled(false);
        } else {
            atlassian_user_name.setDisabled(true);
            atlassian_user_password.setDisabled(true);
            atlassian_jira_domain.setDisabled(true);
            atlassian_wiki_domain.setDisabled(true);
            createTask_check.setDisabled(true);
            textArea.setDisabled(true);
            createReport_check.setDisabled(true);
        }
        activateAtlassian_check.addChangeListener((e) => {
            if (e.target.checked) {
                atlassian_user_name.setDisabled(false);
                atlassian_user_password.setDisabled(false);
                atlassian_jira_domain.setDisabled(false);
                atlassian_wiki_domain.setDisabled(false);
                createTask_check.setDisabled(false);
                textArea.setDisabled(false);
                createReport_check.setDisabled(false);
            } else {
                atlassian_user_name.setDisabled(true);
                atlassian_user_password.setDisabled(true);
                atlassian_jira_domain.setDisabled(true);
                atlassian_wiki_domain.setDisabled(true);
                createTask_check.setDisabled(true);
                textArea.setDisabled(true);
                createReport_check.setDisabled(true);
            }
        })
        // Сохранение настроек
        let buttons_save_cancel = new ContentBlock({
            direction: Styles.DIRECTION.ROW, wrap: Styles.WRAP.NOWRAP,
            align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER
        })
        let b_cancel = new Button({
            title: "Отмена", clickEvent: () => new Route().go(this.#back_page)
        });
        let b_save = new Button({
            primary: true,
            title: "Сохранить", clickEvent: () => {
                try {
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.status, activateAtlassian_check.getValue())
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.username, new Buffer(atlassian_user_name.getValue()).toString("base64"))
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.password, new Buffer(atlassian_user_password.getValue()).toString("base64"))
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.jira.domain, new Buffer(atlassian_jira_domain.getValue()).toString("base64"))
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.wiki.domain, new Buffer(atlassian_wiki_domain.getValue()).toString("base64"))
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.jira.create_task.status, createTask_check.getValue())
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.jira.create_task.labels, textArea.getValue().split("\n"))
                    store.set(SettingsStoreMarks.SETTINGS.atlassian.wiki.create_report.status, createReport_check.getValue())
                    new Notification({
                        title: this.getTitle(),
                        text: "Настройки успешно сохранены!",
                        style: Notification.STYLE.SUCCESS,
                        showTime: 2000
                    }).show()
                } catch (e) {
                    new Notification({
                        title: this.getTitle(), text: e.message, style: Notification.STYLE.ERROR, showTime: 2000
                    }).show()
                }
            }
        });
        buttons_save_cancel.add(b_cancel, b_save)
        return [activateAtlassian_check, account, domains, createTask, createReport, buttons_save_cancel]
    }
}

exports.SettingsMain = SettingsMain
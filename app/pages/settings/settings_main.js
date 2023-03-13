'use strict';
const { Page, ContentBlock, Styles, TextInput, PasswordInput, Button, Notification, CheckBox, TextArea} = require('chuijs');

//
const Store = require('electron-store');
const store = new Store();
const {SettingsStoreMarks} = require("./settings_store_marks");
const marks = new SettingsStoreMarks();
//

class SettingsMain extends Page {
    constructor() {
        super();
        this.setTitle('Настройки');
        this.setMain(false);
        this.setFullWidth();
        this.setFullHeight();
        this.add(this.renderJiraBlock())
    }

    renderJiraBlock() {
        // Получение настроек
        let activate = store.get(marks.jira.activate);
        let domain = store.get(marks.jira.domain);
        let username = store.get(marks.jira.username);
        let password = store.get(marks.jira.password);
        let labels = store.get(marks.jira.labels);
        //

        let contentBlock = new ContentBlock({
            direction: Styles.DIRECTION.COLUMN,
            wrap: Styles.WRAP.NOWRAP,
            align: Styles.ALIGN.START,
            justify: Styles.JUSTIFY.CENTER
        })

        let activateJira = new CheckBox({ title: "Автоматическое создание задачи" })
        activateJira.setValue(activate)

        let jiraDomain = new TextInput({
            name: 'jiraDomain',
            title: "Домен JIRA",
            placeholder: "Домен JIRA",
            width: "400px",
            required: true
        });
        if (domain !== undefined) jiraDomain.setValue(domain);

        let jiraUsername = new TextInput({
            name: 'jiraUsername',
            title: "Имя пользователя",
            placeholder: "Имя пользователя",
            width: "400px",
            required: true
        });
        if (username !== undefined) jiraUsername.setValue(new Buffer(username, "base64").toString("utf-8"));

        let jiraPassword = new PasswordInput({
            name: 'jiraPassword',
            title: "Пароль",
            placeholder: "Пароль",
            width: "400px",
            required: true
        });
        if (password !== undefined) jiraPassword.setValue(new Buffer(password, "base64").toString("utf-8"));

        let jiraLabels = new TextArea({
            title: "Метки",
            placeholder: "Метки",
            width: "400px", height: "200px",
        })
        if (labels !== undefined) jiraLabels.setValue(labels.join("\n"));

        // Активация данных
        if (activate) {
            jiraDomain.setDisabled(false);
            jiraUsername.setDisabled(false);
            jiraPassword.setDisabled(false);
            jiraLabels.setDisabled(false);
        } else {
            jiraDomain.setDisabled(true);
            jiraUsername.setDisabled(true);
            jiraPassword.setDisabled(true);
            jiraLabels.setDisabled(true);
        }

        activateJira.addChangeListener((e) => {
            if (e.target.checked) {
                jiraDomain.setDisabled(false);
                jiraUsername.setDisabled(false);
                jiraPassword.setDisabled(false);
                jiraLabels.setDisabled(false);
            } else {
                jiraDomain.setDisabled(true);
                jiraUsername.setDisabled(true);
                jiraPassword.setDisabled(true);
                jiraLabels.setDisabled(true);
            }
        })

        let jiraSave = new Button({
            title: "Сохранить",
            clickEvent:  () => {
                try {
                    store.set(marks.jira.activate, activateJira.getValue())
                    store.set(marks.jira.domain, jiraDomain.getValue())
                    store.set(marks.jira.username, new Buffer(jiraUsername.getValue()).toString("base64"))
                    store.set(marks.jira.password, new Buffer(jiraPassword.getValue()).toString("base64"))
                    store.set(marks.jira.labels, jiraLabels.getValue().split("\n"))
                    new Notification({
                        title: this.getTitle(), text: "Настройки успешно сохранены!", style: Notification.STYLE.SUCCESS, showTime: 2000
                    }).show()
                } catch (e) {
                    new Notification({
                        title: this.getTitle(), text: e.message, style: Notification.STYLE.ERROR, showTime: 2000
                    }).show()
                }
            }
        });

        contentBlock.add(activateJira, jiraDomain, jiraUsername, jiraPassword, jiraLabels, jiraSave)
        return contentBlock;
    }
}

exports.SettingsMain = SettingsMain
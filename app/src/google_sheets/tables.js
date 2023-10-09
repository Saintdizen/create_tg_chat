const {store} = require('chuijs');
const {GoogleSheets} = require('./google_sheets');
const {SettingsStoreMarks} = require("../../settings/settings_store_marks");

class Tables {
    #users_groups_id = undefined;
    #auth_settings_id = undefined;
    constructor() {
        this.#users_groups_id = store.get(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id);
        this.#auth_settings_id = store.get(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id);
    }
    tableUsersGroups() {
        return new GoogleSheets(String(this.#users_groups_id), "Группы пользователей");
    }
    tableAuthSettings() {
        return new GoogleSheets(String(this.#auth_settings_id), "Настройки авторизации");
    }
}

exports.Tables = Tables
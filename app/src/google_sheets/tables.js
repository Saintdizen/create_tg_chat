const {store, log} = require('chuijs');
const {GoogleSheets} = require('./google_sheets');
const {SettingsStoreMarks} = require("../../settings/settings_store_marks");

class Tables {
    #json_key_path = undefined;
    #users_groups_id = undefined;
    #auth_settings_id = undefined;
    constructor() {
        this.#json_key_path = store.get(SettingsStoreMarks.SETTINGS.google.json_key_path);
        this.#users_groups_id = store.get(SettingsStoreMarks.SETTINGS.google.tables.users_groups_id);
        this.#auth_settings_id = store.get(SettingsStoreMarks.SETTINGS.google.tables.auth_settings_id);
    }
    tableUsersGroups() {
        try {
            return new GoogleSheets(this.#users_groups_id, "Группы пользователей", this.#json_key_path);
        } catch (e) {
            log.error(e)
            return null;
        }
    }
    tableAuthSettings() {
        try {
            return new GoogleSheets(this.#auth_settings_id, "Настройки авторизации", this.#json_key_path);
        } catch (e) {
            log.error(e)
            return null;
        }
    }
}

exports.Tables = Tables
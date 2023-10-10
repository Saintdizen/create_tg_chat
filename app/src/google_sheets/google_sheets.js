const {google} = require('googleapis');
const {Log, store, path} = require("chuijs")
const {SettingsStoreMarks} = require("../../settings/settings_store_marks");

class GoogleSheets {
    #name = undefined;
    #SHEET_ID = undefined;
    #auth = undefined;

    constructor(SHEET_ID, name) {
        this.#SHEET_ID = SHEET_ID;
        this.#name = name;
        this.#auth = new google.auth.GoogleAuth({
            keyFile: path.join(String(store.get(SettingsStoreMarks.SETTINGS.google.json_key_path))),
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
    }

    #googleAuth = async () => {
        try {
            let client = await this.#auth.getClient();
            let sheets = await google.sheets({
                version: 'v4',
                auth: client
            });
            return {sheets}
        } catch (e) {
            Log.error(e)
        }
    }
    read = async (range) => {
        try {
            const {sheets} = await this.#googleAuth();
            let response = await sheets.spreadsheets.values.get({
                spreadsheetId: this.#SHEET_ID,
                range: range
            })
            return response.data.values;
        } catch (e) {
            Log.error(e)
        }
    }
    write = async (range, data) => {
        try {
            const {sheets} = await this.#googleAuth();
            await sheets.spreadsheets.values.update({
                spreadsheetId: this.#SHEET_ID,
                valueInputOption: 'USER_ENTERED',
                range: range,
                requestBody: {values: [data]}
            })
        } catch (e) {
            Log.error(e)
        }
    }
    getLists = async () => {
        try {
            const {sheets} = await this.#googleAuth();
            return await sheets.spreadsheets.get({
                spreadsheetId: this.#SHEET_ID
            });
        } catch (e) {
            Log.error(e)
        }
    }
    getStatus = async () => {
        try {
            const {sheets} = await this.#googleAuth();
            await sheets.spreadsheets.get({
                spreadsheetId: this.#SHEET_ID
            });
            return {status: true};
        } catch (e) {
            return {status: false, id: this.#SHEET_ID, error: e}
        }
    }

    getID() {
        return this.#SHEET_ID;
    }

    getName() {
        return this.#name;
    }
}

exports.GoogleSheets = GoogleSheets
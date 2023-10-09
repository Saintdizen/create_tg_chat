const {google} = require('googleapis');
const {Log} = require("chuijs")

class GoogleSheets {
    #name = undefined;
    #SHEET_ID = undefined;
    #auth = undefined;

    constructor(SHEET_ID, name, credentials = String()) {
        try {
            this.#SHEET_ID = SHEET_ID;
            this.#name = name;
            this.#auth = new google.auth.GoogleAuth({
                keyFile: credentials,
                scopes: 'https://www.googleapis.com/auth/spreadsheets'
            })
        } catch (e) {
            return null;
        }
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
            Log.info(e)
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
            Log.info(e)
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
            Log.info(e)
        }
    }
    getLists = async () => {
        try {
            const {sheets} = await this.#googleAuth();
            return await sheets.spreadsheets.get({
                spreadsheetId: this.#SHEET_ID
            });
        } catch (e) {
            Log.info(e)
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
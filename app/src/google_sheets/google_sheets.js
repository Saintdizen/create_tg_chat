const path = require('path');
const {google} = require('googleapis');

class GoogleSheets {
    #name = undefined;
    #SHEET_ID = undefined;
    #auth = undefined;

    constructor(SHEET_ID, name) {
        this.#SHEET_ID = SHEET_ID;
        this.#name = name;
        this.#auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'creds/credentials.json'),
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
    }

    #googleAuth = async () => {
        let client = await this.#auth.getClient();
        let sheets = await google.sheets({
            version: 'v4',
            auth: client
        });
        return {sheets}
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
            console.error(e);
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
            console.error(e);
        }
    }
    getLists = async () => {
        try {
            const {sheets} = await this.#googleAuth();
            return await sheets.spreadsheets.get({
                spreadsheetId: this.#SHEET_ID
            });
        } catch (e) {
            console.error(e);
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

class GoogleDrive {
    #auth = undefined;

    constructor() {
        this.#auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'creds/credentials.json'),
            scopes: 'https://www.googleapis.com/auth/drive'
        });
    }

    #driveAuth = async (version = "v3") => {
        const client = await this.#auth.getClient();
        let drive = await google.drive({version: version, auth: client});
        return {drive}
    }
    copyDocument = async (options = {title: "", parentFolderId: "", fileId: ""}) => {
        try {
            const {drive} = await this.#driveAuth();
            let response = await drive.files.copy({
                requestBody: {'title': options.title, 'parents': [{"id": options.parentFolderId}]},
                fileId: options.fileId
            })
            return response.data.id;
        } catch (e) {
            throw e
        }
    }
    getFileInfo = async (fileId = "") => {
        try {
            const {drive} = await this.#driveAuth();
            let response = await drive.files.get({
                fileId: fileId
            })
            return response.data;
        } catch (e) {
            throw e
        }
    }
    getPermissionsList = async (fileId = "") => {
        try {
            const {drive} = await this.#driveAuth("v2");
            let response = await drive.permissions.list({
                fileId: fileId
            })
            return response.data.items;
        } catch (e) {
            throw e
        }
    }

    setPermissionsList = async (fileId = "", email = "") => {
        try {
            const {drive} = await this.#driveAuth();
            let response = await drive.permissions.create({
                requestBody: {
                    emailAddress: email,
                    role: "writer",
                    type: "user"
                },
                fileId: fileId
            })
            return response.data;
        } catch (e) {
            throw e
        }
    }

    getDeleteShare = async (fileId = "", permissionId = "") => {
        try {
            const {drive} = await this.#driveAuth();
            let response = await drive.permissions.delete({
                fileId: fileId, permissionId: permissionId
            })
            return response.data;
        } catch (e) {
            throw e
        }
    }
}

exports.GoogleDrive = GoogleDrive
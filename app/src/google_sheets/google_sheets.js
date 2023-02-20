const path = require('path');
const {google} = require('googleapis');

class GoogleSheets {
    #SHEET_ID = undefined;
    #auth = undefined;
    constructor(SHEET_ID) {
        this.#SHEET_ID = SHEET_ID;
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
        return { sheets }
    }
    read = async (range) => {
        try {
            const { sheets } = await this.#googleAuth();
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
         const { sheets } = await this.#googleAuth();
         await sheets.spreadsheets.values.update({
            spreadsheetId: this.#SHEET_ID,
            valueInputOption: 'USER_ENTERED',
            range: range,
            requestBody: { values: [ data ] }
         })
      } catch (e) {
         console.error(e);
      }
   }
   getLists = async () => {
      try {
         const { sheets } = await this.#googleAuth();
         return await sheets.spreadsheets.get({
             spreadsheetId: this.#SHEET_ID
         });
      } catch (e) {
         console.error(e);
      }
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
    #driveAuth = async () => {
        const client = await this.#auth.getClient();
        let drive = await google.drive({ version: 'v2', auth: client });
        return { drive }
    }
    copyDocument = async (options = { title: "", parentFolderId: "", fileId: "" }) => {
        try {
            const { drive } = await this.#driveAuth();
            let response = await drive.files.copy({
                requestBody: {'title': options.title, 'parents' : [ { "id" : options.parentFolderId } ]},
                fileId: options.fileId
            })
            return response.data.id;
        } catch (e) {
            throw e
        }
    }
}
exports.GoogleDrive = GoogleDrive
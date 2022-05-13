const path = require('path');
const { google } = require('googleapis');

class GoogleSheets {
    #SHEET_ID = undefined;
    constructor(SHEET_ID) {
        this.#SHEET_ID = SHEET_ID;
    }
    #authz = async () => {
        const auth = new google.auth.GoogleAuth({
           keyFile: path.join(__dirname, 'creds/credentials.json'),
           scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const sheets = google.sheets({
           version: 'v4',
           auth: client
        });
        return { sheets }
    }
    read = async (range) => {
        try {
           const { sheets } = await this.#authz();
           const response = await sheets.spreadsheets.values.get({
              spreadsheetId: this.#SHEET_ID,
              range: range
           })
           return response.data.values;
        } catch (e) {
           console.log(e);
        }
    }
    write = async (range, data) => {
      try {
         const { sheets } = await this.#authz();
         await sheets.spreadsheets.values.update({
            spreadsheetId: this.#SHEET_ID,
            valueInputOption: 'USER_ENTERED',
            range: range,
            requestBody: { values: [ data ] }
         })
      } catch (e) {
         console.log(e);
      }
   }
   getLists = async () => {
      try {
         const { sheets } = await this.#authz();
         return await sheets.spreadsheets.get({
             spreadsheetId: this.#SHEET_ID
         });
      } catch (e) {
         console.log(e);
      }
   }
}
exports.GoogleSheets = GoogleSheets

class GoogleDrive {
   #authz_drive = async () => {
     const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, 'creds/credentials.json'),
        scopes: 'https://www.googleapis.com/auth/drive'
     })
     const client = await auth.getClient();
     const drive = google.drive({
        version: 'v2',
        auth: client
     });
     return { drive }
  }
  copyDocument = async (options = { 
     title: String(undefined),
     parentFolderId: String(undefined),
     fileId: String(undefined) }) => {
     try {
        const { drive } = await this.#authz_drive();
        const response = await drive.files.copy({
           requestBody: {'title': options.title, 'parents' : [ { "id" : options.parentFolderId } ]},
           fileId: options.fileId
        })
        return response.data.id;
     } catch (e) {
        console.log(e);
     }
  }
}
exports.GoogleDrive = GoogleDrive
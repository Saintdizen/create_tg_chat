const {
    Page, Icons, Button, TextInput
} = require('chuijs');
const {GoogleDrive} = require("../src/google_sheets/google_sheets");

class TestPage extends Page {
    constructor() {
        super();
        this.setTitle('Отключение прав доступа');
        this.setMain(false);
        this.setFullWidth();
        this.setFullHeight();

        let textInput = new TextInput({
            name: 'id_file',
            title: "Идентификатор файла",
            placeholder: "Идентификатор файла",
            width: "400px",
        });

        let emails = []

        let button = new Button({
            title: "Проверить",
            clickEvent: async () => {
                let api = new GoogleDrive()
                let data = await api.getPermissionsList(textInput.getValue())
                for (let user of data) {
                    emails.push(user.emailAddress)
                }

                /**let test = await api.getDeleteShare('18HEsXkgEmyFHxPpuv65ma3bGNbD_G-JfLLHtqeMiiRs', "16567772291595129134")
                 console.log(test)**/

                console.log(emails.join(", "))
            }
        });

        this.add(textInput, button)
    }
}

exports.TestPage = TestPage
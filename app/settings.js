const {app} = require('electron').remote;
const path = require('path')
let user_data_path = path.join(app.getPath('userData'), 'user_data.json')
const {TGApis} = require("../apis");
const api = new TGApis(user_data_path)

let { Page, Button, TextInput} = require('chui-electron');

class Settings extends Page {
    constructor() {
        super();
        this.setMain(false);
        this.setTitle('Настройки')

        let username = new TextInput({
            title: 'Имя пользователя без @',
            placeholder: 'Номер инцидента',
            width: '-webkit-fill-available',
            required: false
        });
        let button = new Button('Получить данные', (e) => {
            api.sleep(2500).then(async () => {
                let user = await api.getUserInfoByUserName(username.getValue()).catch(error => console.log(error))
                let data = {
                    user_id: Number(user.users[0].id),
                    access_hash: Number(user.users[0].access_hash)
                }
                console.log(data)
            })
        })

        this.add(username, button)
    }
}

exports.Settings = Settings
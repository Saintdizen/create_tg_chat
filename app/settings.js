const {app} = require('electron').remote;
const path = require('path')
let user_data_path = path.join(app.getPath('userData'), 'user_data.json')
const {TGApis} = require("./apis");
const api = new TGApis(user_data_path)

let { Page, Button, TextInput, ContentBlock, Styles, Label} = require('chui-electron');

class Settings extends Page {
    constructor() {
        super();
        this.setMain(false);
        this.setTitle('Настройки')

        //
        let main = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        main.setWidth('-webkit-fill-available')
        let info = new ContentBlock(Styles.DIRECTION.COLUMN, Styles.WRAP.NOWRAP, Styles.ALIGN.CENTER, Styles.JUSTIFY.CENTER);
        info.setWidth('-webkit-fill-available')
        info.setContentEditable(true)

        let username = new TextInput({
            title: 'Имя пользователя без @',
            placeholder: 'Имя пользователя без @',
            width: '400px',
            required: false
        });
        let button = new Button('Получить данные', (e) => {
            info.clear()
            api.sleep(2500).then(async () => {
                let user = await api.getUserInfoByUserName(username.getValue()).catch(error => console.log(error))
                console.log(user)
                info.add(new Label(user.users[0].id))
                info.add(new Label(user.users[0].access_hash))
                info.add(new Label(`${user.users[0].last_name} ${user.users[0].first_name}`))
            })
        })

        main.add(username, button)
        this.add(main, info)
    }
}

exports.Settings = Settings
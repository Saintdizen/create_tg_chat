const { AppLayout, render, Notification } = require('chuijs');
const { CreateChatTG } = require('./page');
const { UpdateAppPage } = require('./page_update_app');
const request = require('request');
const package_json = require('../package.json');

class App extends AppLayout {
    constructor() {
        super();
        this.setRoute(new CreateChatTG());
        this.#check_new_version_app(this);

    }
    #check_new_version_app(app) {
        request('https://updates_create_tg_chat:PZG3mrSZ0HDjqXm5yu8eHfavWBdCZh@updates.chuijs.ru/updates/create_tg_chat/', function (error, response, body) {
            if (error !== null) new Notification({ title: `Ошибка запроса`, text: `${error}`, showTime: 5000 }).show();
            if (response.statusCode === 200) {
                let json = JSON.parse(body)
                if (package_json.version < json.version) {
                    for (let pack of json.packages) {
                        if (pack.platform.includes(process.platform)) {
                            app.setRoute(new UpdateAppPage({
                                name: pack.name,
                                link: `https://updates.chuijs.ru/updates/create_tg_chat/${pack.name}`,
                                version: json.version,
                                platform: `${process.platform} (${pack.platform})`,
                            }))
                            new Notification({ title: `Доступна новая версия!`, text: `Обновите приложение до версии **${json.version}**`, style: Notification.STYLE.WARNING, showTime: 5000 }).show();
                        }
                    }
                }
            }
        });
    }
}

render(() => new App()).then(() => console.log("ЗАГРУЖЕНО!"))
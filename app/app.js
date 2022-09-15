const { AppLayout, render, Notification, Dialog, ipcRenderer} = require('chuijs');
const { CreateChatTG } = require('./page');
const {UpdateAppDialog} = require("./page_help");
const request = require('request');
const package_json = require('../package.json');

class App extends AppLayout {
    constructor() {
        super();
        this.setRoute(new CreateChatTG());
        this.#check_new_version_app(this);
        setInterval(() => {
            this.#check_new_version_app_notification();
        }, 1200000);
        let profile = new Dialog({ width: "500px", height: "500px", closeOutSideClick: true })
        ipcRenderer.on("sendUserData", (e, user) => {
            this.addComponentToAppLayout({
                center: [ profile ],
                headerRight: [
                    AppLayout.USER_PROFILE(`${user.firstName} ${user.lastName}`,[
                        AppLayout.USER_DD_ITEM("Выход", () => ipcRenderer.send("LOGOUT")),
                    ])
                ]
            })
        })
    }
    #check_new_version_app_notification() {
        request('https://updates_create_tg_chat:PZG3mrSZ0HDjqXm5yu8eHfavWBdCZh@updates.chuijs.ru/updates/create_tg_chat/', function (error, response, body) {
            if (error !== null) new Notification({ title: `Ошибка запроса`, text: `${error}`, showTime: 5000 }).show();
            if (response.statusCode === 200) {
                let json = JSON.parse(body)
                if (package_json.version < json.version) {
                    for (let pack of json.packages) {
                        if (pack.platform.includes(process.platform)) {
                            new Notification({ title: `Доступна новая версия!`, markdownText: `Перазапустите приложение для появления пунка меню с обновлением`, style: Notification.STYLE.WARNING, showTime: 5000 }).show();
                        }
                    }
                }
            }
        });
    }
    #check_new_version_app(app) {
        request('https://updates_create_tg_chat:PZG3mrSZ0HDjqXm5yu8eHfavWBdCZh@updates.chuijs.ru/updates/create_tg_chat/', function (error, response, body) {
            if (error !== null) new Notification({ title: `Ошибка запроса`, text: `${error}`, showTime: 5000 }).show();
            if (response.statusCode === 200) {
                let json = JSON.parse(body)
                if (package_json.version < json.version) {
                    for (let pack of json.packages) {
                        if (pack.platform.includes(process.platform)) {
                            let dialog = new UpdateAppDialog({
                                title: `Доступна новая версия!`,
                                name: pack.name,
                                link: `https://updates.chuijs.ru/updates/create_tg_chat/${pack.name}`,
                                version: json.version,
                                platform: `${process.platform} (${pack.platform})`,
                            })
                            app.addComponentToAppLayout({
                                center: [ dialog ],
                                headerRight: [ AppLayout.BUTTON(`Доступна новая версия! ${json.version}`, () => dialog.open()) ]
                            })
                            new Notification({ title: `Доступна новая версия!`, markdownText: `Обновите приложение до версии **${json.version}**`, style: Notification.STYLE.WARNING, showTime: 5000 }).show();
                        }
                    }
                }
            }
        });
    }
}

render(() => new App()).then(() => console.log("ЗАГРУЖЕНО!"))
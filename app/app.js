const { AppLayout, render, Notification, ipcRenderer, Icon, Icons, Styles} = require('chuijs');
const { CreateChatTG } = require('./pages/page');
const {UpdateApp} = require("./dialogs/dialogs");
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
        ipcRenderer.on("sendUserData", (e, user) => {
            this.addComponentToAppLayout({
                headerRight: [
                    AppLayout.USER_PROFILE({
                        username: `${user.firstName} ${user.lastName}`,
                        image: {
                            noImage: true
                        },
                        items: [
                            AppLayout.USER_PROFILE_ITEM({
                                title: "Выход",
                                clickEvent: () => { ipcRenderer.send("LOGOUT") }
                            })
                        ]
                    })
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
                            let updateApp = new UpdateApp({
                                title: `Доступна новая версия!`,
                                name: pack.name,
                                link: `https://updates.chuijs.ru/updates/create_tg_chat/${pack.name}`,
                                version: json.version,
                                platform: `${process.platform} (${pack.platform})`,
                            });
                            app.addComponentToAppLayout({
                                headerRight: [
                                    AppLayout.DIALOG({
                                        title: `${json.version}`,
                                        icon: new Icon(Icons.ACTIONS.SYSTEM_UPDATE_ALT, "20px"),
                                        reverse: false,
                                        dialogOptions: {
                                            width: "650px",
                                            height: "max-content",
                                            closeOutSideClick: true,
                                            header: {
                                                title: `Загрузка новой версии: ${json.version}`,
                                                closeButtonTitle: "Закрыть",
                                            },
                                            body: {
                                                direction: Styles.DIRECTION.COLUMN,
                                                wrap: Styles.WRAP.NOWRAP,
                                                align: Styles.ALIGN.CENTER,
                                                justify: Styles.JUSTIFY.CENTER,
                                                components: [ updateApp ]
                                            }
                                        }
                                    }),
                                ]
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
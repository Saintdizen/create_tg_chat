const {AppLayout, render, ipcRenderer, Route, Icons} = require('chuijs');
const {CreateChatTG} = require("./pages/page");
const {SettingsMain} = require("./pages/settings/settings_main");

class App extends AppLayout {
    constructor() {
        super();
        this.setAutoCloseRouteMenu()
        //this.disableAppMenu();
        //
        let main_page = new CreateChatTG();
        let settings_page = new SettingsMain(main_page);
        //
        this.setRoute(main_page)
        ipcRenderer.on("sendUserData", (e, user) => {
            this.addToHeader([
                AppLayout.BUTTON({
                        title: "Настройки",
                        icon: Icons.ACTIONS.SETTINGS,
                        clickEvent: () => new Route().go(settings_page)
                    }
                ),
                AppLayout.USER_PROFILE({
                    username: `${user.firstName} ${user.lastName}`,
                    image: {noImage: true},
                    items: [
                        AppLayout.USER_PROFILE_ITEM({
                            title: "Выход",
                            clickEvent: () => {
                                ipcRenderer.send("LOGOUT")
                            }
                        })
                    ]
                })
            ])
        })
    }
}

render(() => new App()).then(() => console.log("ЗАГРУЖЕНО!!!"))
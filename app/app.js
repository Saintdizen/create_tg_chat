const {AppLayout, render, ipcRenderer, Route, Icons, Log} = require('chuijs');
const {SettingsGoogleCheckPage} = require("./pages/0_page");

class Apps extends AppLayout {
    constructor() {
        super();
        this.setAutoCloseRouteMenu();
        //
        let settings_check_page = new SettingsGoogleCheckPage();
        //let settings_page = new SettingsMain(main_page);
        this.setRoute(settings_check_page)
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

render(() => new Apps()).then(() => Log.info("ЗАГРУЖЕНО!!!"))
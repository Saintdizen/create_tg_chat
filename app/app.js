const {AppLayout, render, ipcRenderer} = require('chuijs');
const {CreateChatTG} = require("./pages/page");
const {TestPage} = require("./pages/access/main_page");
const {SettingsMain} = require("./pages/settings/settings_main");

class App extends AppLayout {
    constructor() {
        super();
        this.setAutoCloseRouteMenu(true)
        this.setRoute(new CreateChatTG())
        this.setRoute(new TestPage())
        this.setRoute(new SettingsMain())
        ipcRenderer.on("sendUserData", (e, user) => {
            this.addComponentToAppLayout({
                headerRight: [
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
                ]
            })
        })
    }
}

render(() => new App()).then(() => console.log("ЗАГРУЖЕНО!"))
const {AppLayout, render, ipcRenderer, Route, Log, Popup} = require('chuijs');
const {SettingsGoogleCheckPage} = require("./pages/0_page");
const {SettingsMain} = require("./pages/settings/settings_main");
const {CreateChatTG} = require("./pages/1_page");

class Apps extends AppLayout {
    constructor() {
        super();
        this.setAutoCloseRouteMenu();
        //
        let main_page = new CreateChatTG();
        let settings_page = new SettingsMain(main_page);
        let settings_check_page = new SettingsGoogleCheckPage(main_page, settings_page);
        this.setRoute(settings_check_page)
        this.disableAppMenu();
        let pop = new Popup();
        ipcRenderer.on("sendUserData", (e, user) => {
            this.addToHeaderRight([
                AppLayout.USER_PROFILE({
                    username: `${user.firstName} ${user.lastName}`,
                    image: {noImage: true},
                    items: [
                        AppLayout.USER_PROFILE_ITEM({
                            title: "Настройки",
                            clickEvent: () => new Route().go(settings_page)
                        }),
                        AppLayout.USER_PROFILE_ITEM({
                            title: "Выход",
                            clickEvent: async () => {
                                let confirm_res = await pop.confirm({
                                    title: 'Выход из аккаунта Telegram',
                                    message: 'Продолжить?',
                                    okText: 'OK', cancelText: 'Отмена',
                                })
                                if (confirm_res) ipcRenderer.send("LOGOUT")
                            }
                        })
                    ]
                })
            ])
        })
    }
}

render(() => new Apps()).then(() => Log.info("ЗАГРУЖЕНО!!!"))
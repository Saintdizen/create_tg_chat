const { AppLayout, render, ipcRenderer, Notification} = require('chuijs');
const { CreateChatTG } = require('./pages/page');

class App extends AppLayout {
    constructor() {
        super();
        this.setRoute(new CreateChatTG());
        ipcRenderer.on("sendUserData", (e, user) => {
            this.addComponentToAppLayout({
                headerRight: [
                    AppLayout.USER_PROFILE({
                        username: `${user.firstName} ${user.lastName}`,
                        image: { noImage: true },
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
        ipcRenderer.on("sendNotificationUpdate", (e, text, body) => {
            new Notification({ title: text, text: body, style: Notification.STYLE.WARNING, showTime: 3000 }).show(true);
        })
    }
}

render(() => new App()).then(() => console.log("ЗАГРУЖЕНО!"))
const { AppLayout, render, ipcRenderer } = require('chuijs');
const {CreateChatTG} = require("./pages/page");

class App extends AppLayout {
    constructor() {
        super();
        this.setRoute(new CreateChatTG())
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
    }
}

render(() => new App()).then(() => console.log("ЗАГРУЖЕНО!"))
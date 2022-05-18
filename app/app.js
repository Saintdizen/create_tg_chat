const { AppLayout, render } = require('chui-electron');
const { CreateChatTG } = require('./page');
const { Settings } = require('./settings');

class App extends AppLayout {
    constructor() {
        super();
        this.setDarkMode();
        this.setRoute(new CreateChatTG());
        this.setRoute(new Settings())
    }
}

render(() => { new App(); })
let { AppLayout, render } = require('chui-electron');
let { CreateChatTG } = require('./page');
let { Settings } = require('./settings');

class App extends AppLayout {
    constructor() {
        super();
        this.setDarkMode();
        this.setRoute(new CreateChatTG());
        this.setRoute(new Settings())
    }
}

render(() => { new App(); })
const { AppLayout, render } = require('chui-electron');
const { CreateChatTG } = require('./page');

class App extends AppLayout {
    constructor() {
        super();
        this.setDarkMode();
        this.setRoute(new CreateChatTG());
    }
}

render(() => { new App(); })
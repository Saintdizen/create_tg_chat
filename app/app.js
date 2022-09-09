const { AppLayout, render } = require('chuijs');
const { CreateChatTG } = require('./page');
const { HelpPage } = require('./page_help');

class App extends AppLayout {
    constructor() {
        super();
        this.setRoute(new CreateChatTG());
        this.setRoute(new HelpPage());
    }
}

render(() => new App()).then(() => console.log("Загружено!"))
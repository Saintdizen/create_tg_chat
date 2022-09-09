const { AppLayout, render } = require('chuijs');
const { CreateChatTG } = require('./page');

class App extends AppLayout {
    constructor() {
        super();
        this.setRoute(new CreateChatTG());
    }
}

render(() => new App()).then(() => console.log("Загружено!"))
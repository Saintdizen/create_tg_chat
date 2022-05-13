const { Page } = require('chui-electron');

class MainPage extends Page {
    constructor() {
        super();
        this.setTitle('Главная');
        this.setMain(true)
    }
}

exports.MainPage = MainPage
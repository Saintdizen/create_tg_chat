const { Page } = require('chui-electron');

class Settings extends Page {
    constructor() {
        super();
        this.setMain(false);
        this.setTitle('Настройки')
    }
}

exports.Settings = Settings
const { Page, WebView } = require('chui-electron');

class KinopoiskPage extends Page {
    constructor() {
        super();
        this.setTitle('Кинопоиск HD');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://hd.kinopoisk.ru/");

        this.add(web);
    }
}

exports.KinopoiskPage = KinopoiskPage
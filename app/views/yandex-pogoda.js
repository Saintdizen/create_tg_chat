const { Page, WebView } = require('chui-electron');

class YandexPogodaPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Погода');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://yandex.ru/pogoda/");

        this.add(web);
    }
}
exports.YandexPogodaPage = YandexPogodaPage
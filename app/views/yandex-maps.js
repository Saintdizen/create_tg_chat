const { Page, WebView } = require('chui-electron');

class YandexMapsPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Карты');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://yandex.ru/maps");

        this.add(web);
    }
}
exports.YandexMapsPage = YandexMapsPage
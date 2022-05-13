const { Page, WebView } = require('chui-electron');

class YandexRadioPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Радио');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://radio.yandex.ru/");

        this.add(web);
    }
}
exports.YandexRadioPage = YandexRadioPage
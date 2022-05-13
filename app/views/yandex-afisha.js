const { Page, WebView } = require('chui-electron');

class YandexAfishaPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Афиша');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://afisha.yandex.ru/");

        this.add(web);
    }
}
exports.YandexAfishaPage = YandexAfishaPage
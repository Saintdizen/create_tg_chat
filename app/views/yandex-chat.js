const { Page, WebView } = require('chui-electron');

class YandexChatPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Чат');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://yandex.ru/chat#/");

        this.add(web);
    }
}
exports.YandexChatPage = YandexChatPage
const { Page, WebView } = require('chui-electron');

class YandexDiskPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Диск');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://disk.yandex.ru/");

        this.add(web);
    }
}
exports.YandexDiskPage = YandexDiskPage
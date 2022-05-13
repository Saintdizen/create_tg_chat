const { Page, WebView } = require('chui-electron');

class YandexMusicPage extends Page {
    constructor() {
        super();
        this.setTitle('Яндекс Музыка');
        this.setFullHeight()
        this.disablePadding()
        
        let web = new WebView("https://music.yandex.ru/");

        this.add(web);
    }
}
exports.YandexMusicPage = YandexMusicPage
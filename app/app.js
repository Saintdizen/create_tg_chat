const { AppLayout, render } = require('chui-electron');

const { MainPage } = require('./views/main')
const { YandexRadioPage } = require('./views/yandex-radio')
const { YandexMusicPage } = require('./views/yandex-misic')
const { KinopoiskPage } = require('./views/kinopoisk-hd')
const { YandexDiskPage } = require('./views/yandex-disk')
const { YandexChatPage } = require('./views/yandex-chat')
const { YandexPogodaPage } = require('./views/yandex-pogoda')
const { YandexMapsPage } = require('./views/yandex-maps')
const { YandexAfishaPage } = require('./views/yandex-afisha')

class App extends AppLayout {
    constructor() {
        super();
        this.setDarkMode();
        this.setRoute(new MainPage());
        this.setRoute(new YandexRadioPage());
        this.setRoute(new YandexMusicPage());
        this.setRoute(new KinopoiskPage());
        this.setRoute(new YandexDiskPage());
        this.setRoute(new YandexChatPage());
        this.setRoute(new YandexPogodaPage());
        this.setRoute(new YandexMapsPage());
        this.setRoute(new YandexAfishaPage());
    }
}
render(() => {
    new App();
})
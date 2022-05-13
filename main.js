const { Main, MenuItem } = require('chui-electron');
const main = new Main({
    name: "Yandex Services",
    width: 1366,
    height: 768,
    icon: `${__dirname}/resources/icons/app/icon.png`,
    render: `${__dirname}/app/app.js`,
    devTools: false,
    menuBarVisible: false
});

main.start({
    hideOnClose: true,
    tray: [
        new MenuItem().button('Показать | Скрыть', () => { main.hideAndShow() }),
        new MenuItem().separator(),
        new MenuItem().toggleDevTools('Консоль разработчика'),
        new MenuItem().separator(),
        new MenuItem().quit('Выход')
    ]
});
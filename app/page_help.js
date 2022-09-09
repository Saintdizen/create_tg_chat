const { Page, Paragraph, Image, Button, TreeView, Styles} = require("chuijs");

class HelpPage extends Page {
    constructor() {
        super();
        this.setMain(true);
        this.setTitle("Как работать с приложением")

        let treeView = new TreeView({
            width: Styles.WIDTH.WEBKIT_FILL,
            components: [
                TreeView.ExpandButton({
                    title: "Авторизация",
                    subButtons: [
                        TreeView.ExpandButton({
                            title: "Авторизация через QR-код",
                            components: [
                                //
                                new Paragraph("ОПИСАНИЕ ТУТ"),
                            ]
                        }),
                        TreeView.ExpandButton({
                            title: "Авторизация по номеру телефона",
                            components: [
                                //
                                new Paragraph("ОПИСАНИЕ ТУТ"),
                            ]
                        }),
                    ]
                }),
                TreeView.ExpandButton({
                    title: "Создание чата",
                    components: [
                        //
                        new Paragraph("1) Выбрать список пользователей"),
                        new Image({
                            path: `${__dirname}/../resources/images/1.png`,
                            width: "95%"
                        }),
                        //
                        new Paragraph("Дождаться появления уведомления"),
                        new Image({
                            path: `${__dirname}/../resources/images/1_2.png`,
                        }),
                        //
                        new Paragraph("2) Заполнить поле 'Номер инциценда'"),
                        new Image({
                            path: `${__dirname}/../resources/images/2.png`,
                            width: "95%"
                        }),
                        //
                        new Paragraph("3) Заполнить поле 'Описание'"),
                        new Image({
                            path: `${__dirname}/../resources/images/3.png`,
                            width: "95%"
                        }),
                        //
                        new Paragraph("4) Заполнить поле 'Закрепленное поле' при необходимости"),
                        new Image({
                            path: `${__dirname}/../resources/images/4.png`,
                            width: "95%"
                        }),
                        //
                        new Paragraph("5) Нажать кнопку 'Создать чат'"),
                        new Image({
                            path: `${__dirname}/../resources/images/5.png`,
                        })
                    ]
                }),
            ]
        });
        this.add(treeView)
    }
}

exports.HelpPage = HelpPage
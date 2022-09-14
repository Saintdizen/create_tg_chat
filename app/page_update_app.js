const {Page, Label, ProgressBar, Button, Styles, ContentBlock, ipcRenderer, shell} = require('chuijs');

class UpdateAppPage extends Page {
    constructor(options = {
        name: String(undefined),
        link: String(undefined),
        version: String(undefined),
        platform: String(undefined)
    }) {
        super();
        this.setMain(false);
        this.setTitle(`Обновление приложения ${options.version}`)
        this.setFullWidth();
        this.setFullHeight()
        let updates_path = require('path').join(require('os').homedir(), "updates_create_tg_chat");

        let block = new ContentBlock({ direction: Styles.DIRECTION.COLUMN, wrap: Styles.WRAP.NOWRAP, align: Styles.ALIGN.CENTER, justify: Styles.JUSTIFY.CENTER });
        block.setWidth(Styles.WIDTH.WEBKIT_FILL)
        block.setHeight(Styles.HEIGHT.WEBKIT_FILL)

        let label_version = new Label({ text: `Версия: ${options.version}` });
        let label_platform = new Label({ text: `Платформа: ${options.platform}` });
        let label_download_path = new Label({ text: `Путь до файла: ${require('path').join(updates_path, options.name)}` });
        let progress = new ProgressBar(100);
        progress.setWidth(Styles.WIDTH.WEBKIT_FILL);
        progress.setProgressText(`Загрузка ${options.name}`)
        progress.setProgressCountText(`0%`)

        let button = new Button('Начать загрузку', async () => {
            block.remove(button);
            progress.setProgressText(`Загрузка ${options.name}`)
            const Downloader = require("nodejs-file-downloader");
            const downloader = new Downloader({
                url: options.link,
                fileName: options.name,
                directory: updates_path,
                onProgress: (percentage, chunk, remainingSize) => {
                    let test = `(${remainingSize.toString()})`;
                    progress.setProgressCountText(`${percentage}%`)
                    progress.setValue(Number(percentage))
                },
            });
            try {
                await downloader.download();
                await shell.openExternal(`file://${updates_path}`, {
                    workingDirectory: updates_path
                })
                let button = new Button("Закрыть приложение", () => ipcRenderer.send("closeForUpdate"));
                block.add(button)
            } catch (error) {
                console.log(error);
            }
        })

        block.add(label_version, label_platform, label_download_path, progress, button)
        this.add(block)
    }
}

exports.UpdateAppPage = UpdateAppPage
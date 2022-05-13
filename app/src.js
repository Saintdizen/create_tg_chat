//
const { Api, TelegramClient } = require("telegram");
const { StringSession  } = require("telegram/sessions");
const fs = require('fs');
const path = require('path');
const appData = require('electron').app.getPath('userData');
let SystemNotification = require('electron').Notification;
//
const api_id = 12415990;
const api_hash = '240958bf7eb5068290dff67cb3c73b1f';
const client = new TelegramClient(new StringSession(""), api_id, api_hash, { connectionRetries: 5 });

const firstAuth = async (phone) => {
  await client.connect();
  await client.invoke(
    new Api.auth.SendCode({
      phoneNumber: phone,
      apiId: api_id,
      apiHash: api_hash,
      settings: new Api.CodeSettings({
        allowFlashcall: true,
        currentNumber: true,
        allowAppHash: true,
      }),
    })
  );
}
exports.firstAuth = firstAuth
const auth = async (phone, code, appData) => {
  await client.start({
    phoneNumber: async () => await phone,
    password: async () => await code,
    phoneCode: async () => await code,
    onError: (err) => console.log(err),
  });
  try { 
    fs.writeFileSync(path.join(appData, 'tg_session_string.txt'), client.session.save(), 'utf-8');
  }
  catch(e) { alert('Failed to save the file !'); }
}
exports.auth = auth
const createChat = async (userList, pin_message, inc_num, desc, doc_link) => {
  try {
    let code = fs.readFileSync(path.join(appData, 'tg_session_string.txt'), 'utf-8');
    const client_create = new TelegramClient(new StringSession(code), api_id, api_hash, {});
    await client_create.connect();
  
    //Создать группу
    await sendLog(`Создание группы...`)
    let date_STRING = format(new Date());
    const res_cr_chat = await client_create.invoke(new Api.channels.CreateChannel({
        megagroup: true,
        title: `${date_STRING} - ${desc} - ${inc_num}`,
        about: `Создан чат по проблеме ${date_STRING} - ${desc} - ${inc_num}`,
    }));
    let chat_id = res_cr_chat.updates[2].channelId.value;
  
    //Получение ссылки на приглашение в чат
    await sendLog(`Получение ссылки на приглашение в чат...`)
    const invite_link = await client_create.invoke(new Api.messages.ExportChatInvite({
      peer: chat_id,
    }));
    let tg_link = invite_link.link;
  
  
    //Корректировка сообщения
    await sendLog(`Корректировка сообщения...`)
    let message = pin_message.split('\n');
    message[1] = `<b><a href="${doc_link}">Ссылка</a></b>  на отчет по инциденту`
    message.push(`\nПриглашение в оперативный чат: ${tg_link}`)
    const new_message = message.join('\n')
    console.log(new_message)
  
    //Отправка сообщения
    await sendLog(`Отправка и закрепление сообщения...`)
    client_create.sendMessage(chat_id, {message: new_message, parseMode: 'html', linkPreview: false}).then((e) => {
      client_create.pinMessage(chat_id, e.id, {notify: true})
    })
  
    //Добавить людей
    await sendLog(`Добавление пользователей в чат...`)
    for (let user of userList) {
      try {
        await client_create.invoke(new Api.channels.InviteToChannel({
          channel: chat_id,
          users: [`${user}`],
        }));
      } catch (e) {
        await sendLog(`[Ошибка] Пользователь с ником ${user} не найден`)
      }
    }
    new SystemNotification({ title: 'Создание чата в Telegram', body: 'Чат успешно создан!' }).show()
  } catch (e) {
    await sendLog(e.message)
  }
}
exports.createChat = createChat



async function sendLog(text) {
  require('electron').BrowserWindow.getAllWindows().filter(b => {
     b.webContents.send('log_tg', text)
  })
}

function format(date) {
  let day = date.getDate()
  let month = date.getMonth() + 1
  let year = date.getFullYear()
  //Определение дня и месяца
  if (day < 10) { day = "0" + day }
  if (month < 10) { month = "0" + month }
  return String(day + "-" + month + "-" + year)
}
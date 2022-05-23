let os = require("os");
let MTProto = require('@mtproto/core');
const sleep_time = 1000;

class TGApis {
    #api_id = 12415990;
    #api_hash = "240958bf7eb5068290dff67cb3c73b1f";
    #json = require('../package.json');
    constructor(storagePath = String(undefined)) {
        this.client = new MTProto({
            api_id: this.#api_id, api_hash: this.#api_hash,
            storageOptions: {
                path: storagePath,
            },
        })
        this.client.initConnectionParams = {
            api_id: this.#api_id,
            device_model: `${os.hostname().toUpperCase()} ${os.platform().toUpperCase()} ${os.arch().toString()}`,
            system_version: os.release().toString(),
            app_version: this.#json.version,
            system_lang_code: 'ru',
            lang_code: 'ru'
        }
    }
    async getAuth() {
        //await this.sleep(sleep_time)
        try {
            await this.client.call('account.getAuthorizations');
            return true
        } catch (e) {
            return false
        }
    }
    async exportLoginToken() {
        const exportLoginToken = await this.client.call('auth.exportLoginToken', {
            api_id: this.#api_id, api_hash: this.#api_hash, except_ids: []
        });
        if (exportLoginToken._ === 'auth.loginToken') {
            return `tg://login?token=${Buffer.from(exportLoginToken.token).toString('base64')}`
        }
    }
    addUpdateShortListener(listener = () => {}) {
        this.client.updates.on('updateShort', listener);
    }
    async getUser() {
        await this.sleep(sleep_time)
        try {
            const user = await this.client.call('users.getFullUser', {
                id: {
                    _: 'inputUserSelf',
                },
            });
            return user.users[0]
        } catch (error) {
            throw error;
        }
    }
    async createChannel(title = String(undefined), about = String(undefined)) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('channels.createChannel', {
                megagroup: true,
                title: title,
                about: about
            })
        } catch (error) {
            throw error;
        }
    }
    async exportChatInvite(channel_id = Number(undefined), access_hash = Number(undefined)) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('messages.exportChatInvite', {
                peer: {
                    _: 'inputPeerChannel',
                    channel_id: channel_id,
                    access_hash: access_hash
                }
            })
        } catch (error) {
            throw error;
        }
    }
    async sendMessage(channel_id = Number(undefined), access_hash = Number(undefined), messages = String(undefined), link_doc = String(undefined), link_chat = String(undefined)) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('messages.sendMessage', {
                peer: {
                    _: 'inputPeerChannel',
                    channel_id: channel_id,
                    access_hash: access_hash
                },
                random_id: (new Date).valueOf(),
                no_webpage: true,
                message: messages,
                clear_draft: true,
                entities: [
                    { _: 'messageEntityBold', offset: 0, length: 19 },
                    { _: 'messageEntityBold', offset: 20, length: 6 },
                    { _: 'messageEntityTextUrl', offset: 20, length: 6, url: link_doc },
                    { _: 'messageEntityBold', offset: 49, length: 6 },
                    { _: 'messageEntityTextUrl', offset: 49, length: 6, url: link_chat },
                    { _: 'messageEntityBold', offset: 75, length: 13 },
                    { _: 'messageEntityBold', offset: 90, length: 13 },
                    { _: 'messageEntityBold', offset: 104, length: 16 },
                    { _: 'messageEntityBold', offset: 121, length: 7 },
                ]
            })
        } catch (error) {
            throw error;
        }
    }
    async updatePinnedMessage(channel_id = Number(undefined), access_hash = Number(undefined), id = Number(undefined)) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('messages.updatePinnedMessage', {
                peer: {
                    _: 'inputPeerChannel',
                    channel_id: channel_id,
                    access_hash: access_hash
                },
                id
            })
        } catch (error) {
            throw error;
        }
    }
    async inviteToChannel(channel_id = Number(undefined), access_hash = Number(undefined), users = []) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('channels.inviteToChannel', {
                channel: {
                    _: 'inputChannel',
                    channel_id: channel_id,
                    access_hash: access_hash
                },
                users: users
            })
        } catch (error) {
            throw error;
        }
    }
    async getUserInfo(users = []) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('users.getUsers', {
                id: users
            })
        } catch (error) {
            throw error;
        }
    }
    async getUserInfoByUserName(username = String(undefined)) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('contacts.resolveUsername', {
                username
            })
        } catch (error) {
            throw error;
        }
    }
    async getUserInfoByPhone(phone = String(undefined)) {
        await this.sleep(sleep_time)
        try {
            return await this.client.call('contacts.resolvePhone', {
                phone
            })
        } catch (error) {
            throw error;
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

exports.TGApis = TGApis
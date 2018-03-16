
import TelegramBot from 'node-telegram-bot-api';
import request from 'request-promise-native';
import childProcessPromise from 'child-process-promise';
import format from 'string-template';
import mongoose from 'mongoose';
import config from '../config.json';
import messages from './messages';

import ChatSettings from './models/ChatSettings';

const NODE_ENV = process.env.NODE_ENV || 'dev';

let DB_URL = '';

if (NODE_ENV === 'dev') {
    const conf = config.mongodb.dev;
    DB_URL = `mongodb://${conf.host}:${conf.port}/${conf.db}`;
} else {
    const conf = config.mongodb.prod;
    DB_URL = `mongodb://${conf.user}:${conf.pass}@${conf.host}:${conf.port}/${conf.db}`;
}


const TOKEN = config.botToken[NODE_ENV];

const bot = new TelegramBot(TOKEN, { polling: true });
const exec = childProcessPromise.exec;

mongoose.Promise = global.Promise;
mongoose.connect(DB_URL, { useMongoClient: true })
    .then(
        () => { console.log('MongoDB is connected'); },
        (err) => { console.error(err); }
    );

function getMinerFullname(miner) {
    switch (miner) {
        case 'claymore':
            return 'Claymore’s Dual miner';
        case 'ewbf':
            return 'EWBF\'s CUDA miner';
        case 'ccminer':
            return 'CCminer';
        default:
            return '';
    }
}

function getLang(lang) {
    switch (lang) {
        case 'ru': case 'by': case 'ua':
            return 'ru';
        default:
            return 'en';
    }
}

function getTimeDiff(time) {
    let diff = Date.now() / 1000 - time
        , days = Math.floor(diff / 86400)
        , hours = ('0' + Math.floor(diff / 3600) % 24).substr(-2)
        , mins = ('0' + Math.floor(diff / 60) % 60).substr(-2)
        , secs = ('0' + Math.floor(diff) % 60).substr(-2)
    ;
    return days + 'd ' + hours + 'h ' + mins + 'm';// + secs + 's';
}

function getTimeFromMinutes(minutes) {
    let days = Math.floor(minutes / 1440)
        , hours = ('0' + Math.floor(minutes / 60) % 24).substr(-2)
        , mins = ('0' + Math.floor(minutes) % 60).substr(-2)
    ;
    return days + 'd ' + hours + 'h ' + mins + 'm';
}

function getTimeFromSeconds(seconds) {
    let days = Math.floor(seconds / 86400)
        , hours = ('0' + Math.floor(seconds / 3600) % 24).substr(-2)
        , mins = ('0' + Math.floor(seconds / 60) % 60).substr(-2)
    ;
    return days + 'd ' + hours + 'h ' + mins + 'm';
}

const defaultOptions = {
    parse_mode: 'Markdown'
};

const mainScreenOptions = {
    parse_mode: 'HTML',
    reply_markup: {
        keyboard: [['⛏']],
        resize_keyboard: true
    }
};

const languageOptions = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: '🇺🇸 English', callback_data: 'en' }],
            [{ text: '🇷🇺 Русский', callback_data: 'ru' }]
        ]
    }
};

const addOptions = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: getMinerFullname('ccminer'), callback_data: 'ccminer' }],
            [{ text: getMinerFullname('claymore'), callback_data: 'claymore' }],
            [{ text: getMinerFullname('ewbf'), callback_data: 'ewbf' }]
        ]
    }
};

const updateLang = (id, lang) => {
    return ChatSettings.findById(id)
        .then((chat) => {
            chat.language_code = lang;

            chat.save()
                .then((res) => {
                    bot.sendMessage(id, messages[lang].language_set, defaultOptions);
                })
                .catch((err) => {
                    console.error(err);
                    //TODO err message;
                });
        })
        .catch((err) => {
            console.error(err);

            //TODO err message;
        });
};

const getMinerInfo = (miner) => {
    const type = miner.type;
    let url = miner.url;

    switch (type) {
        case 'ewbf':
            return request({
                method: 'GET',
                uri: 'https://' + url + '/getstat',
                json: true
            });
        case 'claymore':
            url = url.split(':');
            return exec(`echo '{"id":0,"jsonrpc":"2.0","method":"miner_getstat2"}' | netcat -q 60 ${url[0]} ${url[1] || '' }`);
        case 'ccminer':
            url = url.split(':');
            return Promise.all([
                exec(`echo 'pool' | netcat -q 60 ${url[0]} ${url[1] || '' }`),
                exec(`echo 'summary' | netcat -q 60 ${url[0]} ${url[1] || '' }`),
                exec(`echo 'threads' | netcat -q 60 ${url[0]} ${url[1] || '' }`)
            ]);
    }
};

const addMiner = (id, type) => {
    return ChatSettings.findById(id)
        .then((chat) => {
            const lang = chat.language_code
                , url = chat.tmp.url
                , name = chat.tmp.name
                , miner = { type, url, name }
            ;

            const text = format(messages[lang].miner_added, { miner: `${name} (${url}, ${getMinerFullname(type)})` });

            chat.miners = chat.miners.concat([miner]);
            chat.tmp = {};

            chat.save()
                .then((res) => {
                    bot.sendMessage(id, text, mainScreenOptions);
                })
                .catch((err) => {
                    console.error(err);
                    //TODO err message;
                });

        })
        .catch((err) => {
            console.error(err);
            //TODO err message;
        });
};

const deleteMiner = (id, index) => {
    return ChatSettings.findById(id)
        .then((chat) => {
            const lang = chat.language_code
                , miner = chat.miners[index]
                , url = miner.url
                , name = miner.name
                , type = miner.type
            ;

            const text = format(messages[lang].miner_deleted, { miner: `${name} (${url}, ${getMinerFullname(type)})` });

            chat.miners.splice(index, 1);

            chat.save()
                .then((res) => {
                    bot.sendMessage(id, text, mainScreenOptions);
                })
                .catch((err) => {
                    console.error(err);
                    //TODO err message;
                });

        })
        .catch((err) => {
            console.error(err);
            //TODO err message;
        });
};

const getEWBFMessage = (json, lang) => {

    let message = ''
        , total_speed = 0
        , total_power = 0
        , total_accepted = 0
        , total_rejected = 0
    ;

    message += format(messages[lang].ewbf_pool, {
        server: json.current_server,
        server_status: json.server_status === 2 ? '[online]' : '[offline]',
        uptime: getTimeDiff(json.start_time)
    });

    json.result.forEach((gpu) => {
        message += format(messages[lang].ewbf_gpu, {
            speed: gpu.speed_sps,
            name: gpu.name,
            temperature: gpu.temperature,
            power: gpu.gpu_power_usage,
            accepted: gpu.accepted_shares,
            rejected: gpu.rejected_shares
        });

        total_speed += gpu.speed_sps;
        total_power += gpu.gpu_power_usage;
        total_accepted += gpu.accepted_shares;
        total_rejected += gpu.rejected_shares;
    });

    message += format(messages[lang].ewbf_total, {
        total_speed,
        total_power,
        total_efficiency: (total_speed / total_power).toFixed(2),
        total_accepted,
        total_rejected
    });

    return message;
};

const getClaymoreMessage = (json, lang) => {
    json = JSON.parse(json.stdout).result;
    let message = '';

    let total = json[2].split(';')
        , hashrate = json[3].split(';')
        , tempsAndFuns = json[6].split(';')
        , accepted = json[9].split(';')
        , rejected = json[10].split(';')
    ;

    message += format(messages[lang].claymore_pool, {
        server: json[7],
        uptime: getTimeFromMinutes(+json[1])
    });

    hashrate.forEach((rate, i) => {
        message += format(messages[lang].claymore_gpu, {
            speed: (+rate / 1000).toFixed(1),
            name: `GPU${i}`,
            temperature: tempsAndFuns[2 * i],
            fan: tempsAndFuns[(2 * i) + 1],
            accepted: accepted[i],
            rejected: rejected[i]
        });
    });

    message += format(messages[lang].claymore_total, {
        total_speed: (+total[0] / 1000).toFixed(1),
        total_accepted: total[1],
        total_rejected: total[2]
    });

    return message;
};

const getCCminerMessage = (arr, lang) => {
    let pool_arr = arr[0].stdout.split(';')
        , info_arr = arr[1].stdout.split(';')
        , cards = arr[2].stdout.split('|')
        , message = ''
        , pool = {}
        , info = {}
        , total_power = 0
        , total_efficiency = 0
    ;
    cards.pop();

    pool_arr.forEach((data) => {
        data = data.split('=');
        pool[data[0]] = data[1];
    });

    info_arr.forEach((data) => {
        data = data.split('=');
        info[data[0]] = data[1];
    });

    cards = cards.map((gpu) => {
        let obj = {};
        gpu.split(';').forEach((data) => {
            data = data.split('=');
            obj[data[0]] = data[1];
        });
        return obj;
    });

    message += format(messages[lang].ccminer_pool, {
        server: pool.POOL,
        uptime: getTimeFromSeconds(info.UPTIME)
    });

    //console.log(cards);

    cards.forEach((gpu, i) => {
        message += format(messages[lang].ccminer_gpu, {
            speed: gpu.KHS,
            name: gpu.CARD,
            temperature: +gpu.TEMP,
            fan: gpu.FAN,
            power: (+gpu.POWER / 1000).toFixed(0),
            accepted: gpu.ACC,
            rejected: gpu.REJ
        });

        total_power += +gpu.POWER;
        total_efficiency += +gpu.KHW;
    });

    message += format(messages[lang].ccminer_total, {
        total_speed: info.KHS,
        total_power: (total_power / 1000).toFixed(0),
        total_efficiency: (total_efficiency / arr.length).toFixed(2),
        total_accepted: info.ACC,
        total_rejected: info.REJ
    });

    return message;
};

const getStatMessage = (type, json, lang) => {
    switch (type) {
        case 'claymore':
            return getClaymoreMessage(json, lang);
        case 'ewbf':
            return getEWBFMessage(json, lang);
        case 'ccminer':
            return getCCminerMessage(json, lang);
        default:
            return '';
    }
};






bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
    ;

    ChatSettings.findOne({ _id: chatId })
        .then((chat) => {
            if (chat) {

                const lang = chat.language_code;
                bot.sendMessage(chatId, messages[lang].welcome_back, mainScreenOptions);

            } else {

                const lang = default_language
                    , chat = new ChatSettings({ _id: chatId, language_code: lang });

                chat.save()
                    .then((res) => {
                        bot.sendMessage(chatId, messages[lang].hello, defaultOptions);
                    })
                    .catch((err) => {
                        console.error(err);
                        //TODO err message;
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });

});

bot.onText(/\/language/, (msg) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
    ;

    ChatSettings.findById(chatId)
        .then((chat) => {
            const lang = chat.language_code;

            bot.sendMessage(chatId, messages[lang].set_language, languageOptions);

        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });
});

bot.onText(/\/add( (.+) ([^\/\s]+(\/.*)?$))?/, (msg, match) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
        , name = match[2]
        , url = match[3]
    ;

    ChatSettings.findById(chatId)
        .then((chat) => {
            const lang = chat.language_code;

            if (name && url) {
                chat.tmp = { name, url };

                chat.save()
                    .then((res) => {
                        bot.sendMessage(chatId, messages[lang].set_miner, addOptions);
                    })
                    .catch((err) => {
                        console.error(err);
                        //TODO err message;
                    });
            } else {
                bot.sendMessage(chatId, messages[lang].how_add, defaultOptions);
            }
        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });
});

bot.onText(/\/delete/, (msg) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
    ;

    ChatSettings.findById(chatId)
        .then((chat) => {
            const lang = chat.language_code
                , miners = chat.miners
            ;

            if (miners.length) {
                const keyboard = miners.map((miner, index) => {
                    return { text: miner.name, callback_data: `delete_${index}` }
                });

                bot.sendMessage(chatId, messages[lang].choose_miner, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [keyboard]
                    }
                });
            } else {
                bot.sendMessage(chatId, messages[lang].empty_miners, defaultOptions);
            }

        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });
});

bot.onText(/\/miners/, (msg) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
    ;

    ChatSettings.findById(chatId)
        .then((chat) => {
            const lang = chat.language_code
                , miners = chat.miners
            ;

            let text = messages[lang].your_miners;

            if (miners.length) {
                miners.forEach((miner) => {
                    text += ` - ${miner.name} (${miner.url}, ${getMinerFullname(miner.type)})\n`
                });

                //text += messages[lang].info;

                bot.sendMessage(chatId, text, mainScreenOptions);
            } else {
                bot.sendMessage(chatId, messages[lang].empty_miners, defaultOptions);
            }

        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
    ;

    ChatSettings.findById(chatId)
        .then((chat) => {
            const lang = chat.language_code;

            let text = messages[lang].help;

            bot.sendMessage(chatId, text, defaultOptions);

        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });
});

bot.onText(/⛏/, (msg) => {
    const chatId = msg.chat.id
        , default_language = getLang(msg.from.language_code)
    ;

    ChatSettings.findById(chatId)
        .then((chat) => {
            const lang = chat.language_code
                , miners = chat.miners
            ;

            if (!miners.length) {
                bot.sendMessage(chatId, messages[lang].empty_miners, defaultOptions);
            } else {
                miners.forEach((miner) => {
                    const url = miner.url
                        , name = miner.name
                        , type = miner.type
                    ;

                    miner.url = miner.url.replace(/(.+):\/\//, '');

                    getMinerInfo(miner)
                        .then((result) => {
                            const text = getStatMessage(type, result, lang);

                            bot.sendMessage(chatId, `<b>${name}</b>\n\n${text}`, mainScreenOptions);
                        })
                        .catch((err) => {
                            console.error(err);

                            const error = format(messages[lang].request_error, { miner: `${name} (${url}, ${getMinerFullname(type)})` });

                            bot.sendMessage(chatId, error, defaultOptions);
                        });
                });
            }
        })
        .catch((err) => {
            console.error(err);
            bot.sendMessage(chatId, messages[default_language].server_error, defaultOptions);
        });
});


bot.on('callback_query', (msg) => {

    //console.log(msg);

    const chatId = msg.message.chat.id
        , data = msg.data.split('_')
        , messageId = msg.message.message_id;

    switch (data[0]) {
        case 'en': case 'ru':
            updateLang(chatId, data[0]).then(() => {
                bot.deleteMessage(chatId, messageId);
            });
            break;
        case 'claymore': case 'ewbf': case 'ccminer':
            addMiner(chatId, data[0]).then(() => {
                bot.deleteMessage(chatId, messageId);
            });
            break;
        case 'delete':
            deleteMiner(chatId, data[1]).then(() => {
                bot.deleteMessage(chatId, messageId);
            });
            break;
    }
});

bot.on('message', (msg) => {
    //console.log(msg);
});

console.log(`Bot started, NODE_ENV: ${NODE_ENV}`);
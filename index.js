const Sequelize = require("sequelize");
const dotenv = require('dotenv');
const Random = require("random-js");
const TelegramBot = require('node-telegram-bot-api');
const winston = require('winston');
const request = require('request');
const emojiStrip = require('emoji-strip');
const ChartjsNode = require('chartjs-node')
const fx = require('money');
const currencyFormatter = require('currency-formatter');
const http = require('http');
const Promise = require('promise');
const googl = require('goo.gl');
const googleSearchParser2 = require("google-search-parser2");
const GoogleSearchParser = new googleSearchParser2(request);
const MarkovGen = require('markov-generator');
dotenv.config();
googl.setKey(process.env.GOO_GL);
winston.loggers.add('markov', {
    console: {
        level: 'silly',
        colorize: true,
        label: '[Markov]'
    },
    file: {
        filename: 'logs/markov.log'
    }
});
const db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql', logging: false
});
const bot = new TelegramBot(process.env.TOKEN, {polling: true});
const randomizer = new Random(Random.engines.mt19937().seed('fsdfbk' + Math.random()));

//Model
const Message = require("./Model/Message");
const MessageModel = new Message(db);

const User = require("./Model/User");
const UserModel = new User(db);

const Pidor = require("./Model/Pidor");
const PidorModel = new Pidor(db);

const UserChat = require("./Model/UserChat");
const UserChatModel = new UserChat(db);

//Repository
const MRepository = require("./Repository/MessageRepository");
const MessageRepository = new MRepository(MessageModel);
const URepository = require("./Repository/UserRepository");
const UserRepository = new URepository(UserModel);
const PRepository = require("./Repository/PidorRepository");
const PidorRepository = new PRepository(PidorModel, User);
const UCRepository = require("./Repository/UserChatRepository");
const UserChatRepository = new UCRepository(UserChatModel);

//Generators
const MessageGenerator = require("./Generator/MessageGenerator");
const PGenerator = require("./Generator/PidorGenerator");
const ImageGenerator = require("./Generator/ImageGenerator");
const NewsGenerator = require("./Generator/NewsGenerator");
const PidorGenerator = new PGenerator(Promise, PidorRepository, UserChatRepository);

//Strings
const catP = [
    "Вот тебе котя!",
    "Держи котю",
    "Котя - топчик",
    "СМОТРИ КАКОЙ ЗАБАВНЫЙ!",
    "Всем котю!",
    ":3"
];
const names = [
    "антон",
    "Антон",
    "антоха",
    "Антоха",
    "Тох ",
    "тох ",
    "тоха ",
    "Тоха ",
    "антонио",
    "Антонио",
];
const pidorLoading = [
    'Вызываю бога пидоров...',
    'Запускаю пидор-машину...',
    'Пидорок, приди... Я призываю тебя!',
    'Сча пидора рожу!',
    'Где-же он, наш пидор?'
];
const pidorLvl = [
    'пидорасик',
    'пидорок',
    'пидор',
    'неудержимый пидор',
    'пидорасище',
    'пидор из пидоров',
];
const pidorScenario = [
    [
        'Погодите ка, сначала нужно спасти остров!',
        '<i>4 8 15 16 23 42</i>',
        '108:00 <i>Успели...</i>',
        'Остров спасли? Спасли. И пидора короновать не забудем.',
        'Наш :lvl: это... @:username: (:first_name: :last_name:)! Ура, :lvl:!'
    ],
    [
        'Начнем наш ежедневный розыгрыш <b>#:draw:</b>!',
        'Крутим барабан, господа!',
        'Достаем номер... Итак...',
        'Наш :lvl: на следующие 24 часа теперь участник написавший :messages: сообщений...',
        '... ... @:username: (:first_name: :last_name:)! Поздравляем :first_name: с этим СОБЫТИЕМ!'
    ],
    [
        'Чо чо? Хотите подора? <i>Сейчас я вам найду</i> пидора...',
        '<i>Ох ты...</i>',
        'ЭТОГО НИКТО НЕ ОЖИДАЛ!',
        'Вы готовы?',
        'Теперь наш :lvl: - @:username: (:first_name: :last_name:)!',
        '<i>Охуеть, да?</i>',
    ],
    [
        'ТЕПЕРЬ ЭТО НЕ ОСТАНОВИТЬ!',
        '<i>Шаманим-шаманим...</i>',
        'Доступ получен. Анн<b>а</b>лирование протокола.',
        'TI PIDOR, @:username:'
    ],
    [
        'Осторожно! <b>Пидор дня</b> активирован!',
        'Сканирую...',
        'КЕК',
        'Стоять! Не двигаться! Вы объявлены <b>пидором дня</b>, @:username:',
    ],
    [
        'Сейчас поколдуем...',
        '<i>Хм...</i>',
        'Так-так, что же тут у нас...',
        'Ого, вы посмотрите только! А :lvl: дня то - @:username:',
    ],
];

bot.on('message', (msg) => {
    const chat = msg.chat.id;
    UserRepository.store(msg.from);
    if (chat < 0) {
        UserChatRepository.store(msg.from, msg.chat);
    }
    if (typeof msg.text !== 'undefined' && emojiStrip(msg.text).length > 1 && msg.text.charAt(0) !== '/') {
        let mention = new RegExp(names.join("|")).test(msg.text);
        let chance = randomizer.bool(0.1);
        MessageRepository.store(msg, names);
        if ((chance || mention) && chat !== -1001048609359) {
            bot.sendChatAction(chat, 'typing');
            (new MessageGenerator(MessageModel, msg, Promise, MarkovGen, Sequelize, winston)).get(names).then(function (res) {
                if (res !== false && res.length > 0) {
                    let options = {};
                    if (mention) {
                        options = {
                            reply_to_message_id: msg.message_id
                        };
                    }
                    setTimeout(function () {
                        bot.sendMessage(chat, res, options);
                    }, 2000);
                }
            });
        }
    }
});

bot.onText(/\/boobs/, (msg, match) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        request.get('http://api.oboobs.ru/boobs/0/1/random', function (err, res, body) {
            let json = JSON.parse(body);
            let photoLink = 'http://media.oboobs.ru/' + json[0].preview;
            const photo = request(photoLink);
            bot.sendPhoto(chat, photo, {
                caption: json[0].model
            });
        });
    }, 500);
});

bot.onText(/\/cat/, (msg, match) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        request.get('http://thecatapi.com/api/images/get?format=src', function (err, res, body) {
            const photo = request(this.uri.href);
            if (this.uri.href.indexOf('.gif') !== -1) {
                bot.sendDocument(chat, photo)
            } else {
                bot.sendPhoto(chat, photo, {
                    caption: catP[Math.floor(Math.random() * catP.length)]
                });
            }
        });
    }, 500);
});

bot.onText(/\/news/, (msg, match) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');
    setTimeout(function () {
        (new NewsGenerator(Promise, request, winston, googl)).get().then(function (news) {
            let messages = [];
            let i = 0;
            let n = 1;
            messages[i] = '10 новостей за прошедший час: \n\n';
            news.forEach(function (post) {
                messages[i] += n + ') <i>' + post.title + '</i> \n' + post.link + '\n';
                n++;
                if (messages[i].length > 4000) {
                    i++;
                }
            });
            messages.forEach(function (message) {
                bot.sendMessage(chat, message, {
                    parse_mode: 'HTML'
                });
            });

        });
    }, 500);
});

bot.onText(/\/top/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(chat, 'typing');
    MessageRepository.top(db, chat).then(function (res) {
        bot.sendMessage(chat, res, {
            parse_mode: 'HTML'
        });
    });
});

bot.onText(/\/graph_top/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(chat, 'upload_photo');
    MessageRepository.topByDays(db, chat).then(function (res) {
        let x = [];
        let y = [];
        let data = {
            type: 'line',
            bezierCurve: false,
            options: {
                plugins: false
            },
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Messages',
                        backgroundColor: "rgba(255,255,255,1)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        lineTension: 0,
                        fill: false,
                        data: []
                    }]
            }
        };
        res.forEach((value) => {
            x.push((value.day < 10 ? '0' + value.day : value.day));
            y.push(value.count);
        });
        data.data.labels = x.reverse();
        data.data.datasets[0].data = y.reverse();

        let chartNode = new ChartjsNode(1200, 800);
        chartNode.drawChart(data).then(() => {
            chartNode.getImageBuffer('image/png').then((res) => {
                bot.sendPhoto(chat, res);
            });

        });
    }).catch((err) => {
        "use strict";
        winston.error(err);
    });
});

bot.onText(/\/img(?:\@.*?)? (.*)/, (msg, match) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        (new ImageGenerator(Promise, GoogleSearchParser)).get(match[1] || 'Трактор').then(function (url) {
            request.get(url, function (err, res, body) {
                const photo = request(this.uri.href);
                bot.sendPhoto(chat, photo, {
                    reply_to_message_id: msg.message_id
                });
            });
        }).catch(function (err) {
            winston.error(err);
        });
    }, 500);
});

bot.onText(/\/curr(?:\@.*?)? (UAH|USD|BTC|EUR|RUB|uah|usd|btc|eur|rub|ETH|eth) (UAH|USD|BTC|EUR|RUB|uah|usd|btc|eur|rub|ETH|eth) ([0-9]*\.?[0-9]{0,2})/, (msg, match) => {
    let opts = {from: match[1].toUpperCase(), to: match[2].toUpperCase()};
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');
    request.get("https://openexchangerates.org/api/latest.json?app_id=" + process.env.OPENRATE_TOKEN + '&show_alternative=1', function (err, res, body) {
        setTimeout(function () {
            let openRates = JSON.parse(body);
            fx.rates = openRates.rates;
            fx.base = openRates.base;
            let res = fx.convert(+match[3], opts);
            let message = 'Из ' + currencyFormatter.format(+match[3], {code: match[1].toUpperCase()}) + ' в ' + match[2] + ': ' + currencyFormatter.format(res, {code: match[2].toUpperCase()});
            bot.sendMessage(chat, message, {
                parse_mode: 'Markdown'
            });
        }, 500);
    });
});

bot.onText(/\/pidor_top/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(msg.chat.id, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(chat, 'typing');

    PidorRepository.top(db, chat).then(function (results) {
        if (results < 1) {
            bot.sendMessage(chat, '_У вас все не пидоры... Пока.._', {
                parse_mode: 'Markdown'
            });

            return false;
        }

        let message = 'Наши <b>лучшие</b> пидоры: \n\n';
        let i = 1;
        results.forEach(function (pidor) {
            message += i + ') ' + pidor.username + ' <i>(' + pidor.first_name + ')' + '</i> - <b>' + pidor.c + '</b>\n';
            i++;
        });
        setTimeout(function () {
            bot.sendMessage(chat, message.replace(/\n$/, ""), {
                parse_mode: 'HTML'
            });
        }, 1500);
    })

});

bot.onText(/\/new_pidor/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(chat, 'typing');
    getPidor(msg);
});

http.createServer(function (req, response) {
    if (req.url.indexOf('favicon') > -1 || req.connection.remoteAddress.indexOf('127.0.0.1') === -1) {
        response.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        response.end('Ну ты и пидор...');
        return false;
    }
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    UserChatRepository.getChats().then(function (chats) {
        chats.forEach(function (chat) {
            //if (chat.chat !== -1001048609359) {
            //getPidor(chat.chat)
            //}
        })
    });
    response.end('Done');
}).listen(process.env.SERVER_PORT);

/**
 *
 * @param chat
 */
function getPidor(msg) {
    const chat = msg.chat.id;
    PidorGenerator.get(msg).then(function (res) {
        UserModel.getModel().findOne({where: {user: res.user}}).then(function (user) {
            PidorRepository.pidorCount(db, user.user).then((count) => {
                let lvl = pidorLvl[0];

                console.log(count[0]);

                if (count.count > 1 && count.count <= 3) {
                    console.log(count.count);
                    lvl = pidorLvl[1];
                } else if (count.count > 3 && count.count <= 7) {
                    lvl = pidorLvl[2];
                } else if (count.count > 7 && count.count <= 14) {
                    lvl = pidorLvl[3];
                } else if (count.count > 14 && count.count <= 20) {
                    lvl = pidorLvl[4];
                } else if (count.count > 20) {
                    lvl = pidorLvl[5];
                }


                if (res.status === 'old') {
                    setTimeout(function () {
                        bot.sendMessage(chat, (':lvl: дня - <b>' + user.first_name + ' ' + user.last_name + '</b>').replace(':lvl:', capitalizeFirstLetter(lvl)), {
                            parse_mode: 'HTML'
                        });
                    }, 2000);
                } else if (res.status === 'new') {
                    MessageRepository.countUserMessages(db, user.user).then(function (messages) {
                        console.log(messages);
                        const scenario = pidorScenario[Math.floor(Math.random() * pidorScenario.length)];
                        let timeout = 1000;
                        scenario.forEach((pmsg) => {
                            setTimeout(function () {
                                pmsg = pmsg
                                    .replace(':username:', user.username)
                                    .replace(':last_name:', user.last_name)
                                    .replace(':first_name:', user.first_name)
                                    .replace(':messages:', messages.count)
                                    .replace(':lvl:', lvl)
                                    .replace(':draw:', randomizer.integer(15, 99999));
                                bot.sendMessage(chat, pmsg, {
                                    parse_mode: 'HTML'
                                });
                            }, timeout);
                            timeout += randomizer.integer(1000, 1500);
                        });
                    });
                }
            });
        });
    }).catch(function (rej) {
        winston.error(rej);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
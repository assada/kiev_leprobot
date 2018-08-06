const Sequelize = require("sequelize");
const dotenv = require('dotenv');
const Random = require("random-js");
const TelegramBot = require('node-telegram-bot-api');
const winston = require('winston');
const request = require('request');
const emojiStrip = require('emoji-strip');
const ChartjsNode = require('chartjs-node');
const fx = require('money');
const currencyFormatter = require('currency-formatter');
const Promise = require('promise');
const googl = require('goo.gl');
const googleSearchParser2 = require("google-search-parser2");
const GoogleSearchParser = new googleSearchParser2(request);
const markovski = require('markovski');
const cache = require('memory-cache');
const natural = require('natural');
const randomPussy = require('random-vagina');
const randomAss = require('random-butt');
const MarkovNew = require('markov-strings');

//Configuring
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
const randomizer = new Random(Random.engines.mt19937().autoSeed());

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
const MessageRepository = new MRepository(MessageModel, cache);
const URepository = require("./Repository/UserRepository");
const UserRepository = new URepository(UserModel);
const PRepository = require("./Repository/PidorRepository");
const PidorRepository = new PRepository(PidorModel, User);
const UCRepository = require("./Repository/UserChatRepository");
const UserChatRepository = new UCRepository(UserChatModel);
const ERRepository = require("./Repository/ExchangeRatesRepository");
const ExchangeRatesRepository = new ERRepository(request, Promise, cache);

//Generators
const MessageGenerator = require("./Generator/MessageGenerator");
const PGenerator = require("./Generator/PidorGenerator");
const ImageGenerator = require("./Generator/ImageGenerator");
const NewsGenerator = require("./Generator/NewsGenerator");
const PidorGenerator = new PGenerator(Promise, PidorRepository, UserChatRepository);

//Strings
const catP = [
    'Вот тебе котя!',
    'Держи котю',
    'Котя - топчик',
    'СМОТРИ КАКОЙ ЗАБАВНЫЙ!',
    'Всем котю!',
    ':3',
    'Ой! Какой милаш!',
    'Котики, конечно, лучшие!'
];
const names = [
    'антон',
    'Антон',
    'антоха',
    'Антоха',
    'Тох ',
    'тох ',
    'тоха ',
    'Тоха ',
    'антонио',
    'Антонио',
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
        'Погодите-ка, сначала нужно спасти остров!',
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
        'Открываю <b>Find My PIDOR..</b>',
        '<i>Сканирую местность...</i>',
        'Ах ты сука, от меня не спрячешься!',
        ':lvl: дня - @:username: (:first_name: :last_name:)!'
    ],
    [
        'ТЕПЕРЬ ЭТО НЕ ОСТАНОВИТЬ!',
        '<i>Шаманим-шаманим...</i>',
        'Доступ получен. Анн<b>а</b>лирование протокола.',
        'TI PIDOR, @:username: (:first_name: :last_name:)'
    ],
    [
        'Осторожно! <b>Пидор дня</b> активирован!',
        'Сканирую...',
        'КЕК',
        'Стоять! Не двигаться! Вы объявлены <b>пидором дня</b>, @:username: (:first_name: :last_name:)',
    ],
    [
        'Сейчас поколдуем...',
        '<i>Хм...</i>',
        'Так-так, что же тут у нас...',
        'Ого, вы посмотрите только! А :lvl: дня то - @:username: (:first_name: :last_name:)',
    ],
    [
        'Начинаю поиск любителя техники Apple...',
        'Что-то слишком дохуя их здесь, кого бы выбрать...',
        'Выберу самого жирного!',
        ':lvl: дня - @:username: (:first_name: :last_name:)!'
    ],
    [
        'Пора наколдовать нового пидора!',
        'Смешиваю немного SEO, вейпа, смузи и заливаю в чан...',
        'Тщательно мешаю и сливаю в чат...',
        'БА-БАХ! А @:username:-то :lvl:! Который (:first_name: :last_name:)',
    ],
    [
        '甚至不要尝试翻译文本。',
        '如果您尝试 - 你会是一个同性恋的天结束。',
        '就这样吧。',
        '盖伊的一天 - @:username: (:first_name: :last_name:)!',
    ],
    [
        'Ну',
        'ладно',
        'Сейчас',
        'вылетит',
        'пидор!',
        'ВНИМАНИЕ!',
        '*ПДЫЖЬ*',
        '@:username: (:first_name: :last_name:) - :lvl: дня',
    ]
];

const weather = {
    c: 'Ясно',
    lc: 'Местами облачно',
    hc: 'Облачно',
    s: 'Местами дождь',
    lr: 'Дождь',
    hr: 'Сильный дождь',
    t: 'Гроза',
    h: 'Град',
    sl: 'Мокрый снег...',
    sn: 'Снег',
};

const errorsMessages = {
    onlyForChats: 'Не-не. Только в чатиках пидорок работает'
};

bot.on('left_chat_participant', (msg) => {
    const chat = msg.chat.id;
    UserChatRepository.destroy(msg.from, msg.chat);
    bot.sendChatAction(chat, 'typing');
    setTimeout(function () {
        bot.sendMessage(chat, 'Слабак!', {
            reply_to_message_id: msg.message_id
        });
    }, 2000);
});

bot.on('message', (msg) => {
    const chat = msg.chat.id;
    UserRepository.store(msg.from);
    if (chat < 0) {
        UserChatRepository.store(msg.from, msg.chat);
    }
    if (typeof msg.text !== 'undefined' && emojiStrip(msg.text).length > 1 && msg.text.charAt(0) !== '/') {
        let mention = new RegExp(names.join("|")).test(msg.text);
        if ((randomizer.bool(0.02) || mention)
            && (chat === -1001126011592 || chat === -1001121487098 || chat > 0)
        ) {
            (new MessageGenerator(MessageModel, msg, Promise, natural, Sequelize, winston, MarkovNew)).get(names).then(function (replay) {
                if (replay !== false && replay.length > 0) {
                    bot.sendChatAction(chat, 'typing');
                    let options = {};
                    if (mention) {
                        options = {
                            reply_to_message_id: msg.message_id
                        };
                    }
                    setTimeout(function () {
                        bot.sendMessage(chat, capitalizeFirstLetter(replay), options);
                    }, 2000);
                }
            }).catch((err) => {
                "use strict";
                winston.error(err);
            });
        }
        MessageRepository.store(msg);
    }
});

bot.onText(/^\/boobs(?:\@.*?)?$/, (msg) => {
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

bot.onText(/^\/cat(?:\@.*?)?$/, (msg, match) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        request.get('http://thecatapi.com/api/images/get?format=src', function (err, res, body) {
            const photo = request(this.uri.href);
            if (this.uri.href.indexOf('.gif') !== -1) {
                bot.sendDocument(chat, photo)
            } else {
                bot.sendPhoto(chat, photo, {
                    caption: randomizer.pick(catP)
                });
            }
        });
    }, 500);
});

bot.onText(/^\/pussy(?:\@.*?)?$/, (msg) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        randomPussy()
            .then(url => {
                request.get(url, function (err, res, body) {
                    const photo = request(this.uri.href);
                    if (this.uri.href.indexOf('.gif') !== -1) {
                        bot.sendDocument(chat, photo)
                    } else {
                        bot.sendPhoto(chat, photo, {
                            caption: randomizer.pick(catP)
                        });
                    }
                });
            })
    }, 500);
});
bot.onText(/^\/butt(?:\@.*?)?$/, (msg) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        randomAss()
            .then(url => {
                request.get(url, function (err, res, body) {
                    const photo = request(this.uri.href);
                    if (this.uri.href.indexOf('.gif') !== -1) {
                        bot.sendDocument(chat, photo)
                    } else {
                        bot.sendPhoto(chat, photo);
                    }
                });
            })
    }, 500);
});

bot.onText(/^\/news(?:\@.*?)?$/, (msg, match) => {
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

bot.onText(/^\/weather(?:\@.*?)?$/, (msg) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');
    setTimeout(() => {
        request({
            url: 'https://www.metaweather.com/api/location/924938/',
            json: true
        }, function (error, response, jsonWeather) {
            console.log(jsonWeather);
            let today = jsonWeather.consolidated_weather[0];
            const message = 'Погода в Киеве сегодня:\n' +
                'От ' + Math.round(today.min_temp) + '°C до ' + Math.round(today.max_temp) + '°C \n' +
                weather[today.weather_state_abbr] + '\n' +
                'Давление около ' + Math.round(today.air_pressure) + ' миллибар\n' +
                'Влажность ' + Math.round(today.humidity) + '%';
            bot.sendMessage(chat, message, {
                parse_mode: 'HTML'
            });
        });
    }, 500);
});

function mode(arr) {
    return arr.reduce(function (current, item) {
        var val = current.numMapping[item] = (current.numMapping[item] || 0) + 1;
        if (val > current.greatestFreq) {
            current.greatestFreq = val;
            current.mode = item;
        }
        return current;
    }, {mode: null, greatestFreq: -Infinity, numMapping: {}}, arr).mode;
}

function processRate(data, id) {
    var exchanger = data.organizations.filter(function (obj) {
        return obj.orgType === 2;
    });
    var bid = [];
    var ask = [];

    for (var key in exchanger) {
        var e = exchanger[key];
        if (e.currencies.hasOwnProperty(id)) {
            bid.push(parseFloat(e.currencies.USD.bid));
            ask.push(parseFloat(e.currencies.USD.ask));
        }
    }

    bid = mode(bid);
    ask = mode(ask);

    return {
        ask: ask.toFixed(2),
        bid: bid.toFixed(2)
    };
}

bot.onText(/^\/rate(?:\@.*?)?$/, function () {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');

    setTimeout(() => {
        request({
            url: 'http://resources.finance.ua/ru/public/currency-cash.json',
            json: true
        }, function (error, response, body) {
            console.log(body);

            const USD = processRate(body, 'USD');
            const EUR = processRate(body, 'EUR');
            const RUB = processRate(body, 'RUB');

            const message = 'Средние наличные курсы валют:\n' +
                '<b>USD:</b>' + USD.ask + '/' + USD.bid + '\n' +
                '<b>EUR:</b>' + EUR.ask + '/' + EUR.bid + '\n' +
                '<b>RUB:</b>' + RUB.ask + '/' + RUB.bid;
            bot.sendMessage(chat, message, {
                parse_mode: 'HTML'
            });
        });
    }, 500);
});

bot.onText(/^\/top(?:\@.*?)?$/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, errorsMessages.onlyForChats);
        return false;
    }
    bot.sendChatAction(chat, 'typing');
    MessageRepository.top(db, chat).then(function (res) {
        bot.sendMessage(chat, res, {
            parse_mode: 'HTML'
        });
    });
});

bot.onText(/^\/graph_top(?:\@.*?)?$/, (msg) => {
    const chat = msg.chat.id;
    const cacheKey = "_" + chat + "-graph";
    if (chat > 0) {
        bot.sendMessage(chat, errorsMessages.onlyForChats);
        return false;
    }
    bot.sendChatAction(chat, 'upload_photo');
    MessageRepository.topByDays(db, chat).then(function (res) {
        new Promise((ok) => {
            if (cache.get(cacheKey) === null) {
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
                    chartNode.getImageBuffer('image/png').then((buffer) => {
                        winston.info('Creating cache for graph');
                        cache.put(cacheKey, buffer, 60 * 60 * 1000);
                        ok(buffer);
                    });
                });
            } else {
                winston.info('Using cache for graph');
                ok(cache.get(cacheKey));
            }
        }).then((photo) => {
            bot.sendPhoto(chat, photo);
        });
    }).catch((err) => {
        "use strict";
        winston.error(err);
    });
});

bot.onText(/^\/img(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;

    console.log(match);

    let query = 'Трактор';
    if (match.length > 0) {
        query = match[1].trim();
    }
    bot.sendChatAction(chat, 'upload_photo');
    setTimeout(function () {
        (new ImageGenerator(Promise, GoogleSearchParser)).get(query).then(function (url) {
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

bot.onText(/^\/curr(?:\@.*?)? (UAH|USD|BTC|EUR|RUB|uah|usd|btc|eur|rub|ETH|eth) (UAH|USD|BTC|EUR|RUB|uah|usd|btc|eur|rub|ETH|eth) ([0-9]*\.?[0-9]{0,2})/, (msg, match) => {
    let opts = {from: match[1].toUpperCase(), to: match[2].toUpperCase()};
    const chat = msg.chat.id;

    ExchangeRatesRepository.get(process.env.OPENRATE_TOKEN).then((openRates) => {
        bot.sendChatAction(chat, 'typing');
        setTimeout(function () {
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

bot.onText(/^\/pidor_top(?:\@.*?)?$/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(msg.chat.id, errorsMessages.onlyForChats);
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

bot.onText(/^\/pidor/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, errorsMessages.onlyForChats);
        return false;
    }
    bot.sendChatAction(chat, 'typing');
    getPidor(msg);
});

bot.onText(/^\/fuckoff/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, errorsMessages.onlyForChats);
        return false;
    }

    console.log(msg);
});

/**
 *
 * @param msg
 */
function getPidor(msg) {
    const chat = msg.chat.id;
    PidorGenerator.get(msg).then(function (res) {
        if (res.status === 'old' && res.user === msg.from.id) {
            bot.sendMessage(chat, 'Страдай педрилка! Только не пидор может запустить пидор-машину! ХА-ХА-ХА-ХА', {
                parse_mode: 'HTML'
            });
        } else {
            UserModel.getModel().findOne({where: {user: res.user}}).then(function (user) {
                PidorRepository.pidorCount(db, user.user, chat).then((count) => {
                    let lvl = pidorLvl[0];
                    if (count > 1 && count <= 3) {
                        console.log(count);
                        lvl = pidorLvl[1];
                    } else if (count > 3 && count <= 7) {
                        lvl = pidorLvl[2];
                    } else if (count > 7 && count <= 14) {
                        lvl = pidorLvl[3];
                    } else if (count > 14 && count <= 20) {
                        lvl = pidorLvl[4];
                    } else if (count > 20) {
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
                            const scenario = randomizer.pick(pidorScenario);
                            let timeout = 1000;
                            scenario.forEach((pmsg) => {
                                setTimeout(function () {
                                    pmsg = pmsg
                                        .replace(/:username:/g, user.username)
                                        .replace(/:last_name:/g, user.last_name)
                                        .replace(/:first_name:/g, user.first_name)
                                        .replace(/:messages:/g, messages[0].count)
                                        .replace(/:lvl:/g, lvl)
                                        .replace(/:draw:/g, randomizer.integer(15, 99999));
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
        }

    }).catch(function (rej) {
        winston.error(rej);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
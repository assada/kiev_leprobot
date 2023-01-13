process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
const imageSearch = require('image-search-google');
const cache = require('memory-cache');
const natural = require('natural');
const MarkovNew = require('markov-strings').default;
const Sphinx = require('sphinx-promise');
const Twitter = require('twitter');

const NodeCache = require('node-cache');
const newCache = new NodeCache();

//Configuring
dotenv.config();

const imageClient = new imageSearch(process.env.CSE_ID, process.env.GOOGLE_API_KEY);

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const sphinx = new Sphinx({
    host: process.env.SPHINX_HOST, // default sphinx host
    port: process.env.SPHINX_PORT  // default sphinx TCP port
});

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
    dialect: 'mysql', logging: false,
    dialectOptions: {
        charset: 'utf8mb4'
    },
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

const Tweet = require("./Model/Tweet");
const TweetModel = new Tweet(db);

const UserChat = require("./Model/UserChat");
const UserChatModel = new UserChat(db);

//Repository
const MRepository = require("./Repository/MessageRepository");
const MessageRepository = new MRepository(MessageModel, cache);
const TRepository = require("./Repository/TweetRepository");
const TweetRepository = new TRepository(TweetModel);
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
const SphinxMessageGenerator = require("./Generator/SphinxMessageGenerator");
const PGenerator = require("./Generator/PidorGenerator");
const ImageGenerator = require("./Generator/ImageGenerator");
const NewsGenerator = require("./Generator/NewsGenerator");
const CoronaGenerator = require("./Generator/CoronaGenerator");
const PidorGenerator = new PGenerator(Promise, PidorRepository, UserChatRepository);

//Strings
const catP = [
    'Ось тобі котя!',
    'Тримай котю',
    'Котя - топчик',
    'ДИВИСЬ ЯКИЙ КЛАСНИЙ!',
    'Всім котю!',
    ':3',
    'Ой! Який мілаш!',
    'Котики, точно кращі!'
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
    'підорасік',
    'підорок',
    'підор',
    'головний підор',
    'підорасіще',
    'підор із підорів',
];
const pidorScenario = [
    [
        'Стривай-но, спочатку потрібно врятувати острів!',
        '<i>4 8 15 16 23 42</i>',
        '108:00 <i>Встигли...</i>',
        'Острів урятували? Врятували. І підора коронувати не забудемо.',
        'Наш :lvl: це... @:username: (:first_name: :last_name:)! Ура, :lvl:!'
    ],
    [
        'Почнемо наш щоденний розіграш <b>#:draw:</b>!',
        'Крутимо барабан, панове!',
        'Дістаємо номер... Отже...',
        'Наш :lvl: на наступні 24 години тепер учасник, який написав :messages: повідомлень...',
        '... ... @:username: (:first_name: :last_name:)! Вітаємо :first_name: з цією ПОДІЄЮ!'
    ],
    [
        'Чо чо? Хочете підора? <i>Зараз я вам знайду</i> підора...',
        '<i>Ох ти...</i>',
        'ЦЬОГО НІХТО НЕ ЧЕКАВ!',
        'Ви готові?',
        'Тепер наш :lvl: - @:username: (:first_name: :last_name:)!',
        '<i>Охуїти, так?</i>',
    ],
    [
        'Відкриваю <b>Find My PIDOR..</b>',
        '<i>Сканую місцевість...</i>',
        'Ах ти сука, від мене не сховаєшся!',
        ':lvl: дня - @:username: (:first_name: :last_name:)!'
    ],
    [
        'ТЕПЕР ЦЕ НЕ Зупинити!',
        '<i>шаманним-шаманним...</i>',
        'Доступ отримано. <b>Аннал</b>ювання протоколу.',
        'TI PIDOR, @:username: (:first_name: :last_name:)'
    ],
    [
        'Обережно! <b>Підор дня</b> активовано!',
        'Сканую...',
        'КЕК',
        'Стояти! Не рухатись! Ви оголошені <b>підором дня</b>, @:username: (:first_name: :last_name:)',
    ],
    [
        'Зараз почаруємо...',
        '<i>Хм...</i>',
        'Так-так, що ж тут у нас...',
        'Ого, ви подивіться тільки! А :lvl: дня то - @:username: (:first_name: :last_name:)',
    ],
    [
        'Починаю пошук любителя техніки Apple...',
        'Щось надто дохуючи їх тут, кого б вибрати...',
        'Виберу найжирнішого!',
        ':lvl: дня - @:username: (:first_name: :last_name:)!'
    ],
    [
        'Настав час начарувати нового підора!',
        'Змішую трохи SEO, вейпа, смузі та заливаю в чан...',
        'Ретельно заважаю і зливаю в чат...',
        'БА-БАХ! А @:username:-то :lvl:! Котрий (:first_name: :last_name:)',
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
        'Зараз',
        'вилетить',
        'підор!',
        'УВАГА!',
        '*ПДИЖЬ*',
        '@:username: (:first_name: :last_name:) - :lvl: дня',
    ]
];

const weather = {
    c: 'Ясно',
    lc: 'Подекуди хмарно',
    hc: 'Хмарно',
    s: 'Подекуди дощ',
    lr: 'Дощ',
    hr: 'Сильний дощ',
    t: 'Гроза',
    h: 'Град',
    sl: 'Мокрий сніг...',
    sn: 'Сніг',
};

const errorsMessages = {
    onlyForChats: 'Ні ні. Тільки в чатиках працює',
    tweet: {
        exist: 'Було вже!',
        same: 'Ти чо ебанутий?',
        notReply: 'Ну бля і чо мені твітити то? Покажи повідомлення, дурилко!',
        tooLong: 'Ти ебанутий? Твіттер може лише 140 символів! Поссав на тебе!',
        onlyText: 'Та ну ебана. Я лише в текст умію. Поки...'
    },
};

let pidorMutex = {};

bot.on('left_chat_participant', (msg) => {
    const chat = msg.chat.id;
    if (UserChatRepository.destroy(msg.from, msg.chat)) {
        bot.sendChatAction(chat, 'typing');
        setTimeout(function () {
            bot.sendMessage(chat, 'Слабак!', {
                reply_to_message_id: msg.message_id
            });
        }, 2000);
    } else {
        console.error('Error removing row from UserChat');
    }
});


bot.on('message', (msg) => {
    const chat = msg.chat.id;
    UserRepository.store(msg.from);
    if (chat < 0) {
        UserChatRepository.store(msg.from, msg.chat);
    }
    if (typeof msg.text !== 'undefined' && emojiStrip(msg.text).length > 1 && msg.text.charAt(0) !== '/') {
        let mention = new RegExp(names.join("|")).test(msg.text);
        if ((randomizer.bool(0.013) || mention || chat > 0)
            && (chat === -1001126011592 || chat === -1001121487098 || chat === -1001048609359 || chat === -1001482707691 || chat > 0)
        ) {
            (new SphinxMessageGenerator(msg, Promise, natural, winston, MarkovNew, sphinx)).get(names).then(
                function (replay) {
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
                }
            ).catch((err) => {
                console.log(err);
            });
        }
        MessageRepository.store(msg);
    }

    if (typeof msg.photo !== 'undefined') {
        let ImgID = msg.photo[msg.photo.length - 1].file_id;
        if (!ImgID) {
            console.log('No image ID!');
        }
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

bot.onText(/^\/news(?:\@.*?)?$/, (msg, match) => {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');
    setTimeout(function () {
        (new NewsGenerator(Promise, request, winston)).get().then(function (news) {
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
            url: 'https://www.metaweather.com/api/location/924938/', //TODO: fix!
            json: true
        }, function (error, response, jsonWeather) {
            if(error) {
                console.log(error);
                return;
            }
            try {
                let today = jsonWeather.consolidated_weather[0];
                const message = 'Погода у Києві сьогодні:\n' +
                    'Від ' + Math.round(today.min_temp) + '°C до ' + Math.round(today.max_temp) + '°C \n' +
                    weather[today.weather_state_abbr] + '\n' +
                    'Тиск біля ' + Math.round(today.air_pressure) + ' мілібар\n' +
                    'Вологість ' + Math.round(today.humidity) + '%';
                bot.sendMessage(chat, message, {
                    parse_mode: 'HTML'
                });
            } catch (e) {
                bot.sendMessage(chat, "Схоже апі зламане... А у мене помилка: " + e.message, {
                    parse_mode: 'Markdown'
                });
            }

        });
    }, 100);
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

bot.onText(/^\/rate(?:\@.*?)?$/, function (msg) {
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');

    setTimeout(() => {
        request({
            url: 'https://dead.guru/api/rates',
            json: true
        }, function (error, response, body) {

            const message = 'Коротше, мінфін дані по баригам:\n' +
                '<b>USD:</b> ' + body.bid + '/' + body.ask + '\n'
                + '\n\n Приходьте за годину!'

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
    try {
        MessageRepository.topByDays(db, chat).then(function (res) {
            new Promise((ok) => {
                if (cache.get(cacheKey) == null) {
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
            bot.sendMessage(chat, "Схоже апі зламане... А у мене помилка: " + err.message, {
                parse_mode: 'Markdown'
            });
        });
    } catch (e) {
        bot.sendMessage(chat, "Схоже апі зламане... А у мене помилка: " + e.message, {
            parse_mode: 'Markdown'
        });
    }

});

bot.onText(/^\/img(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;
    try {
        let query = 'Трактор';
        console.log(match);
        if (typeof match[1] !== 'undefined') {
            query = match[1].trim();
        }
        bot.sendChatAction(chat, 'upload_photo');
        setTimeout(function () {
            (new ImageGenerator(Promise, imageClient, newCache)).get(query).then(function (url) { //TODO: fix!
                request.get(url, function (err, res, body) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    const photo = request(this.uri.href);
                    bot.sendPhoto(chat, photo, {
                        reply_to_message_id: msg.message_id
                    });
                });
            }).catch(function (err) {
                winston.error(err);
                bot.sendMessage(chat, "Сам шукай це гівно!", {
                    parse_mode: 'Markdown'
                });
            });
        }, 500);
    } catch (e) {
        bot.sendMessage(chat, "Сам шукай це гівно! А у мене помилка: " + e.message, {
            parse_mode: 'Markdown'
        });
    }
});

bot.onText(/^\/pussy(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;

    try {
        bot.sendChatAction(chat, 'upload_photo');
        const photo = request('https://dead.guru/api/pussy/random/image');
        bot.sendPhoto(chat, photo, {
            reply_to_message_id: msg.message_id
        });
    } catch (e) {
        bot.sendMessage(chat, "Щось із кицьками...", {
            parse_mode: 'Markdown'
        });
    }
});

bot.onText(/^\/butt(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;

    try {
        bot.sendChatAction(chat, 'upload_photo');
        const photo = request('https://dead.guru/api/butt/random/image');
        bot.sendPhoto(chat, photo, {
            reply_to_message_id: msg.message_id
        });
    } catch (e) {
        bot.sendMessage(chat, "Щось із попками...", {
            parse_mode: 'Markdown'
        });
    }
});

bot.onText(/^\/trap(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;

    try {
        bot.sendChatAction(chat, 'upload_photo');
        const photo = request('https://dead.guru/api/trap/random/image');
        bot.sendPhoto(chat, photo, {
            reply_to_message_id: msg.message_id
        });
    } catch (e) {
        bot.sendMessage(chat, "Щось із дівчатами...", {
            parse_mode: 'Markdown'
        });
    }
});

bot.onText(/^\/hole(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;

    try {
        bot.sendChatAction(chat, 'upload_photo');
        const photo = request('https://dead.guru/api/asshole/random/image');
        bot.sendPhoto(chat, photo, {
            reply_to_message_id: msg.message_id
        });
    } catch (e) {
        bot.sendMessage(chat, "Щось із дирками...", {
            parse_mode: 'Markdown'
        });
    }
});

bot.onText(/^\/penis(?:\@.*?)?(\s.*)?/, (msg, match) => {
    const chat = msg.chat.id;

    try {
        bot.sendChatAction(chat, 'upload_photo');
        const photo = request('https://dead.guru/api/penis/random/image');
        bot.sendPhoto(chat, photo, {
            reply_to_message_id: msg.message_id
        });
    } catch (e) {
        bot.sendMessage(chat, "Змія покинула чат...", {
            parse_mode: 'Markdown'
        });
    }
});

bot.onText(/^\/convert(?:\@.*?)? (UAH|USD|BTC|EUR|RUB|uah|usd|btc|eur|rub|ETH|eth) (UAH|USD|BTC|EUR|RUB|uah|usd|btc|eur|rub|ETH|eth) ([0-9]*\.?[0-9]{0,2})/, (msg, match) => {
    let opts = {from: match[1].toUpperCase(), to: match[2].toUpperCase()};
    const chat = msg.chat.id;

    ExchangeRatesRepository.get(process.env.OPENRATE_TOKEN).then((openRates) => {
        bot.sendChatAction(chat, 'typing');
        fx.rates = openRates.rates;
        fx.base = openRates.base;
        let res = fx.convert(+match[3], opts);
        let message = 'Із ' + currencyFormatter.format(+match[3], {code: match[1].toUpperCase()}) + ' у ' + match[2] + ': ' + currencyFormatter.format(res, {code: match[2].toUpperCase()});
        bot.sendMessage(chat, message, {
            parse_mode: 'Markdown'
        });
    }).catch((e) => {console.log(e); bot.sendMessage(chat, "Щось не так... А у мене помилка: " + e.message, {
        parse_mode: 'Markdown'
    });});
});

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

bot.onText(/^\/pidor_top(?:\@.*?)?$/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(msg.chat.id, errorsMessages.onlyForChats);
        return false;
    }
    bot.sendChatAction(chat, 'typing');

    PidorRepository.top(db, chat).then(function (results) {
        console.log(results);
        if (results < 1) {
            bot.sendMessage(chat, '_У вас всі не підори... Поки що..._', {
                parse_mode: 'Markdown'
            });

            return false;
        }

        let message = 'Наші <b>мжвячні</b> підорочки: \n\n';
        let i = 1;
        results.forEach(function (pidor) {
            message += i + ') ' + (pidor.username !== '' ? pidor.username : '');
            message += ' <i>(' + htmlEntities(pidor.first_name) + ')' + '</i> - <b>' + pidor.c + '</b>\n';
            i++;
        });
        console.log(message);
        setTimeout(function () {
            bot.sendMessage(chat, message.replace(/\n$/, ""), {
                parse_mode: 'HTML'
            });
        }, 1500);
    })

});

bot.onText(/^\/pidor(@|$)/, (msg, match) => {
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
});

bot.onText(/^[Тт]вит$/, (msg, match) => {
    const chat = msg.chat.id;
    if (chat > 0) {
        bot.sendMessage(chat, errorsMessages.onlyForChats);
        return false;
    }

    if (typeof msg.reply_to_message !== 'undefined') {
        let reply = msg.reply_to_message;

        if (!undef(reply.photo) || !undef(reply.sticker) || !undef(reply.document) || !undef(reply.animation) || !undef(reply.location) || !undef(reply.poll) || !undef(reply.audio) || undef(reply.text)) {
            bot.sendMessage(chat, errorsMessages.tweet.onlyText, {
                reply_to_message_id: msg.message_id
            });
            return false;
        }

        if (reply.text.length > 140) {
            bot.sendMessage(chat, errorsMessages.tweet.tooLong, {
                reply_to_message_id: msg.message_id
            });
            return false;
        }

        if (msg.from.id === reply.from.id) {
            bot.sendMessage(chat, errorsMessages.tweet.same, {
                reply_to_message_id: msg.message_id
            });
            return false;
        }

        let tweet = {
            message: reply.message_id,
            chat: reply.chat.id,
            user: msg.from.id,
            text: reply.text
        };

        TweetRepository.exists(tweet).then(function (res) {
            if (res.length > 0) {
                bot.sendMessage(chat, errorsMessages.tweet.exist, {
                    reply_to_message_id: msg.message_id
                });
                return false;
            }

            client.post('statuses/update', {status: tweet.text}, function (error, tweet, response) {
                if (!error) {
                    console.log(tweet);
                    let stored = TweetRepository.store(tweet);

                    if (stored) {
                        bot.sendMessage(chat, 'Дякую за ваш внесок!', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                }

                console.log(error);
            });
        });

    } else {
        bot.sendMessage(chat, errorsMessages.tweet.notReply, {
            reply_to_message_id: msg.message_id
        });
        return false;
    }

});

/**
 * Check if variable is undefined
 *
 * @param variable
 * @returns {boolean}
 */
function undef(variable) {
    return typeof variable === 'undefined';
}

bot.onText(/^\/corona/, (msg, match) => { //TODO: fix!
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');
    (new CoronaGenerator(Promise, request, winston)).all().then(function (data) {
        console.log(data);
        let msg = 'Загалом по довбойобам:\n'
            + '<b>Заразилося:</b> ' + data.cases + '\n'
            + '<b>Відкинулося:</b> ' + data.deaths + '\n'
            + '<b>Повстало:</b> ' + data.recovered
        ;
        bot.sendMessage(chat, msg, {
            parse_mode: 'HTML'
        });
    }).catch((e) => {
        bot.sendMessage(chat, "Схоже апі зламане... А у мене помилка: " + e.message, {
            parse_mode: 'Markdown'
        });
        console.log(e);
    });
});

bot.onText(/^\/corona/, (msg, match) => { //TODO: fix!
    const chat = msg.chat.id;
    bot.sendChatAction(chat, 'typing');
    (new CoronaGenerator(Promise, request, winston)).ua().then(function (data) {
        console.log(data);
        let msg = 'Чо там у хохлов:\n'
            + '<b>Заразилося:</b> ' + data.cases + '\n'
            + '<b>Сьогодні заразилося:</b> ' + data.todayCases + '\n'
            + '<b>Відкинулося:</b> ' + data.deaths + '\n'
            + '<b>Сьогодні померло:</b> ' + data.todayDeaths + '\n'
            + '<b>Повстало:</b> ' + data.recovered + '\n\n'
            + 'ПІЗДЕЦЬ!!!11'
        ;
        bot.sendMessage(chat, msg, {
            parse_mode: 'HTML'
        });
    }).catch((e) => {
        bot.sendMessage(chat, "Схоже апі зламане... А у мене помилка: " + e.message, {
            parse_mode: 'Markdown'
        });
        console.log(e);
    });
});

function getPidor(msg) {
    const chat = msg.chat.id;

    PidorGenerator.get(msg).then(function (res) {
        if (res.status === 'old' && res.user === msg.from.id) {
            bot.sendMessage(chat, 'Страждай педрилка! Тільки не підор може запустити підор-машину! ХА-ХА-ХА-ХА', {
                parse_mode: 'HTML'
            });
        } else {
            UserModel.getModel().findOne({where: {user: res.user}}).then(function (user) {
                PidorRepository.pidorCount(db, user.user, chat).then((count) => {
                    let lvl = pidorLvl[0];
                    if (count > 1 && count <= 3) {
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

                    if (user.user === 173485093 || user.user === 263839313) {
                        lvl = 'Принцесска'
                    }

                    if (res.status === 'old') {
                        setTimeout(function () {
                            bot.sendMessage(chat, (':lvl: дня - <b>' + htmlEntities(user.first_name) + ' ' + htmlEntities(user.last_name) + '</b>').replace(':lvl:', capitalizeFirstLetter(lvl)), {
                                parse_mode: 'HTML'
                            });
                        }, 2000);
                    } else if (res.status === 'new') {
                        let ti = process.hrtime();
                        if (chat in pidorMutex && ti[0]-2000 <= pidorMutex[chat]) {
                            return false;
                        }
                        pidorMutex[chat] = ti[0];
                        bot.getChatMember(chat, user.user).then((ChatMember) => {
                            if (
                                ChatMember.status === 'creator' ||
                                ChatMember.status === 'administrator' ||
                                ChatMember.status === 'member'
                            ) {
                                PidorRepository.store(chat, user.user);
                                MessageRepository.countUserMessages(db, user.user).then(function (messages) {
                                    const scenario = randomizer.pick(pidorScenario);
                                    let timeout = 1000;
                                    scenario.forEach((pmsg) => {
                                        setTimeout(function () {
                                            pmsg = pmsg
                                                .replace(/:username:/g, user.username)
                                                .replace(/:last_name:/g, htmlEntities(user.last_name))
                                                .replace(/:first_name:/g, htmlEntities(user.first_name))
                                                .replace(/:messages:/g, messages[0].count)
                                                .replace(/:lvl:/g, lvl)
                                                .replace(/:draw:/g, randomizer.integer(15, 99999));
                                            bot.sendMessage(chat, pmsg, {
                                                parse_mode: 'HTML'
                                            });
                                            delete pidorMutex[chat];
                                        }, timeout);
                                        timeout += randomizer.integer(1000, 1500);
                                    });
                                });
                            } else {
                                delete pidorMutex[chat];
                                console.info('Pidor retry');
                                return getPidor(msg);
                            }
                        }).catch((error) => {
                            delete pidorMutex[chat];
                            console.error(error);
                            getPidor(msg);
                        });
                    }
                });
            });
        }

    }).catch(function (rej) {
        bot.sendMessage(chat, "Схоже апі зламане... А у мене помилка: " + rej, {
            parse_mode: 'Markdown'
        });
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

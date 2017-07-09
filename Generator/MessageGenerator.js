const Promise = require('promise');

const MarkovGen = require('markov-generator');
const Sequelize = require("sequelize");
const winston = require('winston');
winston.add(winston.transports.File, { filename: 'markov.log' });

const regex = /[^a-zA-Zа-яА-я]+/g;

module.exports = class MessageGenerator {
    constructor(MessageModel, msg) {
        this.MessageModel = MessageModel;
        this.msg = msg;
    }

    get(names) {
        let debug = {msg: this.msg};

        let Message = this.MessageModel.getModel();

        let m = [];

        let words = this.msg.text.split(' ');
        words = words.filter(function (item) {
            return item.length > 3 && names.indexOf(item.toLowerCase()) === -1;
        });
        words = words.map(function (x) {
            return x.replace(regex, '');
        });

        debug.parsedWords = words;

        // let word = words[Math.floor(Math.random() * words.length)];
        let constr = [];

        words.forEach(function(word) {
            constr.push({$like: '%' + word + '%'})
        });

        debug.query = constr;

        return new Promise(function (fulfill, reject) {
            Message.findAll({where: {body: {$or: constr}}, limit: 100, order: Sequelize.literal('RAND()'), attributes: ['body']}).then(Messages => {
                Messages.forEach(function (item) {
                    m.push(item.body)
                });
                debug.messages = m;

                if (m.length > 1) {
                    let markov = new MarkovGen({
                        input: m,
                        minLength: 4
                    });
                    let str = markov.makeChain(4);
                    debug.result = str;
                    fulfill(str);
                } else {
                    reject(false);
                    debug.result = false;
                    console.log('Мало данных');
                }
                winston.log('info', debug);
            });
        });
    }
};
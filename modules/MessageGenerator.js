const Promise = require('promise');

const MarkovGen = require('markov-generator');

const regex = /[^a-zA-Zа-яА-я]+/g;

module.exports = class MessageGenerator {
    constructor(MessageModel, msg) {
        this.MessageModel = MessageModel;
        this.msg = msg;
    }

    get(names) {
        let Message = this.MessageModel.getModel();

        let m = [];

        let words = this.msg.text.split(' ');
        words = words.filter(function (item) {
            return item.length > 3 && names.indexOf(item.toLowerCase()) === -1;
        });
        words = words.map(function (x) {
            return x.replace(regex, '');
        });

        console.log(words);

        let word = words[Math.floor(Math.random() * words.length)];
        console.log(word);


        return new Promise(function (fulfill, reject) {
            Message.findAll({where: {body: {$like: '%' + word + '%'}}, limit: 100, attributes: ['body']}).then(Messages => {
                Messages.forEach(function (item) {
                    m.push(item.body)
                });

                if (m.length > 1) {
                    let markov = new MarkovGen({
                        input: m,
                        minLength: 4
                    });
                    let str = markov.makeChain(4);
                    fulfill(str);
                } else {
                    reject(false);
                }
            });
        });
    }
};
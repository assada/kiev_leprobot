'use strict';

/**
 *
 * @type {MessageGenerator}
 */
module.exports = class MessageGenerator {
    constructor(MessageModel, msg, Promise, natural, Sequelize, winston, markov) {
        this.winston = winston.loggers.get('category1');
        this.Sequelize = Sequelize;
        this.MarkovGen = markov;
        this.tokenizer = new natural.WordTokenizer();
        this.Promise = Promise;
        this.MessageModel = MessageModel;
        this.msg = msg;
    }

    /**
     *
     * @param {*} names
     * @returns {Promise}
     */
    get(names) {
        const t = this;
        let constr = [];
        let debug = {msg: this.msg};
        let Message = this.MessageModel.getModel();
        let m = [];
        this.winston.log('debug', typeof this.tokenizer);
        let words = this.tokenizer.tokenize(this.msg.text);
        words = words.filter(function (item) {
            return item.length > 2 && names.indexOf(item.toLowerCase()) === -1;
        });

        debug.parsedWords = words;
        words.forEach(function (word) {
            if (word.length > 2) {
                constr.push({like: t.Sequelize.fn('LOWER', t.Sequelize.literal('\'% ' + word.toLowerCase() + ' %\''))});
            }
            // constr.push({like: t.Sequelize.fn('LOWER', t.Sequelize.literal('\'%' + words[words.length - 1].toLowerCase() + '%\''))});
        });

        debug.query = constr;

        return new t.Promise(function (fulfill, reject) {
            Message.findAll({
                where: t.Sequelize.where(t.Sequelize.fn('LOWER', t.Sequelize.col('body')), {$or: constr}),
                order: t.Sequelize.literal('RAND()'),
                attributes: ['body']
            }).then(Messages => {
                Messages.forEach(function (item) {
                    m.push(item.body.replace('Антон', '')) //TODO: Regex
                });
                // debug.messages = m;

                if (m.length > 1) {
                    // var dataset = t.MarkovGen.newDataSet();
                    let nGram = 3;
                    // dataset.trainOnString(m.toString(), nGram, false);
                    let count = Math.floor(Math.random() * (15 - 4) + 4);
                    // let string = dataset.generate(count, false);
                    let mark = new t.MarkovGen(3, false, m.toString());
                    let string = mark.generate();
                    debug.result = string;
                    // dataset.clearData();
                    fulfill(string);
                } else {
                    reject(false);
                    debug.result = false;
                    t.winston.warn('Мало данных');
                }
                t.winston.log('debug', debug);
            });
        });
    }
};
'use strict';

/**
 *
 * @type {MessageGenerator}
 */
module.exports = class MessageGenerator {
    constructor(MessageModel, msg, Promise, natural, Sequelize, winston) {
        this.winston = winston.loggers.get('category1');
        this.Sequelize = Sequelize;
        this.MarkovGen = natural.NGrams;
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
    get (names) {
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
            constr.push({like: t.Sequelize.fn('LOWER', t.Sequelize.literal('\'%' + word.toLowerCase() + '%\''))})
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
                debug.messages = m;

                if (m.length > 1) {
                    let strings = t.MarkovGen.ngrams(m.toString().split(' '), 7, null, '.');
                    debug.result = strings;
                    fulfill(strings);
                } else {
                    reject(false);
                    debug.result = false;
                    t.winston.warn('Мало данных');
                }
                // t.winston.log('debug', debug);
            });
        });
    }
};
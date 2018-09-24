'use strict';

/**
 *
 * @type {MessageGenerator}
 */
module.exports = class MessageGenerator {
    /**
     *
     * @param MessageModel MessageModel
     * @param msg
     * @param Promise Promise
     * @param natural
     * @param Sequelize Sequelize
     * @param winston
     * @param markov
     */
    constructor(MessageModel, msg, Promise, natural, Sequelize, winston, markov) {
        this.winston = winston.loggers.get('markov');
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
        /**
         * @type MessageModel Message
         */
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
        });
        let test = words.join(',');

        let wordsWhere = t.Sequelize.literal('MATCH(`body`) AGAINST(\'' + test + '\' IN NATURAL LANGUAGE MODE)');
        let lengthWhere = t.Sequelize.literal('CHAR_LENGTH(`body`) > 10');


        return new t.Promise(function (fulfill, reject) {
            Message.findAll({
                where: t.Sequelize.and({
                    wordsWhere,
                    lengthWhere
                }),
                order: t.Sequelize.literal('RAND()'),
                limit: 60000,
                attributes: ['body']
            }).then(Messages => {
                Messages.forEach(function (item) {
                    m.push(item.body.replace('Антон', '')) //TODO: Regex
                });
                debug.messages = m.length;

                if (m.length > 1) {
                    const options = {
                        minWords: 3,
                        minScore: 25,
                        filter: result => {
                            return result.string.endsWith('.');
                        }
                    };

                    const markov = new t.MarkovGen(m, options);
                    markov.buildCorpus().then(() => {
                        markov.generateSentence().then(result => {
                            debug.result = result.string;
                            fulfill(result.string);
                        }).catch(() => {
                            reject(false);
                            debug.result = false;
                            t.winston.warn('generateSentence: Мало данных');
                        });
                    }).catch(() => {
                        reject(false);
                        debug.result = false;
                        t.winston.warn('buildCorpus: Мало данных');
                    });
                } else {
                    reject(false);
                    debug.result = false;
                    t.winston.warn('messagesCount: Мало данных');
                }
                t.winston.log('debug', debug);
            });
        });
    }
};
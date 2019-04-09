'use strict';

/**
 *
 * @type {MessageGenerator}
 */
module.exports = class SphinxMessageGenerator {
    /**
     * @param msg
     * @param Promise Promise
     * @param natural
     * @param winston
     * @param markov
     * @param sphinx
     */
    constructor(msg, Promise, natural, winston, markov, sphinx) {
        this.sphinx = sphinx;
        this.winston = winston.loggers.get('markov');
        this.MarkovGen = markov;
        this.tokenizer = new natural.WordTokenizer();
        this.Promise = Promise;
        this.msg = msg;
    }

    get(names) {
        const t = this;
        let debug = {msg: this.msg};
        let words = this.tokenizer.tokenize(this.msg.text);
        words = words.filter(function (item) {
            return item.length > 2 && names.indexOf(item.toLowerCase()) === -1;
        });
        debug.parsedWords = words;
        return new t.Promise(function (fulfill, reject) {
            t.sphinx.query(words.join(' | '), {
                limits: {
                    limit: 60000 // default is 20 as documented
                },
            }).then(result => {
                if ('matches' in result) {
                    let messages = t._extractColumn(t._extractColumn(result.matches, 'attrs'), 'body');
                    if (result.matches.length > 1) {
                        const markov = new t.MarkovGen(messages, {stateSize: 3});
                        markov.buildCorpus();
                        let message = messages[Math.floor(Math.random() * messages.length)];
                        debug.generated = false;
                        try {
                            message = markov.generate(
                                {
                                    maxTries: 50, // Give up if I don't have a sentence after 20 tries (default is 10)
                                    filter: (r) => {
                                        return r.string.split(' ').length >= 5 &&
                                            r.string.split(' ').length < 100 &&
                                            r.string.endsWith('.')
                                    }
                                }
                            ).string;
                            debug.generated = true;
                        } catch (e) {
                            debug.error = e;
                        }


                        debug.result = message;
                        console.log(debug);
                        fulfill(message);
                    }

                }
            }).catch(console.error.bind(console));
        });
    }

    _extractColumn(arr, column) {
        return arr.map(x => x[column])
    }
};

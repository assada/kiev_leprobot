'use strict';

const Promise = require("promise");

module.exports = class TweetRepository {
    constructor(Tweet) {
        this.Tweet = Tweet.getModel();
    }

    /**
     * Store message
     * @param {object} tweet
     * @returns {boolean}
     */
    store(tweet) {
        this.Tweet.sync().then(() => {
            return this.Tweet.create({
                message: tweet.message,
                chat: tweet.chat,
                body: typeof tweet.text !== 'undefined' ? tweet.text : null,
                user: tweet.user
            });
        });


        return true;
    }

    /**
     *
     * @param {object} tweet
     * @returns {boolean}
     */
    exists(tweet) {
        const t = this.Tweet;

        return new Promise(function (fulfill, reject) {
            t.sync().then(() => {

                const res = t.findAll({
                    where: {
                        body: tweet.text,
                    },
                    order: [
                        ['id', 'DESC']
                    ],
                    limit: 1
                });

                fulfill(res);
            });
        });
    }
};

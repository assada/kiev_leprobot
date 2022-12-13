'use strict';

/**
 *
 * @type {ExchangeRatesRepository}
 */
module.exports = class ExchangeRatesRepository {
    constructor(request, Promise, cache) {
        this.request = request;
        this.Promise = Promise;
        this.cache = cache;
    }

    get(token) { //process.env.OPENRATE_TOKEN
        const t = this;
        return new this.Promise((result, reject) => {
            try {
                if (t.cache.get('ExchangeRates') === null) {
                    t.request.get("https://openexchangerates.org/api/latest.json?app_id=" + token + '&show_alternative=1', function (err, res, body) {
                        if (err) reject(err);
                        t.cache.put('ExchangeRates', body, 43200000);
                        result(JSON.parse(body));
                    });
                } else {
                    result(JSON.parse(t.cache.get('ExchangeRates')));
                }
            } catch (e) {
                reject(e);
            }

        });
    }
};

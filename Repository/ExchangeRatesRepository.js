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
        return new this.Promise((result) => {
            if (t.cache.get('ExchangeRates') === null) {
                console.log('creating cache');
                t.request.get("https://openexchangerates.org/api/latest.json?app_id=" + token + '&show_alternative=1', function (err, res, body) {
                    t.cache.put('ExchangeRates', body, 43200000);
                    result(JSON.parse(body));
                });
            } else {
                console.log('using cache');
                result(JSON.parse(t.cache.get('ExchangeRates')));
            }
        });
    }
};
const Promise = require('promise');
const request = require('request'), cheerio = require('cheerio');
const winston = require('winston');

module.exports = class NewsGenerator {
    get() {
        winston.info('Loading news');
        return new Promise(function (fulfill, reject) {
            request({uri: 'https://www.ukr.net/news/dat/kiev/1/', method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    let result = [];
                    /*let $ = cheerio.load(page);

                    console.log(page);

                    $('section .im-tl-bk .im-tl').each(function (i, elem) {
                        let $this = $(this);
                        if ($this.find('.im-pr .im-pr-ds').text() !== '') {
                            let $a = $this.find('a');
                            let text = $a.text();
                            let link = $a.attr('href');
                            console.log(text + ': ' + link);
                            result.push({title: text, link: link})
                        }
                    });*/

                    let json = JSON.parse(page);

                    let tops = json.tops;

                    tops.filter(function (top) {
                        return typeof top.Dops !== 'undefined';
                    });

                    tops.forEach(function (topic) {
                        result.push({title: topic.Title, link: topic.Url})
                    });

                    console.log(result);

                    fulfill(result);

                });
        });
    }
};
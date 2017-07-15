const Promise = require('promise');
const request = require('request'), cheerio = require('cheerio');

module.exports = class NewsGenerator {
    get() {
        return new Promise(function (fulfill, reject) {
            request({uri: 'https://www.ukr.net/news/kiev.html', method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    let $ = cheerio.load(page);

                    $('section .im-tl-bk .im-tl').each(function (i, elem) {
                        let $this = $(this);
                        if ($this.find('.im-pr .im-pr-ds').text() !== '') {
                            let $a = $this.find('a');
                            let text = $a.text();
                            let link = $a.attr('href');
                            console.log(text + ': ' + link)
                        }
                    })

                });
        });
    }
};
const repositories = require('../repositories');
const Random = require("random-js");

class PidorService {
    async getPidor(chatId, userId) {
        return new Promise((resolve, reject) => {
            repositories.PidorRepository.get(chatId).then(function (res) {
                if (res.length > 0) {
                    resolve({status: 'old', user: res[0].dataValues.user});
                } else {
                    repositories.UserChatRepository.getActiveUser(chatId, userId).then(function (res) {
                        if (res.length > 0) {
                            const randomizer = new Random.Random(Random.MersenneTwister19937.autoSeed());
                            const user = randomizer.pick(res);
                            resolve({status: 'new', user: user.dataValues.user});
                        } else {
                            resolve({status: 'not_found', user: null});
                        }
                    }).catch(function (err) {
                        logger.error('PidorService: Error in getPidor:', err);
                        reject(err);
                    });
                }
            }).catch(function (err) {
                logger.error('PidorService: Error in getPidor:', err);
                reject(err);
            });
        });
    }
}

module.exports = PidorService;
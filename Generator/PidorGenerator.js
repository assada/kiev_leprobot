'use strict';

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository) {
        this.PidorRepository = PidorRepository;
        this.UserRepository = UserRepository;
    }

    get(msg) {
        this.UserRepository.getActiveUser().then(users => {
            let user = users[Math.floor(Math.random() * users.length)];
            console.log(user.dataValues.username);
        }); //TODO: Promise

    }
};
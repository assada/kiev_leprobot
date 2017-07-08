'use strict';

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository) {
        this.PidorRepository = PidorRepository;
        this.UserRepository = UserRepository;
    }

    get(msg) {
        let users = this.UserRepository.getActiveUser().then(users => {
            console.log(users)
        }); //TODO: Promise
        let user = users[Math.floor(Math.random() * users.length)];
        console.log(user.fist_name);
    }
};
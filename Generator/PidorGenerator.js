'use strict';

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository) {
        this.PidorRepository = PidorRepository;
        this.UserRepository = UserRepository;
    }

    get(msg) {
        let users = this.UserRepository.getActiveUser(); //TODO: Promise
        console.log(users);
    }
};
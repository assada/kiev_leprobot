'use strict';

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository) {
        this.msg = msg;
        this.PidorRepository = PidorRepository;
        this.UserRepository = UserRepository;
    }

    get(msg) {
        let users = this.UserRepository.getActiveUser();
        console.log(users);
    }
};
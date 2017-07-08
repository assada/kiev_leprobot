'use strict';

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository, msg) {
        this.msg = msg;
        this.PidorRepository = new PidorRepository;
        this.UserRepository = new UserRepository;
    }

    get() {
        let users = this.UserRepository.getActiveUser();
        console.log(users);
    }
};
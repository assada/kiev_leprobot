'use strict';

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository, msg) {
        this.msg = msg;
        this.PidorRepository = PidorRepository;
        this.UserRepository = UserRepository;
    }

    get() {
        let users = this.UserRepository.getActiveUser();
        console.log(users);
    }
};
'use strict';

module.exports = class UserStore {
    constructor(User){
        this.User = User.getModel();
    }

    store(msg) {

        this.User.sync().then(() => {
            // Table created
            return this.User.findOrCreate({where: {
                user: msg.from.id,
                first_name: msg.from.first_name,
                last_name: msg.from.last_name,
                username: msg.from.username,
                language_code: msg.from.language_code
            }});
        });

        return true;
    }
}
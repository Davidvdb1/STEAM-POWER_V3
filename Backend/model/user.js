const utility = require("../util/utility");

class User {
    constructor({id = undefined, username, email, password, role}, validate = true) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.username || typeof this.username !== 'string') {
            throw new Error('Ongeldige gebruikersnaam');
        }
        if (!this.email || !utility.validateEmail(this.email)) {
            throw new Error('Ongeldig e-mailadres');
        }
        if (!this.password || typeof this.password !== 'string') {
            throw new Error('Ongeldig wachtwoord');
        }
        if (!['ADMIN', 'TEACHER'].includes(this.role)) {
            throw new Error('Ongeldige rol');
        }
    }

    static from(prismaUser) {
        return new User(prismaUser);
    }
}

module.exports = User;
const utility = require("../util/utility");

class User {
    constructor({id = undefined, username, email, password, role}) {
        if (!username || typeof username !== 'string') {
            throw new Error('Ongeldige gebruikersnaam');
        }
        if (!email || !utility.validateEmail(email)) {
            throw new Error('Ongeldig e-mailadres');
        }
        if (!password || typeof password !== 'string') {
            throw new Error('Ongeldig wachtwoord');
        }
        if (!['ADMIN', 'TEACHER'].includes(role)) {
            throw new Error('Ongeldige rol');
        }

        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    static from(prismaUser) {
        return new User(prismaUser);
    }
}

module.exports = User;
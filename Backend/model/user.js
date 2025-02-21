const utility = require("../util/utility");

class User {
    constructor({id = null, username, email, password, role}) {
        this._id = id;
        this._username = username;
        this._email = email;
        this._password = password;
        this._role = role;
    }

    get id() {
        return this._id;
    }

    get username() {
        return this._username;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get role() {
        return this._role;
    }

    set id(id) {
        this._id = id;
    }

    set username(username) {
        if (!username || typeof username !== 'string') {
            throw new Error('Ongeldige gebruikersnaam');
        }
        this._username = username;
    }

    set email(email) {
        if (!email || !utility.validateEmail(email)) {
            throw new Error('Ongeldig e-mailadres');
        }
        this._email = email;
    }

    set password(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Ongeldig wachtwoord');
        }
        this._password = password;
    }

    set role(role) {
        if (!['ADMIN', 'TEACHER', 'GUEST'].includes(role)) {
            throw new Error('Ongeldige rol');
        }
        this._role = role;
    }

    static from(prismaUser) {
        return new User(prismaUser);
    }
}

module.exports = User;
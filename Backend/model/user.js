const utility = require("../util/utility");

class User {
    constructor({id, username, email, password, role}) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
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
        if (!username || typeof username !== 'string') {
            throw new Error('Wachtwoord moet minstens 6 tekens lang zijn');
        }
        this._password = password;
    }

    set role(role) {
        if (['ADMIN', 'TEACHER', 'GUEST'].contains(role)) {
            throw new Error('Ongeldige rol');
        }
        this._role = role;
    }

    static from(prismaUser) {
        return new User(prismaUser);
    }
}

module.exports = User;
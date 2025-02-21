class Group {
    constructor({id = null, name, code = null}) {
        this._id = id;
        this._name = name;
        this._code = code;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get code() {
        return this._code;
    }

    set name(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Ongeldige gebruikersnaam');
        }
        this._name = name;
    }

    set code(code) {
        this._code = code;
    }

    static from(prismaUser) {
        return new User(prismaUser);
    }
}

module.exports = Group;
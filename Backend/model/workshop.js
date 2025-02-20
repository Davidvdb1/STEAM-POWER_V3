class Workshop {
    constructor({id = null, name, markdown}) {
        this._id = id;
        this._name = name;
        this._markdown = markdown;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get markdown() {
        return this._markdown;
    }

    set id(id) {
        this._id = id;
    }

    set name(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Ongeldige naam');
        }
        this._name = name;
    }

    set markdown(markdown) {
        if (!markdown || typeof markdown !== 'string') {
            throw new Error('Ongeldige markdown');
        }
        this._markdown = markdown;
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
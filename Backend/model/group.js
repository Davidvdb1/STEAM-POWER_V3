class Group {
    constructor({id = null, name, code = null}) {
        if (!name || typeof name !== 'string') {
            throw new Error('Ongeldige naam');
        }

        this.id = id;
        this.name = name;
        this.code = code;
    }

    static from(prismaGroup) {
        return new Group(prismaGroup);
    }
}

module.exports = Group;
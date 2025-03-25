class Group {
    constructor({id = undefined, name, description = "", code = undefined}, validate = true) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.code = code;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.name || typeof this.name !== 'string') {
            throw new Error('Ongeldige naam');
        }
    }

    static from(prismaGroup) {
        return new Group(prismaGroup);
    }
}

module.exports = Group;
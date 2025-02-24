class Workshop {
    constructor({id = undefined, name, markdown}, validate = true) {
        this.id = id;
        this.name = name;
        this.markdown = markdown;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.name || typeof this.name !== 'string') {
            throw new Error('Ongeldige naam');
        }
        if (!this.markdown || typeof this.markdown !== 'string') {
            throw new Error('Ongeldige markdown');
        }
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
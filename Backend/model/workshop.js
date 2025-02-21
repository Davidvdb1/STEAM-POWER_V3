class Workshop {
    constructor({id = null, name, markdown}) {
        if (!name || typeof name !== 'string') {
            throw new Error('Ongeldige naam');
        }
        if (!markdown || typeof markdown !== 'string') {
            throw new Error('Ongeldige markdown');
        }

        this.id = id;
        this.name = name;
        this.markdown = markdown;
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
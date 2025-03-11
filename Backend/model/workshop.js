class Workshop {
    constructor({id = undefined, html}) {
        this.id = id;
        this.html = html;
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
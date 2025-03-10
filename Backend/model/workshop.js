class Workshop {
    constructor({id = undefined, html}, validate = true) {
        this.id = id;
        this.html = html;
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
class Workshop {
    constructor({id = undefined, title, html}) {
        this.id = id;
        this.html = html;
        this.title = title;
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
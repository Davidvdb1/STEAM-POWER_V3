class Workshop {
    constructor({id = undefined, title, html, archived, position, campId}) {
        this.id = id;
        this.html = html;
        this.title = title;
        this.archived = archived;
        this.position = position;
        this.campId = campId;
    }

    static from(prismaWorkshop) {
        return new Workshop(prismaWorkshop);
    }
}

module.exports = Workshop;
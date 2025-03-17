class Question {
    constructor({ id = undefined, title, description, picture, wattage, score, active = true }, validate = true) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.wattage = parseInt(wattage);
        this.score = parseInt(score);
        this.active = active;

        if (validate) {
            this.validate();
        }
    }

    validate() {
        let error = "";
        if (!this.title || this.title.trim() === "") {
            error += "Title is required\n";
        }
        if (!this.description || this.description.trim() === "") {
            error += "Description is required\n";
        }
        if (typeof this.wattage !== 'number' || this.wattage <= 0) {
            error += "Wattage must be a positive number\n";
        }
        if (typeof this.score !== 'number' || this.score < 0) {
            error += "Score must be a non-negative number\n";
        }
        if (typeof this.active !== 'boolean') {
            error += "Active must be a boolean\n";
        }

        if (error.length > 0) {
            throw new Error(error);
        }
    }

    static from(prismaQuestion) {
        return new Question(prismaQuestion);
    }
}

module.exports = Question;
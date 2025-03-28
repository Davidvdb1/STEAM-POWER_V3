class Question {
    constructor({ id = undefined, title, description, windQuestion, waterQuestion, solarQuestion, picture, wattage, score, active = true }, validate = true) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.windQuestion = windQuestion;
        this.waterQuestion = waterQuestion;
        this.solarQuestion = solarQuestion;
        this.picture = typeof picture === 'string' ? picture : '';
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
        if (!this.windQuestion || this.windQuestion.trim() === "") {
            error += "Wind question is required\n";
        }
        if (!this.waterQuestion || this.waterQuestion.trim() === "") {
            error += "Water question is required\n";
        }
        if (!this.solarQuestion || this.solarQuestion.trim() === "") {
            error += "Solar question is required\n";
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
        if (typeof this.picture !== 'string' || this.picture.trim() === "") {
            error += "Picture must be a non-empty string\n";
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
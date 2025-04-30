class Question {
    constructor({ id = undefined, title, description, questionStatement, energyType, picture, wattage, score, maxTries, active = true }, validate = true) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.questionStatement = questionStatement;
        this.energyType = energyType;
        this.picture = typeof picture === 'string' ? picture : '';
        this.wattage = parseInt(wattage);
        this.score = parseInt(score);
        this.maxTries = parseInt(maxTries);
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
        if (!this.questionStatement || this.questionStatement.trim() === "") {
            error += "Question statement is required\n";
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
        if (typeof this.maxTries !== 'number' || this.maxTries < 0) {
            error += "Max tries must be a non-negative number\n";
        }
        if (this.type !== 'SOLAR' && this.type !== 'WIND' && this.type !== 'WATER') {
            error += 'Invalid energy type';
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
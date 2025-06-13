class Question {
    constructor({ id = undefined, title, description, questionStatement, energyType, picture, wattage, score, maxTries, errorMargin = 0.5, active = true }, validate = true) {
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
        this.errorMargin = parseFloat(errorMargin);

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
        if (this.energyType !== 'SOLAR' && this.energyType !== 'WIND' && this.energyType !== 'WATER') {
            error += 'Invalid energy type';
        }
        if (typeof this.errorMargin !== 'number' || this.errorMargin < 0 || this.errorMargin > 1) {
            error += "Error margin must be a number between 0 and 1\n";
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
class Answer {
    constructor({ id = undefined, questionId, groupId, answerValue = 0, energyReading = 0, isCorrect = undefined, errorMargin = undefined }, validate = true) {
        this.id = id;
        this.questionId = questionId;
        this.groupId = groupId;
        this.answerValue = parseInt(answerValue);
        this.energyReading = parseInt(energyReading);

        this.isCorrect = isCorrect;
        if (validate) {
            this.validate();
        }
    }

    checkAnswerValue(energyRequired) {
        const lowerBound = energyRequired - (energyRequired * 0.05);
        const upperBound = energyRequired + (energyRequired * 0.05);
        this.isCorrect = this.answerValue * this.energyReading >= lowerBound && this.answerValue * this.energyReading <= upperBound;
        this.errorMargin = (this.answerValue * this.energyReading - energyRequired) / energyRequired * 100;
    }

    validate() {
        let error = "";
        if (this.answerValue < 0) {
            error += "Answer value cannot be negative";
        }
        if (this.energyReading < 0) {
            error += "Energy reading cannot be negative";
        }
        if (!this.groupId || typeof this.groupId === 'undefined') {
            error += "Group ID is required\n";
        }
        if (!this.questionId || typeof this.questionId === 'undefined') {
            error += "Question ID is required\n";
        }

        if (error.length > 0) {
            throw new Error(error);
        }

    }

    static from(prismaAnswer) {
        return new Answer({
            id: prismaAnswer.id,
            questionId: prismaAnswer.questionId,
            groupId: prismaAnswer.groupId,
            answerValue: prismaAnswer.answerValue,
            energyReading: prismaAnswer.energyReading,
            isCorrect: prismaAnswer.isCorrect
        }, false);
    }
}

module.exports = Answer;
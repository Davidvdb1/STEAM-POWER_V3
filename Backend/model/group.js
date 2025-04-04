class Group {
    constructor({ id = undefined, name, members = "", microbitId = "", code = undefined, bonusScore = 0 }, validate = true) {
        this.id = id;
        this.name = name;
        this.members = members;
        this.microbitId = microbitId;
        this.code = code;
        this.bonusScore = bonusScore;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.name || typeof this.name !== 'string') {
            throw new Error('Ongeldige naam');
        }

        if (this.microbitId) {
            if (this.microbitId.length !== 5) {
                throw new Error('Ongeldige microbitId');
            }
            const constonants = ["t","p","g","v","z"]
            const vowels = ["a","e","i","o","u"]
            for (let i = 0; i < 5; i++) {
                const char = this.microbitId[i].toLowerCase();
                if (i%2 ? !vowels.includes(char) : !constonants.includes(char)) {
                    throw new Error('Ongeldige microbitId');
                }
            }
        }
    }

    static from(prismaGroup) {
        return new Group(prismaGroup);
    }
}

module.exports = Group;
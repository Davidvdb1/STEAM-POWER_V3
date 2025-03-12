class EnergyData {
    constructor({ id = undefined, groupId, value, time }, validate = true) {
        this.id = id;
        this.groupId = groupId;
        this.value = value;
        this.time = time;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.groupId || typeof this.groupId !== 'string') {
            throw new Error('Invalid groupId');
        }
        if (!this.value || typeof this.value !== 'number') {
            throw new Error('Invalid value');
        }
        if (!this.time || !(this.time instanceof Date)) {
            throw new Error('Invalid time');
        }
    }

    static from(prismaEnergyData) {
        return new EnergyData(prismaEnergyData, validate = false);
    }
}

module.exports = EnergyData;
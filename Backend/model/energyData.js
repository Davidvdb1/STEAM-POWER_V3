class EnergyData {
    constructor({ id = undefined, groupId, value, time, type, pin }, validate = true) {
        this.id = id;
        this.groupId = groupId;
        this.value = value;
        this.time = time;
        this.type = type;
        this.pin = pin;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.groupId || typeof this.groupId !== 'string') {
            throw new Error('Invalid groupId');
        }
        if (typeof this.value !== 'number') {
            throw new Error('Invalid value');
        }
        if (!this.time || !(this.time instanceof Date)) {
            throw new Error('Invalid time');
        }
        if (this.type !== 'SOLAR' && this.type !== 'WIND' && this.type !== 'WATER') {
            throw new Error('Invalid type');
        }
    }

    static from(prismaEnergyData) {
        return new EnergyData(prismaEnergyData, false);
    }
}

module.exports = EnergyData;
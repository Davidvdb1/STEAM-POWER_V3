class EnergyData {
    constructor({ id = undefined, imestamp = undefined, value, type }) {
        this.id = id;
        this.timestamp = timestamp;
        this.value = value;
        this.type = type;
    }

    validate() {
        if (!this.timestamp || !this.value || !this.type) {
            throw new Error('Invalid energy data');
        }
    }
}
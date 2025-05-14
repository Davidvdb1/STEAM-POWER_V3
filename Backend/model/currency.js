class Currency {
    constructor({id = undefined, greenEnergy, greyEnergy, coins}, validate = true) {
        this.id = id;
        this.greenEnergy = greenEnergy;
        this.greyEnergy = greyEnergy;
        this.coins = coins;
        if (validate) {
            this.validate();
        }
    }

    validate() {
        if (!this.greenEnergy || typeof this.greenEnergy !== 'float') {
            throw new Error('Ongeldige greenEnergy');
        }
        if (!this.greyEnergy || typeof this.greyEnergy !== 'float') {
            throw new Error('Ongeldige greyEnergy');
        }
        if (!this.coins || typeof this.coins !== 'float') {
            throw new Error('Ongeldige Coins');
        }
    }

    static from(prismaCurrency) {
        return new Camp(prismaCurrency);
    }
}

module.exports = Currency;

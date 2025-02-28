class Camp {
    constructor({id = undefined, workshops = [], name, startDate, endDate, address, startTime, endTime, minAge, maxAge, picture, archived}) {
        this.id = id;
        this.workshops = workshops;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.address = address;
        this.startTime = startTime;
        this.endTime = endTime;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.picture = picture;
        this.archived = archived;
    }

    // validate() {
    //     if (!this.name || typeof this.name !== 'string') {
    //         throw new Error('Ongeldige naam');
    //     }
    //     if (!this.startDate || !(this.startDate instanceof Date)) {
    //         throw new Error('Ongeldige startdatum');
    //     }
    //     if (!this.endDate || !(this.endDate instanceof Date)) {
    //         throw new Error('Ongeldige einddatum');
    //     }
    //     if (!this.address || typeof this.address !== 'string') {
    //         throw new Error('Ongeldig adres');
    //     }
    //     if (!this.startTime || typeof this.startTime !== 'string') {
    //         throw new Error('Ongeldige starttijd');
    //     }
    //     if (!this.endTime || typeof this.endTime !== 'string') {
    //         throw new Error('Ongeldige eindtijd');
    //     }
    //     if (!this.minAge || typeof this.minAge !== 'number') {
    //         throw new Error('Ongeldige minimum leeftijd');
    //     }
    //     if (!this.maxAge || typeof this.maxAge !== 'number') {
    //         throw new Error('Ongeldige maximum leeftijd');
    //     }
    //     if (!this.picture || typeof this.picture !== 'string') {
    //         throw new Error('Ongeldige afbeelding');
    //     }
    //     if (typeof this.archived !== 'boolean') {
    //         throw new Error('Ongeldige waarde');
    //     }
    // }

    static from(prismaCamp) {
        return new Camp(prismaCamp);
    }
}

module.exports = Camp;

class Camp {
    constructor({id = null, name, startDate, endDate, address, startTime, endTime, minAge, maxAge, picture, archived}) {
        if (!name || typeof name !== 'string') {
            throw new Error('Ongeldige naam');
        }
        if (!startDate || !(startDate instanceof Date)) {
            throw new Error('Ongeldige startdatum');
        }
        if (!endDate || !(endDate instanceof Date)) {
            throw new Error('Ongeldige einddatum');
        }
        if (!address || typeof address !== 'string') {
            throw new Error('Ongeldig adres');
        }
        if (!startTime || typeof startTime !== 'string') {
            throw new Error('Ongeldige starttijd');
        }
        if (!endTime || typeof endTime !== 'string') {
            throw new Error('Ongeldige eindtijd');
        }
        if (!minAge || typeof minAge !== 'number') {
            throw new Error('Ongeldige minimum leeftijd');
        }
        if (!maxAge || typeof maxAge !== 'number') {
            throw new Error('Ongeldige maximum leeftijd');
        }
        if (!picture || typeof picture !== 'string') {
            throw new Error('Ongeldige afbeelding');
        }
        if (typeof archived !== 'boolean') {
            throw new Error('Ongeldige waarde');
        }

        this.id = id;
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

    static from(prismaCamp) {
        return new Camp(prismaCamp);
    }
}

module.exports = Camp;
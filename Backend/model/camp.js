class Camp {
    constructor({id, name, startDate, endDate, address, startTime, endTime, minAge, maxAge, picture, archived}) {
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

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get startDate() {
        return this._startDate;
    }

    get endDate() {
        return this._endDate;
    }

    get address() {
        return this._address;
    }

    get startTime() {
        return this._startTime;
    }

    get endTime() {
        return this._endTime;
    }

    get minAge() {
        return this._minAge;
    }

    get maxAge() {
        return this._maxAge;
    }

    get picture() {
        return this._picture;
    }

    get archived() {
        return this._archived;
    }

    set id(id) {
        this._id = id;
    }

    set name(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Ongegeldige naam');
        }
        this._name = name;
    }

    set startDate(startDate) {
        if (!startDate || startDate instanceof Date) {
            throw new Error('Ongeldige startdatum');
        }
        this._startDate = startDate;
    }

    set endDate(endDate) {
        if (!endDate || endDate instanceof Date) {
            throw new Error('Ongeldige einddatum');
        }
        this._endDate = endDate;
    }

    set address(address) {
        if (!address || typeof address !== 'string') {
            throw new Error('Ongeldig adres');
        }
        this._address = address;
    }

    set startTime(startTime) {
        if (!startTime || typeof startTime !== 'string') {
            throw new Error('Ongeldige starttijd');
        }
        this._startTime = startTime;
    }

    set endTime(endTime) {
        if (!endTime || typeof endTime !== 'string') {
            throw new Error('Ongegeldige eindtijd');
        }
        this._endTime = endTime;
    }

    set minAge(minAge) {
        if (!minAge || typeof minAge !== 'number') {
            throw new Error('Ongeldige minimum leeftijd');
        }
        this._minAge = minAge;
    }

    set maxAge(maxAge) {
        if (!maxAge || typeof maxAge !== 'number') {
            throw new Error('Ongeldige maximum leeftijd');
        }
        this._maxAge = maxAge;
    }

    set picture(picture) {
        if (!picture || typeof picture !== 'string') {
            throw new Error('Ongeldige afbeelding');
        }
        this._picture = picture;
    }

    set archived(archived) {
        if (!archived || typeof archived !== 'boolean') {
            throw new Error('Ongeldige waarde');
        }
        this._archived = archived;
    }

    static from(prismaCamp) {
        return new Camp(prismaCamp);
    }
}

module.exports = Camp;
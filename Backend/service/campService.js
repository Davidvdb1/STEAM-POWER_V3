const campRepository = require('../repository/campRepository');
const Camp = require('../model/camp');
const Workshop = require('../model/workshop');

class CampService {
    async create(campData) {
        campData.startDate = new Date(campData.startDate);
        campData.endDate = new Date(campData.endDate);

        const newCamp = new Camp(campData);
        return await campRepository.create(newCamp);
    }

    async getById(id, includeWorkshops = false) {
        console.log('includeWorkshops', includeWorkshops);
        return await campRepository.findById(id, includeWorkshops);
    }

    async getAll(includeWorkshops = false) {
        return await campRepository.findAll(includeWorkshops);
    }
}

module.exports = new CampService();

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

    async getById(id) {
        return await campRepository.findById(id);
    }

    async getAll() {
        return await campRepository.findAll();
    }
}

module.exports = new CampService();

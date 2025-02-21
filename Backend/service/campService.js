const campRepository = require('../repository/campRepository');
const Camp = require('../model/camp');

class CampService {
    async create(campData) {
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

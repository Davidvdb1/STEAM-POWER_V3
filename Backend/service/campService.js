const campRepository = require('../repository/campRepository');
const bcrypt = require('bcryptjs');

class CampService {
    async create(campData) {
        return await campRepository.create(campData);
    }

    async getById(id) {
        return await campRepository.findById(id);
    }

    async getAll() {
        return await campRepository.findAll();
    }
}

module.exports = new CampService();

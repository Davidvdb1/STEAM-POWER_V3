const kampRepository = require('../repository/kampRepository');
const bcrypt = require('bcryptjs');

class KampService {
    async create(kampData) {
        return await kampRepository.create(kampData);
    }

    async getById(id) {
        return await kampRepository.findById(id);
    }

    async getAll() {
        return await kampRepository.findAll();
    }
}

module.exports = new KampService();

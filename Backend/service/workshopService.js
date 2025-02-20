const workshopRepository = require('../repository/workshopRepository');
const bcrypt = require('bcryptjs');

class WorkshopService {
    async create(workshopData) {
        return await workshopRepository.create(workshopData);
    }

    async getById(id) {
        return await workshopRepository.findById(id);
    }
    
    async getAll() {
        return await workshopRepository.findAll();
    }
}

module.exports = new WorkshopService();

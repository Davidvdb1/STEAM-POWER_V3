const workshopRepository = require('../repository/workshopRepository');
const bcrypt = require('bcryptjs');

class WorkshopService {
    async create(workshopData) {
        const newWorkshop = new Workshop(workshopData)
        return await workshopRepository.create(newWorkshop);
    }

    async getById(id) {
        return await workshopRepository.findById(id);
    }
    
    async getAll() {
        return await workshopRepository.findAll();
    }
}

module.exports = new WorkshopService();

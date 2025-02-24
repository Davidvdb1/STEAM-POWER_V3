const workshopRepository = require('../repository/workshopRepository');
const Workshop = require('../model/workshop');

class WorkshopService {
    async create(workshopData) {
        const newWorkshop = new Workshop(workshopData)
        return await workshopRepository.create(newWorkshop);
    }

    async update(workshopData) {
        const workshopToUpdate = await workshopRepository.findById(workshopData.id);

        const newWorkshop = new Workshop({...workshopToUpdate, ...workshopData, id: workshopToUpdate.id});
        
        return await workshopRepository.update(newWorkshop);
    }

    async getById(id) {
        return await workshopRepository.findById(id);
    }
    
    async getAll() {
        return await workshopRepository.findAll();
    }
}

module.exports = new WorkshopService();

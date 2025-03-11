const workshopRepository = require('../repository/workshopRepository');
const Workshop = require('../model/workshop');

class WorkshopService {
    async create(workshopData) {
        const newWorkshop = new Workshop(workshopData)
        return await workshopRepository.create(newWorkshop);
    }

    async update(id, updatedData) {
        const existingWorkshop = await workshopRepository.findById(id);
        if (!existingWorkshop) {
            throw new Error("Workshop niet gevonden");
        }
    
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] !== undefined) {
                existingWorkshop[key] = updatedData[key];
            }
        });
    
        return await workshopRepository.update(id, existingWorkshop);
    }

    async getById(id) {
        return await workshopRepository.findById(id);
    }
    
    async getAll() {
        return await workshopRepository.findAll();
    }

    async getByTitle(title) {
        return await workshopRepository.findByTitle(title);
    }
}

module.exports = new WorkshopService();

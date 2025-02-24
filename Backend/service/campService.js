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

    async update(campData) {
        const campToUpdate = await campRepository.findById(campData.id);

        campData.startDate = new Date(campData.startDate);
        campData.endDate = new Date(campData.endDate);

        const newCamp = new Camp({...campToUpdate, ...campData, id: campToUpdate.id});
        
        return await campRepository.update(newCamp);
    }

    async getById(id, includeWorkshops = false) {
        return await campRepository.findById(id, includeWorkshops);
    }

    async getAll(includeWorkshops = false) {
        return await campRepository.findAll(includeWorkshops);
    }
}

module.exports = new CampService();

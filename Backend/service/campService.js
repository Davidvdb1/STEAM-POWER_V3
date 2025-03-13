const campRepository = require('../repository/campRepository');
const Camp = require('../model/camp');
const Workshop = require('../model/workshop');
const workshopRepository = require('../repository/workshopRepository');


class CampService {
    async create(campData) {
        campData.startDate = new Date(campData.startDate);
        campData.endDate = new Date(campData.endDate);

        const newCamp = new Camp(campData);
        return await campRepository.create(newCamp);
    }

    async getById(id, includeWorkshops = false) {
        return await campRepository.findById(id, includeWorkshops);
    }

    async getByTitle(title, includeWorkshops = false) {
        return await campRepository.findByTitle(title, includeWorkshops);
    }

    async getAll(includeWorkshops = false) {
        return await campRepository.findAll(includeWorkshops);
    }

    async update(id, updatedData) {
        if (updatedData.startDate) updatedData.startDate = new Date(updatedData.startDate);
        if (updatedData.endDate) updatedData.endDate = new Date(updatedData.endDate);
        
        const existingCamp = await campRepository.findById(id);
        if (!existingCamp) {
            throw new Error("Kamp niet gevonden");
        }
    
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] !== undefined) {
                existingCamp[key] = updatedData[key];
            }
        });
    
        return await campRepository.update(id, existingCamp);
    }

    async delete(id) {
        const existingCamp = await campRepository.findById(id);
        if (!existingCamp) {
            throw new Error("Kamp niet gevonden");
        }
    
        return await campRepository.delete(id);
    }

    async addWorkshop(campId, workshopId) {
        return await campRepository.addWorkshop(campId, workshopId);
    }

    async getUnlinkedWorkshops(campId) {
        try {
            const workshops = await workshopRepository.findUnlinkedWorkshops(campId);
            return workshops.map(workshop => ({ title: workshop.title, id: workshop.id, campId: workshop.campId }));

        } catch (error) {
            console.error("❌ Fout bij ophalen van niet-gekoppelde workshops:", error);
            throw new Error("Databasefout bij ophalen van niet-gekoppelde workshops");
        }
    }
    
}

module.exports = new CampService();

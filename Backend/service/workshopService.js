const workshopRepository = require('../repository/workshopRepository');
const Workshop = require('../model/workshop');

class WorkshopService {
    async create(workshopData) {
        const newWorkshop = new Workshop(workshopData);
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

    async moveWorkshop(id, direction) {
        const workshop = await workshopRepository.findById(id);
        if (!workshop) {
            throw new Error("Workshop niet gevonden");
        }
        const { campId, position } = workshop;
    
    
        // 🔹 Log ALLE workshops in dit kamp vóór de update
        const allWorkshops = await workshopRepository.findWorkshopsByCamp(campId);
    
        // 🔹 Bepaal de nieuwe positie afhankelijk van de richting
        const newPosition = direction === "up" ? position - 1 : position + 1;
    
        if (newPosition < 1) {
            throw new Error("Kan niet verder omhoog, al op hoogste positie.");
        }
    
        // 🔹 Zoek de andere workshop die op deze positie staat **binnen hetzelfde kamp**
        const otherWorkshop = await workshopRepository.findWorkshopByPosition(campId, newPosition);
        if (!otherWorkshop) {
            console.error(`❌ Geen workshop gevonden op positie ${newPosition} binnen kamp ${campId}`);
            throw new Error(`Kan niet verplaatsen, geen andere workshop op positie ${newPosition} binnen dit kamp.`);
        }
    
        // 🔹 Wissel de posities in een **database-transactie** zodat er geen fouten ontstaan
        await workshopRepository.swapPositions(workshop.id, otherWorkshop.id, position, newPosition);
    
        return { message: `Workshop verplaatst ${direction}`, newPosition };
    }
    
    
    
    
    
}

module.exports = new WorkshopService();

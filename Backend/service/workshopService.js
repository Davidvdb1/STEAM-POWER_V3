const workshopRepository = require('../repository/workshopRepository');
const Workshop = require('../model/workshop');
const utility = require('../util/utility');

class WorkshopService {
    async create(workshopData) {
        try {
            const newWorkshop = new Workshop(workshopData);
            return await workshopRepository.create(newWorkshop);
        } catch (error) {
            if (error instanceof utility.ValidationError) throw error;
            throw new utility.DatabaseError(`Error creating workshop: ${error.message}`);
        }
    }
    
    async update(id, updatedData) {
        try {
            const existingWorkshop = await workshopRepository.findById(id);
            if (!existingWorkshop) {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
        
            Object.keys(updatedData).forEach(key => {
                if (updatedData[key] !== undefined) {
                    existingWorkshop[key] = updatedData[key];
                }
            });
        
            return await workshopRepository.update(id, existingWorkshop);
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error updating workshop: ${error.message}`);
        }
    }

    async getById(id) {
        try {
            const workshop = await workshopRepository.findById(id);
            if (!workshop) {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            return workshop;
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error fetching workshop: ${error.message}`);
        }
    }
    
    async getAll() {
        try {
            return await workshopRepository.findAll();
        } catch (error) {
            throw new utility.DatabaseError(`Error fetching workshops: ${error.message}`);
        }
    }

    async getByTitle(title) {
        try {
            const workshop = await workshopRepository.findByTitle(title);
            if (!workshop) {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            return workshop;
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error fetching workshop by title: ${error.message}`);
        }
    }

    async moveWorkshop(id, direction) {
        try {
            const workshop = await workshopRepository.findById(id);
            if (!workshop) {
                throw new utility.NotFoundError("Workshop niet gevonden");
            }
            const { campId, position } = workshop;
        
            // 🔹 Log ALLE workshops in dit kamp vóór de update
            const allWorkshops = await workshopRepository.findWorkshopsByCamp(campId);
        
            // 🔹 Bepaal de nieuwe positie afhankelijk van de richting
            const newPosition = direction === "up" ? position - 1 : position + 1;
        
            if (newPosition < 1) {
                throw new utility.ValidationError("Kan niet verder omhoog, al op hoogste positie.");
            }
        
            // 🔹 Zoek de andere workshop die op deze positie staat **binnen hetzelfde kamp**
            const otherWorkshop = await workshopRepository.findWorkshopByPosition(campId, newPosition);
            if (!otherWorkshop) {
                throw new utility.ValidationError(`Kan niet verplaatsen, geen andere workshop op positie ${newPosition} binnen dit kamp.`);
            }
        
            // 🔹 Wissel de posities in een **database-transactie** zodat er geen fouten ontstaan
            await workshopRepository.swapPositions(workshop.id, otherWorkshop.id, position, newPosition);
        
            return { message: `Workshop verplaatst ${direction}`, newPosition };
        } catch (error) {
            if (error instanceof utility.NotFoundError || error instanceof utility.ValidationError) throw error;
            throw new utility.DatabaseError(`Error moving workshop: ${error.message}`);
        }
    }
}

module.exports = new WorkshopService();

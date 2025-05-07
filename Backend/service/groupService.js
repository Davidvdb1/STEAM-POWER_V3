const groupRepository = require('../repository/groupRepository');
const { generateJWTtoken } = require('../util/jwt');
const Group = require('../model/group');

class GroupService {
    async create(groupData) {
        const existingGroup = await groupRepository.findByName(groupData.name);
        if (existingGroup) throw new Error('Groep met deze naam bestaat al');
        const newgroup = new Group(groupData);
        return await groupRepository.create(newgroup);
    }

    async update(groupData) {
        const groupToUpdate = await groupRepository.findById(groupData.id);

        const newGroup = new Group({ ...groupToUpdate, ...groupData, id: groupToUpdate.id });
        return await groupRepository.update(newGroup);
    }

    async addScore(id, groupData) {
        const groupToUpdate = await groupRepository.findById(id);
        if (!groupToUpdate) throw new Error('Groep niet gevonden');

        const bonusScore = groupToUpdate.bonusScore + parseInt(groupData.bonusScore);

        const newGroup = new Group({ ...groupToUpdate, bonusScore, id });
        return await groupRepository.update(newGroup);
    }

    async getById(id) {
        return await groupRepository.findById(id);
    }

    async getByCode(code) {
        return await groupRepository.findByCode(code);
    }

    async getByName(name) {
        return await groupRepository.findByName(name);
    }

    async getAll() {
        return await groupRepository.findAll();
    }

    async login(code) {
        code = code.toLowerCase();
        const group = await groupRepository.findByCode(code);
        if (!group) throw new Error('Geen groep met deze code gevonden');

        const JWT = generateJWTtoken(group.id, group.name, 'GROUP');
        const response = {
            groupId: group.id,
            token: JWT,
            name: group.name,
            microbitId: group.microbitId,
            members: group.members,
            role: 'GROUP',
        };
        return response;
    }

    async deleteById(id) {
        const group = await this.getById(id);
        if (!group) throw new Error('Groep niet gevonden');

        return await groupRepository.deleteById(id);
    }

    async changeBatteryCapacityForAllGroups(batteryCapacity) {
        return await groupRepository.changeBatteryCapacity(batteryCapacity);
    }

    async getBatteryCapacity() {
        return await groupRepository.getBatteryCapacity();
    }

    async changeEnergyMultiplierForAllGroups(energyMultiplier) {
        return await groupRepository.changeEnergyMultiplier(energyMultiplier);
    }

    async getEnergyMultiplier() {
        return await groupRepository.getEnergyMultiplier();
    }
}

module.exports = new GroupService();

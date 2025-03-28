const groupRepository = require('../repository/groupRepository');
const { generateJWTtoken } = require('../util/jwt');
const Group = require('../model/group');

class GroupService {
    async create(groupData) {
        const newgroup = new Group(groupData);
        return await groupRepository.create(newgroup);
    }

    async update(groupData) {
        const groupToUpdate = await groupRepository.findById(groupData.id);
        
        const newGroup = new Group({ ...groupToUpdate, ...groupData, id: groupToUpdate.id });
        return await groupRepository.update(newGroup);
    }

    async getById(id) {
        return await groupRepository.findById(id);
    }

    async getByCode(code) {
        return await groupRepository.findByCode(code);
    }

    async getByCode(name) {
        return await groupRepository.findByName(name);
    }

    async getAll() {
        return await groupRepository.findAll();
    }

    async login(code) {
        const group = await groupRepository.findByCode(code);
        if (!group) throw new Error('Geen groep met deze code gevonden');

        const JWT = generateJWTtoken(group.id, group.name, 'GROUP');
        const response = {
            groupId: group.id,
            token: JWT,
            name: group.name,
            role: 'GROUP',
        };
        return response;
    }

    async deleteById(id) {
        const group = await this.getById(id);
        if (!group) throw new Error('Groep niet gevonden');
        
        return await groupRepository.deleteById(id);
    }
}

module.exports = new GroupService();

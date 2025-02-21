const groupRepository = require('../repository/groupRepository');
const { generateJWTtoken } = require('../util/jwt');
const Group = require('../model/group');

class GroupService {
    async create(groupData) {
        const newgroup = new Group(groupData);
        return await groupRepository.create(newgroup);
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

        const JWT = generateJWTtoken(group.name, 'GROUP');
        const response = {
            token: JWT,
            name: group.name,
            role: 'GROUP',
        };
        return response;
    }
}

module.exports = new GroupService();

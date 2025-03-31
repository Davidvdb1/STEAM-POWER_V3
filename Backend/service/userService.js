const userRepository = require('../repository/userRepository');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const { generateJWTtoken } = require('../util/jwt');

class UserService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) throw new Error('Gebruiker met dit emailadres bestaat al');

        userData.password = await bcrypt.hash(userData.password, 10);

        const newUser = new User(userData);
        const createdUser = await userRepository.create(newUser);

        const JWT = generateJWTtoken(createdUser.id, createdUser.username, createdUser.role);
        const response = {
            userId: createdUser.id,
            token: JWT,
            username: createdUser.username,
            role: createdUser.role,
        };
        return response;
    }

    async login(userData) {
        try {
            const user = await userRepository.findByUsername(userData.username);
            if (!user) throw new Error('Gebruiker niet gevonden');

            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordValid) throw new Error('Onjuist wachtwoord');

            const JWT = generateJWTtoken(user.id, user.username, user.role);
            const response = {
                userId: user.id,
                token: JWT,
                username: user.username,
                role: user.role,
            };
            return response;
        } catch (error) {
            throw new Error('Verkeerde gebruikersnaam of wachtwoord');
        }
    }

    async getById(id) {
        return await userRepository.findById(id);
    }

    async getAll() {
        return await userRepository.findAll();
    }

    async createUser(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) throw new Error('Gebruiker met dit emailadres bestaat al');

        // Generate a random password if not provided
        if (!userData.password) {
            userData.password = Math.random().toString(36).slice(-8);
        }
        
        userData.password = await bcrypt.hash(userData.password, 10);

        const newUser = new User(userData);
        const createdUser = await userRepository.create(newUser);
        
        return { user: createdUser };
    }

    async updateUser(userData) {
        const existingUser = await userRepository.findById(userData.id);
        if (!existingUser) throw new Error('Gebruiker niet gevonden');

        // If updating email, check if it's already in use by another user
        if (userData.email && userData.email !== existingUser.email) {
            const userWithEmail = await userRepository.findByEmail(userData.email);
            if (userWithEmail && userWithEmail.id !== userData.id) {
                throw new Error('Email is al in gebruik');
            }
        }

        // If password is provided, hash it
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        const updatedUser = await userRepository.update(userData);
        return { user: updatedUser };
    }

    async deleteUser(id) {
        const existingUser = await userRepository.findById(id);
        if (!existingUser) throw new Error('Gebruiker niet gevonden');
        
        return await userRepository.delete(id);
    }
}

module.exports = new UserService();

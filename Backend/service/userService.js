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

        const JWT = generateJWTtoken(createdUser.username, createdUser.role);
        const response = {
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

            const JWT = generateJWTtoken(user.username, user.role);
            const response = {
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
}

module.exports = new UserService();

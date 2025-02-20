const userRepository = require('../repository/userRepository');
const bcrypt = require('bcryptjs');
const { generateJWTtoken } = require('../util/jwt');

class UserService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) throw new Error('User already exists');

        userData.password = await bcrypt.hash(userData.password, 10);
        const createdUser = await userRepository.create(userData);

        const JWT = generateJWTtoken(createdUser.username, createdUser.email, createdUser.role);
        const response = {
            token: JWT,
            username: createdUser.username,
            email: createdUser.email,
            role: createdUser.role,
        };
        return response;
    }

    async login(userData) {
        try {
            const user = await userRepository.findByUsername(userData.username);
            if (!user) throw new Error('User not found');

            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordValid) throw new Error('Invalid password');

            const JWT = generateJWTtoken(user.username, user.email, user.role);
            const response = {
                token: JWT,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            return response;
        } catch (error) {
            throw new Error('Incorrect username or password');
        }
    }

    async getById(id) {
        return await userRepository.findById(id);
    }
}

module.exports = new UserService();

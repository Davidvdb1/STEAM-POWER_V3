const userRepository = require('../repository/userRepository');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const { generateJWTtoken } = require('../util/jwt');
const utility = require('../util/utility');

class UserService {
    async register(userData) {
        try {
            const existingUser = await userRepository.findByEmail(userData.email);
            if (existingUser) throw new utility.ValidationError('Gebruiker met dit emailadres bestaat al');

            userData.password = await bcrypt.hash(userData.password, 10);

            const newUser = new User(userData);
            const createdUser = await userRepository.create(newUser);

            const JWT = generateJWTtoken(createdUser.id, createdUser.username, createdUser.email, createdUser.role);
            const response = {
                userId: createdUser.id,
                token: JWT,
                username: createdUser.username,
                email: createdUser.email,
                role: createdUser.role,
            };
            return response;
        } catch (error) {
            if (error instanceof utility.ValidationError) throw error;
            throw new utility.DatabaseError(`Error registering user: ${error.message}`);
        }
    }

    async login(userData) {
        try {
            const user = await userRepository.findByEmail(userData.email);
            if (!user) throw new utility.AuthenticationError('Gebruiker niet gevonden');

            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordValid) throw new utility.AuthenticationError('Onjuist wachtwoord');

            const JWT = generateJWTtoken(user.id, user.username, user.email, user.role);
            const response = {
                userId: user.id,
                token: JWT,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            return response;
        } catch (error) {
            if (error instanceof utility.AuthenticationError) throw error;
            throw new utility.AuthenticationError('Verkeerde gebruikersnaam of wachtwoord');
        }
    }

    async getById(id) {
        try {
            const user = await userRepository.findById(id);
            if (!user) throw new utility.NotFoundError('Gebruiker niet gevonden');
            return user;
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error finding user: ${error.message}`);
        }
    }

    async getAll() {
        try {
            return await userRepository.findAll();
        } catch (error) {
            throw new utility.DatabaseError(`Error fetching users: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            const existingUser = await userRepository.findByEmail(userData.email);
            if (existingUser) throw new utility.ValidationError('Gebruiker met dit emailadres bestaat al');

            // Generate a random password if not provided
            if (!userData.password) {
                userData.password = Math.random().toString(36).slice(-8);
            }
            
            userData.password = await bcrypt.hash(userData.password, 10);

            const newUser = new User(userData);
            const createdUser = await userRepository.create(newUser);
            
            return { user: createdUser };
        } catch (error) {
            if (error instanceof utility.ValidationError) throw error;
            throw new utility.DatabaseError(`Error creating user: ${error.message}`);
        }
    }

    async updateUser(userData) {
        try {
            const existingUser = await userRepository.findById(userData.id);
            if (!existingUser) throw new utility.NotFoundError('Gebruiker niet gevonden');

            // If updating email, check if it's already in use by another user
            if (userData.email && userData.email !== existingUser.email) {
                const userWithEmail = await userRepository.findByEmail(userData.email);
                if (userWithEmail && userWithEmail.id !== userData.id) {
                    throw new utility.ValidationError('Email is al in gebruik');
                }
            }

            // If password is provided, hash it
            if (userData.password) {
                userData.password = await bcrypt.hash(userData.password, 10);
            }

            const updatedUser = await userRepository.update(userData);
            return { user: updatedUser };
        } catch (error) {
            if (error instanceof utility.ValidationError || error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error updating user: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            const existingUser = await userRepository.findById(id);
            if (!existingUser) throw new utility.NotFoundError('Gebruiker niet gevonden');
            
            return await userRepository.delete(id);
        } catch (error) {
            if (error instanceof utility.NotFoundError) throw error;
            throw new utility.DatabaseError(`Error deleting user: ${error.message}`);
        }
    }
}

module.exports = new UserService();

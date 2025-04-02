const express = require('express');
const userService = require('../service/userService');
const utility = require('../util/utility');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const JWT = await userService.register(req.body);
        res.status(200).json({ message: 'User created', JWT });
    } catch (error) {
        console.error('Error registering user:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.post('/login', async (req, res) => {
    try {
        const JWT = await userService.login(req.body);
        res.status(200).json({ message: 'Succesvol ingelogd', JWT})
    } catch (error) {
        console.error('Error logging in user:', error);
        const statusCode = error.statusCode || 401;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await userService.getById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await userService.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.status(201).json({ message: 'Gebruiker succesvol aangemaakt', user: result.user });
    } catch (error) {
        console.error('Error creating user:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.put('/', async (req, res) => {
    try {
        const result = await userService.updateUser(req.body);
        res.status(200).json({ message: 'Gebruiker succesvol bijgewerkt', user: result.user });
    } catch (error) {
        console.error(`Error updating user ${req.body.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ message: 'Gebruiker succesvol verwijderd' });
    } catch (error) {
        console.error(`Error deleting user ${req.params.id}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

module.exports = router;

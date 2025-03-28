const express = require('express');
const userService = require('../service/userService');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const JWT = await userService.register(req.body);
        res.status(200).json({ message: 'User created', JWT });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.post('/login', async (req, res) => {
    try {
        const JWT = await userService.login(req.body);
        res.status(200).json({ message: 'Succesvol ingelogd', JWT})
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await userService.getById(req.params.id);
        if (!user) return res.status(400).json({ error: 'Gebruiker niet gevonden' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await userService.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.status(201).json({ message: 'Gebruiker succesvol aangemaakt', user: result.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/', async (req, res) => {
    try {
        const result = await userService.updateUser(req.body);
        res.status(200).json({ message: 'Gebruiker succesvol bijgewerkt', user: result.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ message: 'Gebruiker succesvol verwijderd' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

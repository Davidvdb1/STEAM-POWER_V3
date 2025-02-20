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

module.exports = router;

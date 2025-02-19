const express = require('express');
const userService = require('../service/userService');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const user = await userService.register(req.body);
        res.status(200).json({ message: 'User created', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(400).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;

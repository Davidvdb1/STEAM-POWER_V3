const express = require('express');
require('dotenv').config();
const userRoutes = require('./controller/userController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRoutes);

app.get('/status', (req, res) => {
    res.send(`Server is running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const { expressjwt } = require('express-jwt');
require('dotenv').config();
const userRoutes = require('./controller/userController');
const campRoutes = require('./controller/campController');
const workshopRoutes = require('./controller/workshopController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
    expressjwt({
        secret: process.env.JWT_SECRET || 'default_secret',
        algorithms: ['HS256'],
    }).unless({
        path: ['/users/login', '/users/register', '/status', /^\/.*/], // last regex matches all routes
        // path: ['/users/login', '/users/register', '/status']
    })
);

app.use('/users', userRoutes);
app.use('/camps', campRoutes);
app.use('/workshops', workshopRoutes);

app.get('/status', (req, res) => {
    res.send(`Server is running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

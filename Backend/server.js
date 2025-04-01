const express = require('express');
const { expressjwt } = require('express-jwt');
const dotenv = require('dotenv');
const helmet = require('helmet');
const userRoutes = require('./controller/userController');
const campRoutes = require('./controller/campController');
const workshopRoutes = require('./controller/workshopController');
const groupRoutes = require('./controller/groupController');
const energyDataRoutes = require('./controller/energyDataController');
const questionsRoutes = require('./controller/questionController');


const app = express();
const cors = require('cors');
dotenv.config();
app.use(helmet());

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(
    expressjwt({
        secret: process.env.JWT_SECRET || 'default_secret',
        algorithms: ['HS256'],
    }).unless({
        path: ['/users/login', '/users/register', '/status', /^\/.*/], // last regex matches all routes
    })
);


app.use(cors({
    origin: '*', // Allow all origins
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use('/users', userRoutes);
app.use('/camps', campRoutes);
app.use('/workshops', workshopRoutes);
app.use('/groups', groupRoutes);
app.use('/energydata', energyDataRoutes);
app.use('/questions', questionsRoutes);

app.get('/status', (req, res) => {
    res.send(`Server is running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

require('dotenv').config();
const jwt = require('jsonwebtoken'); // Fix the require statement

const generateJWTtoken = (username, email, role) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = `${process.env.JWT_EXPIRES_HOURS}h`;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined.');
    };

    return jwt.sign({ username, email, role }, secret, { expiresIn: expiresIn });
}

module.exports = { generateJWTtoken };
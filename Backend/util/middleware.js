const { expressjwt } = require('express-jwt');

class Middleware {
    static requireRole(roles) {
        // Convert single role to array if it's a string
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        return [
            this.requireJWT(),
            (req, res, next) => {
                const userRole = req.auth?.role;
                if (!allowedRoles.includes(userRole)) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
                next();
            }
        ];
    }

    static requireUserId(Id) {
        return [
            this.requireJWT(),
            (req, res, next) => {
                const userId = req.auth?.id;
                if (userId !== Id) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
                next();
            }
        ];
    }
    
    static requireJWT() {
        return expressjwt({
            secret: process.env.JWT_SECRET || 'default_secret',
            algorithms: ['HS256']
        });
    }
}

module.exports = Middleware;
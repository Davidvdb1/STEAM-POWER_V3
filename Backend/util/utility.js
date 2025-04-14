class utility {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Error classes for better error handling
    static get ValidationError() {
        return class ValidationError extends Error {
            constructor(message) {
                super(message);
                this.name = 'ValidationError';
                this.statusCode = 400;
            }
        };
    }

    static get NotFoundError() {
        return class NotFoundError extends Error {
            constructor(message) {
                super(message);
                this.name = 'NotFoundError';
                this.statusCode = 404;
            }
        };
    }

    static get AuthenticationError() {
        return class AuthenticationError extends Error {
            constructor(message) {
                super(message);
                this.name = 'AuthenticationError';
                this.statusCode = 401;
            }
        };
    }

    static get DatabaseError() {
        return class DatabaseError extends Error {
            constructor(message) {
                super(message);
                this.name = 'DatabaseError';
                this.statusCode = 500;
            }
        };
    }
}

module.exports = utility;

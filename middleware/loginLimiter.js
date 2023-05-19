const rateLimit = require('express-rate-limit');
const {logEvents} = require('./logger');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again in 60 seconds.',
    handler: (req, res) => {
        logEvents.emit('warn', 'Too many login attempts');
        res.status(429).json({message: 'Too many login attempts. Please try again in 60 seconds.'});
    }
});

module.exports = loginLimiter;
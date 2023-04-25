const jwt = require('jsonwebtoken');
const dev = require('../config');

const isLoggedIn = (req, res, next) => {
    try {
        if(!req.headers.cookie){
            return res.status(404).send({
                message: 'no cookie found',
            });
        }

        const token = req.headers.cookie.split('=')[1];

        if(!token){
            return res.status(404).send({
                message: 'no token found',
            });
        }
    

        jwt.verify(
            token, String(dev.app.jwtAuthorizationKey),
            async(err, user) => {
                if (err) {
                    return res.status(403).json({
                        message: 'invalid token',
                    });
                }
                req.id = user.id
                next();
            }
        );
        

    } catch (error) {
        res.send({ message: error.message });
    }
};

module.exports = isLoggedIn;
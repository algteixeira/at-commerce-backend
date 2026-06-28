const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        const tokenParts = authorization.split(' ');
        if (!tokenParts || (tokenParts[0] !== 'Bearer')) {
            return res.status(401).json({
                error: 'INVALID TOKEN',
                message: 'The token format is not valid.'
            })
        }
        const decodedUser = jwt.verify(tokenParts[1], JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'The token is invalid or expired.'
        });
    }

}

module.exports = { authMiddleware };
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;

export const checkJwt = (req, res, next) => {
    const token = req.headers['auth'];
    let jwtPayload;

    // Verify the token.
    try {
        jwtPayload = verify(token, process.env.TOKEN_KEY);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        console.log(error);
        res.status(401).send('invalid token');
        return;
    }

    const { userId } = jwtPayload;

    // Issue a new token.
    const issued = Date.now();
    const tokenExpiration = +process.env.TOKEN_EXPIRATION ?? 12; // Expiration in hours. Defaults to 12.
    const expirationInMs = tokenExpiration*3600000;
    const expireTime = issued + expirationInMs;
    const expireLength = tokenExpiration + 'h';
    const newToken = sign({ userId }, process.env.TOKEN_KEY, {
        expiresIn: expireLength
    });
    res.setHeader('issued', issued);
    res.setHeader('expires', expireTime);
    res.setHeader('token', newToken);

    next()
}
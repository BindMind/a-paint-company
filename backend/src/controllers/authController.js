import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import bcryptjs from 'bcryptjs';
const { compareSync: hashCompareSync, hash } = bcryptjs;

/**
 * Controller for any process that involves the credentials and account of the user.
 * 
 * @class
 */
export default class AuthController {

    /**
     * Adds a new user to the database.
     * 
     * @param req.body.username
     * @param req.body.password
     * 
     * @return 201 Account added to database.
     * @return 400 User provided invalid input, or their password could not be hashed properly.
     * @return 409 User is registering with a username that is already in use.
     */
    static register = async (req, res) => {
        let statusCode = 0;

        try {
            // Get input
            console.log(req.body);
            const { username, password } = req.body;
        
            // Validate input
            if (!(username && password)) {
              res.status(400).send('All input is required');
              return 400;
            }
        } catch (error) {
            console.log(error);
            res.status(400).send('Error validating input.');
            return 400;
        }

        const { username, password } = req.body;
        hash(password, +process.env.HASH_SALT_ROUNDS, function(error, hash) {
            if (error) {
                console.log(error);
                res.status(400).send();
                statusCode = 400;
                return;
            }
            const db = req.app.get('db');
            (async () => {
                try {
                    let statement = await db.prepare('INSERT INTO users(username, password) VALUES(@username, @password) RETURNING id');
                    const result = await statement.get({ '@username': username, '@password': hash })

                    console.log('Created account with username: ' + username);
                    res.status(201).send('Account created.');
                    statusCode = 201;
                } catch(error) {
                    console.log(error)
                    res.status(400).send('Error registering user.');
                    return 400;
                }
            })()
        });

        return statusCode;
    }

    /**
     * Compares the provided login details against the database, and provides a JSON Web Token if the details are valid.
     * 
     * @param req.body.email
     * @param req.body.password
     * 
     * @return 200 Sends a JSON containing details for the login, as well as the JWT.
     * @return 400 User input is invalid.
     * @return 401 No matching username and password found.
     */
    static login = async (req, res) => {
        let statusCode = 0;

        try {
            // Get input.
            const { username, password } = req.body;
        
            // Validate input.
            if (!(username && password)) {
              res.status(400).send("All input is required.");
              return 400;
            }
            
        } catch (error) {
            console.log(error);
            res.status(400).send("All input is required.");
            return 400;
        }

        // Get the hashed password.
        const { username, password } = req.body;
        const db = req.app.get('db');
        try {
            let statement = await db.prepare('SELECT password, id, editor FROM users WHERE username = @username');
            const result = await statement.get({ '@username': username })
            if (result) {
                // Compare hash and password
                let hash = result['password'];
                let compareResult = hashCompareSync(password, hash);
                if (!compareResult) {
                    res.status(401).send('Email and password do not match or this account does not exist.');
                    statusCode = 401;
                    return;
                }

                // Sign JWT.
                const userId = result['id'];
                const editor = result['editor'];
                const tokenExpiration = +process.env.TOKEN_EXPIRATION
                const issued = Date.now();
                const expirationInMs = +tokenExpiration*3600000;
                const expireTime = issued + expirationInMs;
                const expireLength = tokenExpiration + 'h';
                const token = sign(
                    { userId, editor },
                    process.env.TOKEN_KEY,
                    { expiresIn: expireLength}
                )

                // Send the token.
                res.send({
                    issued: issued,
                    expires: expireTime,
                    token: token,
                    editor: editor
                });
                console.log('Sent token for: ' + username);
                statusCode = 200;
            } else {
                res.status(401).send('Email and password do not match or this account does not exist.');
                statusCode = 401;
                return;
            }
        } catch(error) {
            console.log(error)
            res.status(400).send();
            statusCode = 400;
        }

        return statusCode;
    }
}
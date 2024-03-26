/**
 * Controller for any process that involves altering accounts.
 * 
 * @class
 */
export default class PermissionController {
    /**
     * Returns a list of users, their account activation status, and whether they are an editor.
     * 
     * @return 200 A list of users was sent.
     * @return 403 User does not have permission to view the user list.
     * @return 404 There was an error in the database, and no list was found.
     */
    static list = async (req, res) => {
        let statusCode = 0;

        const db = req.app.get('db');
        const { userId } = res.locals.jwtPayload;
        admin = PermissionController.checkAdmin(userId, db);
        if (admin != 1) {
            // If user is not an editor, deny access.
            res.status(403).send();
            return 403;
        }
        
        try {
            let statement = await db.prepare('SELECT userId, username, editor, activated FROM users');
            const result = await statement.all();

            if (result && result.length !== 0) {
                res.status(200).send(result);
                statusCode = 200;
            } else {
                res.status(404).send();
                statusCode = 404;
            }
        } catch(error) {
            console.log(error)
            res.status(404).send();
            statusCode = 404;
        }

        return statusCode;
    }

    /**
     * Sets the activation status of an associated account.
     * @param req.body.activated Boolean for wether the account is activated.
     * 
     * @return 201 The account activation status was changed.
     * @return 400 Invalid input.
     * @return 403 User does not have permission to alter permissions.
     * @return 404 User not found.
     */
    static activate = async (req, res) => {
        let statusCode = 0;

        try {
            // Get input
            const { activated } = req.body;
        
            // Validate input
            if (!activated) {
              res.status(400).send('All input is required');
              return 400;
            }
        } catch (error) {
            console.log(error);
            res.status(400).send('Error validating input.');
            return 400;
        }

        const db = req.app.get('db');
        const { userId } = res.locals.jwtPayload;
        admin = PermissionController.checkAdmin(userId, db);
        if (admin != 1) {
            // If user is not an editor, deny access.
            res.status(403).send();
            return 403;
        }
        
        try {
            let statement = await db.prepare('UPDATE users SET activated = @activated WHERE id = @id RETURNING activated');
            const result = await statement.get({ '@id': userid, '@activated': activated });

            if (result && result.length !== 0) {
                res.status(201).send(result);
                statusCode = 201;
            } else {
                res.status(404).send();
                statusCode = 404;
            }
        } catch(error) {
            console.log(error)
            res.status(404).send();
            statusCode = 404;
        }

        return statusCode;
    }

    /**
     * Sets the editor status of an associated account.
     * @param req.body.editor Boolean for wether the account is an editor.
     * 
     * @return 201 The account editor status was changed.
     * @return 400 Invalid input.
     * @return 403 User does not have permission to alter permissions.
     * @return 404 User not found.
     */
    static modifyEditor = async (req, res) => {
        let statusCode = 0;

        try {
            // Get input
            const { editor } = req.body;
        
            // Validate input
            if (!editor) {
              res.status(400).send('All input is required');
              return 400;
            }
        } catch (error) {
            console.log(error);
            res.status(400).send('Error validating input.');
            return 400;
        }

        const db = req.app.get('db');
        const { userId } = res.locals.jwtPayload;
        admin = PermissionController.checkAdmin(userId, db);
        if (admin != 1) {
            // If user is not an editor, deny access.
            res.status(403).send();
            return 403;
        }
        
        try {
            let statement = await db.prepare('UPDATE users SET editor = @editor WHERE id = @id RETURNING editor');
            const result = await statement.get({ '@id': userid, '@editor': editor });

            if (result && result.length !== 0) {
                res.status(201).send(result);
                statusCode = 201;
            } else {
                res.status(404).send();
                statusCode = 404;
            }
        } catch(error) {
            console.log(error)
            res.status(404).send();
            statusCode = 404;
        }

        return statusCode;
    }
    
    /**
     * Checks if the specified user ID is an admin.
     * @param userId Integer ID for an associated account.
     * @param db Database object.
     * @returns 
     */
    static checkAdmin = async (userId, db) => {
        try {
            let statement = await db.prepare('SELECT admin FROM users WHERE id = @id');
            const result = await statement.get({ '@id': userId });

            if (result['admin']) {
                return result['admin'];
            } else {
                return null;
            }
        } catch(error) {
            console.log(error)
            return null;
        }
    }
}
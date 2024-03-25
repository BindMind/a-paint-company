/**
 * Controller for any process that involves the stock of paint.
 * 
 * @class
 */
export default class StockController {

    /**
     * Returns a list of paint, their stock, and their associated color code in hexadecimal.
     * 
     * @return 200 A list of paint was sent.
     * @return 404 There was an error in the database, and no list was found.
     */
    static list = async (req, res) => {
        let statusCode = 0;

        const db = req.app.get('db');
        const { userId } = res.locals.jwtPayload;
        const permissions = await StockController.checkPermissions(userId, db);
        
        try {
            let statement = await db.prepare('SELECT color, stock, colorcode FROM paintstock');
            const result = await statement.all();

            if (result && result.length !== 0) {
                res.status(200).send({
                    "permissions": permissions,
                    "list": result
                });
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
     * Adjusts the stock of a specified paint in the database.
     * 
     * @param req.body.color The color of paint to update.
     * @param req.body.stock The stock of the specified color of paint.
     * 
     * @return 201 The stock was updated.
     * @return 400 Invalid input.
     * @return 403 User lacks permission to edit.
     * @return 404 No paint found.
     */
    static adjust = async (req, res) => {
        let statusCode = 0;

        try {
            // Get input
            const { color, amount } = req.body;
        
            // Validate input
            if (!(color && amount)) {
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
        const permissions = StockController.checkPermissions(userId, db);
        if (permissions['editor'] != 1) {
            // If user is not an editor, deny access.
            res.status(403).send();
            return 403;
        }
        
        try {
            let statement = await db.prepare('UPDATE paintstock SET stock = @amount WHERE color = @color RETURNING stock');
            const result = await statement.get({ '@color': color, '@amount': amount });

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
     * Checks if the specified user ID is an editor.
     */
    static checkPermissions = async (userId, db) => {
        try {
            let statement = await db.prepare('SELECT editor, admin FROM users WHERE id = @id');
            const result = await statement.get({ '@id': userId });

            if (result && result.length !== 0) {
                return result;
            } else {
                return null;
            }
        } catch(error) {
            console.log(error)
            return null;
        }
    }
}
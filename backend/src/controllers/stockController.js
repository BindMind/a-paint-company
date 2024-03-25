/**
 * Controller for any process that involves the stock of paint.
 * 
 * @class
 */
export default class AuthController {

    /**
     * Returns a list of paint, their stock, and their associated color code in hexadecimal.
     * 
     * @return 200 A list of paint was sent.
     * @return 404 There was an error in the database, and no list was found.
     */
        static list = async (req, res) => {
            let statusCode = 0;

            const db = req.app.get('db');
            
            try {
                let statement = await db.prepare('SELECT color, stock, colorcode FROM paintstock');
                const result = await statement.all();

                if (result) {
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
}
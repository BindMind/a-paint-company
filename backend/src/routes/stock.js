import StockController from "../controllers/stockController.js";
import { Router } from 'express';
import { checkJwt } from "../middleware/checkJwt.js";

const stockRouter = Router();

stockRouter.get('/list', StockController.list);

//stockRouter.post('/adjust/:color', [checkJwt], StockController.adjust);

export default stockRouter;
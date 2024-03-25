import { Router } from "express";
import authRouter from "./auth.js";
import stockRouter from "./stock.js";

const routes = Router();

routes.use('/auth', authRouter);

routes.use('/stock', stockRouter);

export default routes;
import AuthController from "../controllers/authController.js";
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/register', AuthController.register);

authRouter.post('/login', AuthController.login);

export default authRouter;
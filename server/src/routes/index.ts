import { Router } from 'express';
import IndexController from '../controllers';
import { ExercisesController } from '../controllers/exercises';
import { AuthController } from '../controllers/users';

const router = Router();
const indexController = new IndexController();
const authController = new AuthController();

export function setRoutes(app: Router) {
    app.get('/', indexController.getIndex.bind(indexController));

    const exercisesController = new ExercisesController();
    app.get(
        '/exercises',
        exercisesController.getPaginatedExercises.bind(exercisesController),
    );

    app.post('/users/register', (req, res, next) => {
        authController.register(req, res).catch(next);
    });
    app.post('/users/login', (req, res, next) => {
        authController.login(req, res).catch(next);
    });
    app.post('/users/refresh-token', (req, res) => {
        authController.refreshToken(req, res);
    });
    // Logout endpoint
    app.post('/users/logout', (req, res) => authController.logout(req, res));
}

export default router;

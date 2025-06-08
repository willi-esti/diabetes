import { Router } from 'express';
import IndexController from '../controllers';
import { ExercisesController } from '../controllers/exercises';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: Router) {
    app.get('/', indexController.getIndex.bind(indexController));

    const exercisesController = new ExercisesController();
    app.get(
        '/exercises',
        exercisesController.getPaginatedExercises.bind(exercisesController),
    );
}

export default router;

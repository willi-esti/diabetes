import { Router } from 'express';
import IndexController from '../controllers';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: Router) {
  app.get('/', indexController.getIndex.bind(indexController));

  app.get('/exercises', (req, res) => {
    res.json({
      message: 'List of exercises will be here',
    });
  });
}

export default router;

import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/health', async (_request: Request, response: Response) => {
  return response.status(200).send({ message: 'ok' });
});

export default router;

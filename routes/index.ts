import express from 'express';

const router = express.Router();

router.get('/health', (_request, response) =>
  response.status(200).send({ message: 'ok' })
);

export default router;

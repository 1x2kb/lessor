import { stdout } from 'process';
import createError from 'http-errors';
import express, {Request, Response, NextFunction} from 'express';
import logger from 'morgan';

import root from './routes';
import numbers, { twilioInit } from './routes/numbers';

const app = express();

app.set('external-base-url', process.env.EXTERNAL_BASE_URL);

twilioInit(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

app.use(logger(stdout.isTTY ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const router = express.Router();
router.get('/', (_request: Request, response: Response) => {
  return response.status(200).send({ message: 'barf is live' });
});

app.use('/', root);
app.use('/numbers', numbers);

// catch 404 and forward to error handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404))
});

// error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send();
  // res.render('error');
});

export default app;
